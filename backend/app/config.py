import json
import logging
from urllib.parse import quote_plus

import boto3
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


def _fetch_rds_secret(secret_arn: str) -> dict:
    client = boto3.client("secretsmanager")
    response = client.get_secret_value(SecretId=secret_arn)
    return json.loads(response["SecretString"])


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/interview_hub"
    SECRET_KEY: str = "interview-hub-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 10

    # AWS RDS configuration
    DB_HOST: str | None = None
    DB_PORT: int = 5432
    DB_NAME: str | None = None
    DB_SECRET_ARN: str | None = None

    class Config:
        env_file = ".env"

    def get_database_url(self) -> str:
        if not self.DB_SECRET_ARN:
            return self.DATABASE_URL

        secret = _fetch_rds_secret(self.DB_SECRET_ARN)
        username = secret["username"]
        password = secret["password"]
        host = self.DB_HOST or secret.get("host", "localhost")
        port = self.DB_PORT or secret.get("port", 5432)
        db_name = self.DB_NAME or secret.get("dbname", "interviewhub")

        return f"postgresql+asyncpg://{quote_plus(username)}:{quote_plus(password)}@{host}:{port}/{db_name}"


settings = Settings()
