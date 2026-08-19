from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    nokia_nac_api_key: str = ""
    nokia_nac_base_url: str = "https://networkascode.nokia.io"
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    groq_api_key: str = ""
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""
    app_url: str = "http://localhost:3000"

    class Config:
        env_file = "../.env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
