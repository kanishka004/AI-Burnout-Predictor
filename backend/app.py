from flask_cors import CORS
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, JWTManager, jwt_required
import pickle
import numpy as np
import os
from dotenv import load_dotenv
from datetime import datetime
from flask_jwt_extended import get_jwt_identity
from extensions import db
from models import User, BurnoutLog

load_dotenv()

app = Flask(__name__)

db_url = os.getenv("DATABASE_URL")

if not db_url:
    db_url = "sqlite:///burnout.db"  # fallback for local development

if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

app.config["SQLALCHEMY_DATABASE_URI"] = db_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["JWT_HEADER_NAME"] = "Authorization"
app.config["JWT_HEADER_TYPE"] = "Bearer"

db.init_app(app)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
CORS(app, supports_credentials=True)

# for debugging purposes, you can add error handlers for JWT issues:
@jwt.invalid_token_loader
def invalid_token_callback(error):
    print("INVALID TOKEN ERROR:", error)
    return jsonify({"error": "Invalid token"}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    print("MISSING TOKEN ERROR:", error)
    return jsonify({"error": "Token missing"}), 401

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print("TOKEN EXPIRED")
    return jsonify({"error": "Token expired"}), 401

# Load models (robust path)
base_path = os.path.dirname(__file__)

clf_model = pickle.load(
    open(os.path.join(base_path, "model", "burnout_model.pkl"), "rb")
)
reg_model = pickle.load(
    open(os.path.join(base_path, "model", "burnout_score_model.pkl"), "rb")
)


@app.route("/")
def home():
    return "Burnout Predictor Running"


@app.route("/signup", methods=["POST"])
def signup():
    data = request.json

    existing_user = User.query.filter_by(email=data["email"]).first()
    if existing_user:
        return jsonify({"error": "User already exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    user = User(email=data["email"], password=hashed_pw)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User created"})


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()

    if user and bcrypt.check_password_hash(user.password, data["password"]):
        token = create_access_token(identity=str(user.id))
        return jsonify({"token": token})

    return jsonify({"error": "Invalid credentials"}), 401


@app.route("/predict", methods=["POST"])
@jwt_required()
def predict():
    user_id = int(get_jwt_identity())
    print("USER ID:", user_id) 
    data = request.json

    input_data = np.array(
        [
            [
                data["work_hours"],
                data["sleep_hours"],
                data["breaks_count"],
                data["task_load"],  # make sure this is numeric (0/1/2)
                data["stress_level"],
                data["screen_time"],
                data["commits_count"],
                data["tasks_completed"],
                data["focus_hours"],
                data["interruptions"],
                data["meeting_hours"],
            ]
        ]
    )

    # Predictions
    risk = str(clf_model.predict(input_data)[0])
    score = float(reg_model.predict(input_data)[0])

    # Log to database
    log = BurnoutLog(
        user_id=user_id,
        work_hours=data["work_hours"],
        sleep_hours=data["sleep_hours"],
        breaks_count=data["breaks_count"],
        task_load=data["task_load"],
        stress_level=data["stress_level"],
        screen_time=data["screen_time"],
        commits_count=data["commits_count"],
        tasks_completed=data["tasks_completed"],
        focus_hours=data["focus_hours"],
        interruptions=data["interruptions"],
        meeting_hours=data["meeting_hours"],
        burnout_score=round(float(score), 2),
        burnout_risk=risk
    )

    db.session.add(log)
    db.session.commit()

    # Early warning logic
    warnings = []

    user_logs = BurnoutLog.query.filter_by(user_id=user_id).order_by(BurnoutLog.date.desc()).limit(3).all()
    
    if len(user_logs) >= 3:
        last_3_scores = [log.burnout_score for log in reversed(user_logs)]

        if last_3_scores[0] < last_3_scores[1] < last_3_scores[2]:
            warnings.append("⚠️ Burnout risk increasing continuously")

        if last_3_scores[2] > 80:
            warnings.append("🔥 High burnout risk detected")


    # Explainable AI (dynamic reasons)
    reasons = []

    if data["work_hours"] > 9:
        reasons.append("High work hours detected")
    if data["stress_level"] > 7:
        reasons.append("High stress level")
    if data["sleep_hours"] < 6:
        reasons.append("Low sleep detected")
    if data["interruptions"] > 5:
        reasons.append("Too many interruptions")
    if data["breaks_count"] < 2:
        reasons.append("Insufficient breaks")

    # Smart recommendations
    recommendations = []

    if data["sleep_hours"] < 6:
        recommendations.append("Increase sleep to at least 7 hours")
    if data["work_hours"] > 9:
        recommendations.append("Reduce work hours by 1-2 hours")
    if data["breaks_count"] < 2:
        recommendations.append("Take more frequent breaks")
    if data["stress_level"] > 7:
        recommendations.append("Practice stress management techniques")
    if data["interruptions"] > 5:
        recommendations.append("Minimize distractions during work")

    # fallback if risk is High but no reasons
    if risk == "High" and len(reasons) == 0:
        reasons.append("Burnout detected based on combined behavioral patterns")

    if risk == "High" and len(recommendations) == 0:
        recommendations.append("Monitor workload and maintain balance")

    return jsonify({
    "burnout_risk": risk,
    "burnout_score": round(float(score), 2),
    "reasons": reasons,
    "recommendations": recommendations,
    "warning": warnings
})


@app.route("/create-db")
def create_db():
    db.create_all()
    return "Database created!"


@app.route("/trend", methods=["GET"])
@jwt_required()
def trend():
    user_id = int(get_jwt_identity())

    logs = BurnoutLog.query.filter_by(user_id=user_id) \
        .order_by(BurnoutLog.date.desc()) \
        .limit(7) \
        .all()

    logs = list(reversed(logs))  # oldest → newest

    return jsonify({
    "dates": [log.date.strftime("%d %b %Y, %H:%M") for log in logs],
    "burnout_scores": [log.burnout_score for log in logs]
})


if __name__ == "__main__":
    app.run(debug=True)
