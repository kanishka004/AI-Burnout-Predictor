from datetime import datetime, timezone

from extensions import db

# User Model
class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    # relationship (optional but powerful)
    logs = db.relationship("BurnoutLog", backref="user", lazy=True)


# Burnout Log Model
class BurnoutLog(db.Model):
    __tablename__ = "burnout_log"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id"),
        nullable=False
    )

    date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    work_hours = db.Column(db.Float)
    sleep_hours = db.Column(db.Float)
    breaks_count = db.Column(db.Integer)
    task_load = db.Column(db.Integer)
    stress_level = db.Column(db.Integer)
    screen_time = db.Column(db.Float)
    commits_count = db.Column(db.Integer)
    tasks_completed = db.Column(db.Integer)
    focus_hours = db.Column(db.Float)
    interruptions = db.Column(db.Integer)
    meeting_hours = db.Column(db.Float)

    burnout_score = db.Column(db.Float)
    burnout_risk = db.Column(db.String(20))