from fastapi import FastAPI, Depends, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
import user_agents
import pandas as pd
from typing import List, Optional

import models, schemas, database, crud

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Web Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def parse_user_agent(ua_string: str):
    user_agent = user_agents.parse(ua_string)
    device_type = "mobile" if user_agent.is_mobile else "tablet" if user_agent.is_tablet else "pc"
    browser = user_agent.browser.family
    os = user_agent.os.family
    return {"device_type": device_type, "browser": browser, "os": os}

@app.post("/api/track", response_model=schemas.EventOut)
def track_event(event: schemas.EventCreate, request: Request, db: Session = Depends(get_db)):
    # If user_agent not sent in body, try headers
    ua_string = event.user_agent or request.headers.get("user-agent", "")
    device_data = parse_user_agent(ua_string)
    
    return crud.create_event(db=db, event=event, device_data=device_data)

@app.get("/api/analytics/dashboard")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    return {
        "active_visitors": crud.get_active_visitors(db),
        "bounce_rate": round(crud.get_bounce_rate(db), 2),
        "avg_session_duration": round(crud.get_avg_session_duration(db), 2),
        "page_views_per_session": round(crud.get_page_views_per_session(db), 2),
        "total_pageviews": crud.get_total_pageviews(db)
    }

@app.get("/api/analytics/charts")
def get_charts_data(db: Session = Depends(get_db)):
    return {
        "traffic_sources": [{"name": r[0] or "Direct", "value": r[1]} for r in crud.get_traffic_sources(db)],
        "devices": [{"name": r[0], "value": r[1]} for r in crud.get_device_stats(db)],
        "browsers": [{"name": r[0], "value": r[1]} for r in crud.get_browser_stats(db)],
        "top_pages": [{"name": r[0], "value": r[1]} for r in crud.get_top_pages(db)]
    }

@app.get("/api/prediction/peak-traffic")
def predict_peak_traffic(db: Session = Depends(get_db)):
    # Simple heuristic: load all timestamps, group by hour, find busiest hour historically
    query = db.query(models.Event.timestamp).all()
    if not query:
        return {"peak_hour": None, "message": "Not enough data"}
        
    timestamps = [r[0] for r in query]
    df = pd.DataFrame(timestamps, columns=["timestamp"])
    df["hour"] = df["timestamp"].dt.hour
    peak_hour = df["hour"].mode()[0]
    
    # Recommendations
    rec = []
    bounce_rate = crud.get_bounce_rate(db)
    if bounce_rate > 60:
        rec.append("High bounce rate detected. Improve landing page content.")
    
    return {
        "peak_hour": int(peak_hour),
        "peak_time_str": f"{peak_hour}:00 - {peak_hour+1}:00",
        "recommendations": rec
    }

@app.get("/")
def read_root():
    return {"message": "Analytics Backend Running"}
