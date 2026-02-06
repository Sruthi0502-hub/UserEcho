"""
Zeroth Backend Version
Website Traffic & User Behavior Analytics Tool
"""

from flask import Flask
from flask_cors import CORS
import sqlite3

# ------------------------------------
# Flask App Initialization
# ------------------------------------
app = Flask(__name__)

# Enable CORS so frontend can call backend
CORS(app)

# ------------------------------------
# Database Configuration
# ------------------------------------
DATABASE = "database.db"


def get_db_connection():
    """
    Create and return a SQLite database connection.
    """
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """
    Create tracking table if it does not already exist.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tracking_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visitor_id TEXT NOT NULL,
            page_url TEXT NOT NULL,
            event_type TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            device_type TEXT,
            browser TEXT,
            location TEXT
        )
    """)

    conn.commit()
    conn.close()


# Initialize database on app startup
init_db()

# ------------------------------------
# Health Check Route
# ------------------------------------
@app.route("/")
def home():
    return "Backend is running with database support!"


# ------------------------------------
# App Entry Point
# ------------------------------------
if __name__ == "__main__":
    app.run(debug=True)
