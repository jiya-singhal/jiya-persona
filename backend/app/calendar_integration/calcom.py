"""Cal.com API v2 client.

Two operations the agent uses:
  - get_availability(start_date, end_date, timezone) → list of ISO slots
  - book_meeting(slot_start, attendee_name, attendee_email, notes) → confirmation

Endpoints verified against the live API (event type 5575186, "Interview with Jiya"):
  - GET  https://api.cal.com/v2/slots         (cal-api-version: 2024-09-04)
  - POST https://api.cal.com/v2/bookings      (cal-api-version: 2024-08-13)
"""

import logging
from typing import Any

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

BASE_URL = "https://api.cal.com/v2"
SLOTS_API_VERSION = "2024-09-04"
BOOKINGS_API_VERSION = "2024-08-13"

DEFAULT_TZ = "Asia/Kolkata"
MAX_SLOTS_RETURNED = 5


class CalcomError(Exception):
    pass


def _headers(api_version: str) -> dict[str, str]:
    if not settings.calcom_api_key:
        raise CalcomError("CALCOM_API_KEY not set")
    return {
        "Authorization": f"Bearer {settings.calcom_api_key}",
        "cal-api-version": api_version,
        "Content-Type": "application/json",
    }


async def get_availability(
    start_date: str,
    end_date: str,
    timezone: str = DEFAULT_TZ,
    max_slots: int = MAX_SLOTS_RETURNED,
) -> list[str]:
    """Return up to `max_slots` available ISO timestamps in the requested window."""
    if not settings.calcom_event_type_id:
        raise CalcomError("CALCOM_EVENT_TYPE_ID not set")

    params = {
        "eventTypeId": settings.calcom_event_type_id,
        "start": start_date,
        "end": end_date,
        "timeZone": timezone,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(
            f"{BASE_URL}/slots",
            headers=_headers(SLOTS_API_VERSION),
            params=params,
        )

    if resp.status_code != 200:
        raise CalcomError(f"slots error {resp.status_code}: {resp.text[:200]}")

    body = resp.json()
    days: dict[str, list[dict[str, Any]]] = body.get("data") or {}

    slots: list[str] = []
    for _date in sorted(days.keys()):
        for slot in days[_date]:
            start = slot.get("start")
            if start:
                slots.append(start)
            if len(slots) >= max_slots:
                return slots
    return slots


async def book_meeting(
    slot_start: str,
    attendee_name: str,
    attendee_email: str,
    notes: str = "",
    timezone: str = DEFAULT_TZ,
) -> dict[str, Any]:
    """Book a real meeting. Returns {event_id, confirmation_url, meeting_url, success}."""
    if not settings.calcom_event_type_id:
        raise CalcomError("CALCOM_EVENT_TYPE_ID not set")

    payload = {
        "start": slot_start,
        "eventTypeId": int(settings.calcom_event_type_id),
        "attendee": {
            "name": attendee_name,
            "email": attendee_email,
            "timeZone": timezone,
        },
    }
    if notes:
        payload["bookingFieldsResponses"] = {"notes": notes}

    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.post(
            f"{BASE_URL}/bookings",
            headers=_headers(BOOKINGS_API_VERSION),
            json=payload,
        )

    if resp.status_code not in (200, 201):
        raise CalcomError(f"booking error {resp.status_code}: {resp.text[:300]}")

    body = resp.json()
    data = body.get("data") or {}
    uid = data.get("uid", "")
    return {
        "success": True,
        "event_id": data.get("id"),
        "uid": uid,
        "confirmation_url": f"https://app.cal.com/booking/{uid}" if uid else None,
        "meeting_url": data.get("meetingUrl") or data.get("location"),
        "start": data.get("start"),
        "end": data.get("end"),
    }


async def cancel_booking(uid: str, reason: str = "Test cleanup") -> bool:
    """Used only for smoke-test cleanup."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            f"{BASE_URL}/bookings/{uid}/cancel",
            headers=_headers(BOOKINGS_API_VERSION),
            json={"cancellationReason": reason},
        )
    if resp.status_code not in (200, 201):
        logger.warning(f"cancel failed {resp.status_code}: {resp.text[:200]}")
        return False
    return True
