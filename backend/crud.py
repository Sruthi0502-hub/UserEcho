from sqlalchemy.orm import Session
from sqlalchemy import func, distinct, desc
import models, schemas
from datetime import datetime, timedelta

def create_event(db: Session, event: schemas.EventCreate, device_data: dict):
    # Basic logic to prevent immediate duplicates if desired (debouncing), but let's just save.
    db_event = models.Event(
        session_id=event.session_id,
        url=event.url,
        event_type=event.event_type,
        timestamp=event.timestamp or datetime.utcnow(),
        user_agent=event.user_agent,
        traffic_source=event.referrer,
        device_type=device_data.get('device_type'),
        browser=device_data.get('browser'),
        os=device_data.get('os')
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

def get_active_visitors(db: Session, minutes=5):
    cutoff = datetime.utcnow() - timedelta(minutes=minutes)
    return db.query(models.Event.session_id).filter(models.Event.timestamp >= cutoff).distinct().count()

def get_total_pageviews(db: Session):
    return db.query(models.Event).filter(models.Event.event_type == 'pageview').count()

def get_avg_session_duration(db: Session):
    # Complex query: simple approximation -> avg(max(time) - min(time)) per session
    # We can do this in python or SQL. SQL is better but sqlite is limited.
    # Let's fetch session bounds.
    rows = db.query(
        models.Event.session_id,
        func.min(models.Event.timestamp).label('start'),
        func.max(models.Event.timestamp).label('end')
    ).group_by(models.Event.session_id).all()
    
    if not rows:
        return 0
        
    total_duration = sum([(r.end - r.start).total_seconds() for r in rows])
    return total_duration / len(rows)

def get_bounce_rate(db: Session):
    # Sessions with only 1 event (or 1 pageview)
    # Group by session_id, count events.
    subq = db.query(models.Event.session_id, func.count(models.Event.id).label('count')).group_by(models.Event.session_id).subquery()
    total_sessions = db.query(subq).count()
    bounced_sessions = db.query(subq).filter(subq.c.count == 1).count()
    
    if total_sessions == 0:
        return 0
    return (bounced_sessions / total_sessions) * 100

def get_page_views_per_session(db: Session):
    total_views = get_total_pageviews(db)
    total_sessions = db.query(models.Event.session_id).distinct().count()
    if total_sessions == 0:
        return 0
    return total_views / total_sessions

def get_traffic_sources(db: Session):
    return db.query(models.Event.traffic_source, func.count(models.Event.id)).group_by(models.Event.traffic_source).all()

def get_device_stats(db: Session):
    return db.query(models.Event.device_type, func.count(models.Event.id)).group_by(models.Event.device_type).all()

def get_browser_stats(db: Session):
    return db.query(models.Event.browser, func.count(models.Event.id)).group_by(models.Event.browser).all()

def get_top_pages(db: Session, limit=5):
    return db.query(models.Event.url, func.count(models.Event.id).label('count')).filter(models.Event.event_type == 'pageview').group_by(models.Event.url).order_by(desc('count')).limit(limit).all()
