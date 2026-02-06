from sqlalchemy import Column, Integer, String, DateTime
from database import Base
from datetime import datetime

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    url = Column(String, index=True)
    event_type = Column(String)  # 'pageview', 'click', 'session_start', 'session_end'
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # User info
    user_agent = Column(String, nullable=True)
    device_type = Column(String, nullable=True) # mobile, tablet, pc
    browser = Column(String, nullable=True)
    os = Column(String, nullable=True)
    
    traffic_source = Column(String, nullable=True) # referrer
