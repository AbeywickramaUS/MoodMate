# MoodMate - ML Backend

Python Flask backend that serves the trained ML model for mood prediction and personalized recommendations.

## Architecture

```
backend/
├── app.py              # Flask API server
├── ml_model.py         # Model loading & prediction service
├── train_model.py      # Model training & .pkl generation
├── model.pkl           # Trained RandomForest pipeline (generated)
├── preprocessor.pkl    # Feature preprocessor (generated)
├── requirements.txt    # Python dependencies
└── README.md           # This file
```

## Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

# Train the model (generates model.pkl & preprocessor.pkl)
python train_model.py

# Start the API server
python app.py
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check & model status |
| POST | `/api/predict` | Predict risk level from mood context |
| POST | `/api/recommend` | Get personalized recommendation |
| GET | `/api/model-info` | Model metadata & training info |

## ML Model Details

- **Algorithm**: RandomForestClassifier (scikit-learn)
- **Features**: mood, location, time_period, day_of_week, user_goal
- **Preprocessing**: OneHotEncoder (categorical) + StandardScaler (numerical)
- **Output**: Risk level prediction (low, stable, high, improving)
- **Recommendation**: Context-aware keyword matching with allergy filtering
