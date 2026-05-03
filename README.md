# AI-Based Preventive Productivity & Mental Health Intelligence System

## Overview
An AI-based system that predicts burnout risk using behavioral and time-series data such as work hours, sleep patterns, and coding activity. The system identifies early warning signs and provides actionable insights to prevent burnout.

---

## Features
- Burnout score prediction (0–100)
- Risk classification (Low / Medium / High)
- Trend visualization (weekly burnout graph)
- Early warning system for rising burnout
- Personalized recommendations
- Multi-user support with history tracking

---

## Tech Stack
- Python (Pandas, NumPy, Scikit-learn(Random Forest)) 
- Flask (Backend API)
- React (Frontend)
- SQLite / PostgreSQL (Database)
- Chart.js (Visualization)

---

## Machine Learning
- Classification model for burnout risk  
- Regression model for burnout score  
- Feature importance analysis  
- Time-series trend detection  

---

## How It Works
1. User inputs behavioral data  
2. Model predicts burnout score & risk level  
3. System analyzes recent trends  
4. Generates warnings and recommendations  

---

## Installation

```bash
git clone <your-repo-link>
cd project-folder
pip install -r requirements.txt
python app.py
