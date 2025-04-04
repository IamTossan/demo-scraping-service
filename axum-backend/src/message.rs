use anyhow::{Result, anyhow};
use async_nats::Subject;
use serde::{Deserialize, Serialize};
use serde_json;
use std::fmt::Debug;
use std::sync::Arc;

use crate::state::AppState;

#[derive(Debug, Deserialize)]
struct MessageContent<T> {
    pub event_name: String,
    pub payload: T,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ScrapingTaskCreatedPayload {
    pub task_id: String,
    pub target_domain: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ScrapingTaskFinishedPayload {
    pub task_id: String,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct OldDocumentsRemovedPayload {
    pub current_task_id: String,
}

#[derive(Debug)]
pub enum Message {
    ScrapingTaskCreated(MessageContent<ScrapingTaskCreatedPayload>),
    ScrapingTaskFinished(MessageContent<ScrapingTaskFinishedPayload>),
    OldDocumentsRemoved(MessageContent<OldDocumentsRemovedPayload>),
}

impl Message {
    pub fn new(event_name: String, payload: &[u8]) -> Result<impl MessageHandler + Debug> {
        match event_name.split(".").last() {
            Some("scraping_task_finished") => {
                let payload = serde_json::from_slice::<ScrapingTaskFinishedPayload>(payload)?;
                return Ok(Self::ScrapingTaskFinished(MessageContent {
                    event_name,
                    payload,
                }));
            }
            Some("scraping_task_created") => {
                let payload = serde_json::from_slice::<ScrapingTaskCreatedPayload>(payload)?;
                return Ok(Self::ScrapingTaskCreated(MessageContent {
                    event_name,
                    payload,
                }));
            }
            Some(unsupported_event) => {
                return Err(anyhow::anyhow!(
                    "Event name {unsupported_event} not supported"
                ));
            }
            None => return Err(anyhow!("Error parsing the event_name {event_name}")),
        }
    }
}

pub trait MessageHandler {
    fn handle(
        &self,
        state: Arc<AppState>,
    ) -> impl std::future::Future<Output = Result<()>> + std::marker::Send;
}

impl MessageHandler for Message {
    async fn handle(&self, state: Arc<AppState>) -> Result<()> {
        match self {
            Message::ScrapingTaskFinished(message) => {
                sqlx::query(
                    r#"
                        with old_tasks as (
                            select
                                id
                            from scraping_task
                            where
                                id != $1::uuid
                                and status = 'FINISHED'
                                and "targetDomain" = (select "targetDomain" from scraping_task where id = $1::uuid)
                        )
                        delete from document
                        where "taskId" = any(select id from old_tasks)
                    "#)
                    .bind(&message.payload.task_id)
                    .fetch_all(&(state.pg_client))
                    .await.map_err(|e| tracing::warn!("error deleting old documents {:?}", e))
                    .ok();
                state
                    .nats_client
                    .publish(
                        Subject::from("event.old_documents_removed"),
                        serde_json::to_vec(&OldDocumentsRemovedPayload {
                            current_task_id: message.payload.task_id.clone(),
                        })
                        .unwrap()
                        .into(),
                    )
                    .await
                    .map_err(|e| {
                        tracing::warn!("error publishing old_documents_removed event {:?}", e)
                    })
                    .ok();
                return Ok(());
            }
            _ => Ok(()),
        }
    }
}
