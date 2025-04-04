use anyhow::Result;
use async_nats;
use dotenvy;
use sqlx::postgres::PgPoolOptions;
use std::sync::Arc;

#[derive(Debug)]
pub struct EnvConfig {
    pub nats_url: String,
    pub postgres_url: String,
}

impl EnvConfig {
    pub fn from_env() -> Result<Self> {
        dotenvy::dotenv()?;

        Ok(Self {
            nats_url: dotenvy::var("NATS_URL").expect("expected NATS_URL env to exist"),
            postgres_url: dotenvy::var("POSTGRES_URL").expect("expected POSTGRES_URL env to exist"),
        })
    }
}

pub struct AppState {
    pub nats_client: async_nats::Client,
    pub pg_client: sqlx::postgres::PgPool,
}

impl AppState {
    pub async fn new(env: EnvConfig) -> Result<Arc<Self>> {
        let pg_pool = PgPoolOptions::new()
            .max_connections(5)
            .acquire_timeout(std::time::Duration::from_secs(3))
            .connect(&(env.postgres_url))
            .await
            .expect("can't connect to database");

        Ok(Arc::new(Self {
            nats_client: async_nats::connect(env.nats_url).await?,
            pg_client: pg_pool,
        }))
    }
}
