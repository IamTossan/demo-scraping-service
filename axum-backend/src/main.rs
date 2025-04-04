use crate::message::Message;
use crate::state::{AppState, EnvConfig};
use anyhow::Result;
use axum::{Router, routing::get};
use futures::stream::StreamExt;
use message::MessageHandler;
use std::str;

mod message;
mod state;

#[tokio::main]
async fn main() -> Result<()> {
    let env = EnvConfig::from_env()?;

    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::TRACE)
        .init();

    let state = AppState::new(env).await?;

    let subscriber = state
        .nats_client
        .queue_subscribe("event.scraping_task_finished", "scraping_dev".into())
        .await?;
    let cloned_state = state.clone();
    tokio::spawn(async move {
        subscriber
            .for_each_concurrent(1, |message| {
                let state = cloned_state.clone();
                async move {
                    match Message::new(message.subject.to_string(), &message.payload) {
                        Ok(parsed_message) => {
                            parsed_message.handle(state).await.unwrap();
                        }
                        Err(err) => tracing::warn!("{err}"),
                    }
                    tracing::debug!(
                        "Received message: {}|{}",
                        &message.subject.as_str(),
                        std::str::from_utf8(&message.payload).unwrap()
                    );
                }
            })
            .await;
    });

    let app = Router::new().route("/", get(root)).with_state(state);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:4000").await?;
    tracing::debug!("Listening on port {}", listener.local_addr().unwrap());

    axum::serve(listener, app).await?;
    Ok(())
}

async fn root() -> &'static str {
    "Hello, world!"
}
