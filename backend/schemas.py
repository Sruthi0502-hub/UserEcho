from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import Optional

class EventCreate(BaseModel):
    session_id: str
    url: str  # Could use HttpUrl but sometimes partial paths are sent
    event_type: str
    timestamp: Optional[datetime] = None
    referrer: Optional[str] = None
    user_agent: Optional[str] = None

class EventOut(EventCreate):
    id: int
    device_type: Optional[str]
    browser: Optional[str]
    os: Optional[str]
    traffic_source: Optional[str]
    
    class Config:
        orm_mode = True
