"""
MoodMate - Flask Backend API
Serves ML model predictions to the MoodMate mobile app

Endpoints:
    GET  /api/health          - Health check & model status
    POST /api/predict         - Predict risk level from mood context
    POST /api/recommend       - Get personalized recommendation
    GET  /api/model-info      - Model metadata & training info

Usage:
    python app.py
    
    The API will start on http://localhost:5000
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from ml_model import MoodMateModel
import os

# ─── App Initialization ──────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from mobile app

# Load ML model on startup
model = MoodMateModel()

try:
    model.load()
    print("\n✅ ML Model loaded successfully!")
except FileNotFoundError as e:
    print(f"\n⚠️  {e}")
    print("   Run 'python train_model.py' to generate model files.\n")


# ─── API Endpoints ────────────────────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'MoodMate ML Backend',
        'model_loaded': model._loaded,
        'version': '1.0.0',
    })


@app.route('/api/predict', methods=['POST'])
def predict_risk():
    """
    Predict risk level from user context.
    
    Request body:
    {
        "mood": "stress",
        "location": "office",
        "time_period": "afternoon",
        "day_of_week": 2,
        "user_goal": "relaxation"
    }
    
    Response:
    {
        "risk_level": "high",
        "confidence": 0.87
    }
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No JSON body provided'}), 400

        required_fields = ['mood', 'location', 'time_period', 'day_of_week', 'user_goal']
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

        result = model.predict_risk_level(
            mood=data['mood'],
            location=data['location'],
            time_period=data['time_period'],
            day_of_week=data['day_of_week'],
            user_goal=data['user_goal'],
        )

        return jsonify({
            'success': True,
            'prediction': result,
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/recommend', methods=['POST'])
def get_recommendation():
    """
    Get personalized recommendation based on mood and context.
    
    Request body:
    {
        "mood": "stress",
        "location": "office",
        "time_period": "afternoon",
        "allergies": ["pollen"]
    }
    
    Response:
    {
        "recommendation": "You're at the office, so choose something...",
        "score": 8
    }
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No JSON body provided'}), 400

        required_fields = ['mood', 'location', 'time_period']
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

        result = model.get_recommendation(
            mood=data['mood'],
            location=data['location'],
            time_period=data['time_period'],
            allergies=data.get('allergies', []),
        )

        return jsonify({
            'success': True,
            'result': result,
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/model-info', methods=['GET'])
def model_info():
    """Get model metadata and training information"""
    try:
        info = model.get_model_info()
        return jsonify({
            'success': True,
            'model': info,
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─── Main ─────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    print("\n" + "=" * 50)
    print("  MoodMate ML Backend API")
    print("  http://localhost:5000")
    print("=" * 50 + "\n")

    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
    )
