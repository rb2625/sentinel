from fastapi import APIRouter
from typing import Optional
import httpx
from ..sentinel.config import get_settings

router = APIRouter()
settings = get_settings()


async def send_telegram_alert(message: str) -> bool:
    """Send an alert via Telegram bot."""
    if not settings.telegram_bot_token or not settings.telegram_chat_id:
        return False
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage",
                json={
                    "chat_id": settings.telegram_chat_id,
                    "text": message,
                    "parse_mode": "HTML",
                },
            )
            return response.status_code == 200
    except Exception:
        return False


@router.post("/send")
async def send_alert(severity: str, summary: str, incident_type: str,
                     location: str = "", dispatch_channel: str = "telegram"):
    """Send an alert through the specified channel."""
    message = (
        f"<b>SENTINEL Alert [{severity.upper()}]</b>\n\n"
        f"<b>Type:</b> {incident_type}\n"
        f"<b>Location:</b> {location}\n"
        f"<b>Summary:</b> {summary}\n\n"
        f"Validated by CAMARA network intelligence."
    )
    sent = False
    if dispatch_channel == "telegram":
        sent = await send_telegram_alert(message)
    return {"sent": sent, "channel": dispatch_channel, "message": message}


@router.get("/list")
async def list_alerts(limit: int = 20):
    """List recent alerts."""
    return {"alerts": [], "total": 0}
