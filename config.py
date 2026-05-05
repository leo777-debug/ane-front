import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "ane-secret")
    DEBUG = os.environ.get("DEBUG", "false").lower() == "true"

    # OpenRouter (primary LLM gateway)
    OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
    OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

    # Fallback model chain — free/cheap models in priority order
    OPENROUTER_MODELS = [
        "meta-llama/llama-3.1-8b-instruct:free",
        "mistralai/mistral-7b-instruct:free",
        "google/gemma-2-9b-it:free",
        "microsoft/phi-3-mini-128k-instruct:free",
        "qwen/qwen-2-7b-instruct:free",
    ]

    # Optional direct fallback (e.g. Anthropic, OpenAI)
    FALLBACK_API_KEY = os.environ.get("FALLBACK_API_KEY", "")
    FALLBACK_BASE_URL = os.environ.get("FALLBACK_BASE_URL", "https://api.openai.com/v1")
    FALLBACK_MODEL = os.environ.get("FALLBACK_MODEL", "gpt-4o-mini")

    # Zep memory (optional)
    ZEP_API_KEY = os.environ.get("ZEP_API_KEY", "")

    # Simulation defaults
    DEFAULT_AGENT_COUNT = int(os.environ.get("DEFAULT_AGENT_COUNT", "20"))
    MAX_AGENT_COUNT = int(os.environ.get("MAX_AGENT_COUNT", "100"))

    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")
