"""Internal booking endpoints — used by chat agent (Phase 3) and Vapi webhook (Phase 5)."""

import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from app.calendar_integration.calcom import (
    CalcomError,
    book_meeting,
    get_availability,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/booking", tags=["booking"])


class AvailabilityBody(BaseModel):
    start_date: str
    end_date: str
    timezone: str = "Asia/Kolkata"


class BookBody(BaseModel):
    slot_start: str
    attendee_name: str
    attendee_email: EmailStr
    notes: str = ""
    timezone: str = "Asia/Kolkata"


@router.post("/availability")
async def availability(body: AvailabilityBody):
    try:
        slots = await get_availability(body.start_date, body.end_date, body.timezone)
        return {"slots": slots}
    except CalcomError as e:
        logger.warning(f"availability error: {e}")
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/book")
async def book(body: BookBody):
    try:
        result = await book_meeting(
            slot_start=body.slot_start,
            attendee_name=body.attendee_name,
            attendee_email=str(body.attendee_email),
            notes=body.notes,
            timezone=body.timezone,
        )
        return result
    except CalcomError as e:
        logger.warning(f"booking error: {e}")
        raise HTTPException(status_code=502, detail=str(e))
