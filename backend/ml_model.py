"""
MoodMate - ML Model Service
Loads trained model.pkl and preprocessor.pkl for prediction

This module handles:
- Loading the trained model pipeline
- Preprocessing user input features
- Predicting risk levels
- Generating context-aware recommendations
"""

import pickle
import os
import numpy as np


class MoodMateModel:
    """
    Machine Learning model service for MoodMate.
    Uses trained RandomForest model to predict risk levels
    and generate mood-based recommendations.
    """

    def __init__(self):
        self.model_data = None
        self.preprocessor_data = None
        self.pipeline = None
        self.preprocessor = None
        self._loaded = False

    def load(self):
        """Load model.pkl and preprocessor.pkl from disk"""
        base_dir = os.path.dirname(__file__)

        # Load model
        model_path = os.path.join(base_dir, 'model.pkl')
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"model.pkl not found at {model_path}. "
                "Run 'python train_model.py' first."
            )

        with open(model_path, 'rb') as f:
            self.model_data = pickle.load(f)

        self.pipeline = self.model_data['pipeline']

        # Load preprocessor
        preprocessor_path = os.path.join(base_dir, 'preprocessor.pkl')
        if not os.path.exists(preprocessor_path):
            raise FileNotFoundError(
                f"preprocessor.pkl not found at {preprocessor_path}. "
                "Run 'python train_model.py' first."
            )

        with open(preprocessor_path, 'rb') as f:
            self.preprocessor_data = pickle.load(f)

        self.preprocessor = self.preprocessor_data['preprocessor']
        self._loaded = True

        print(f"[MoodMateModel] Loaded model v{self.model_data.get('version', 'unknown')}")
        print(f"[MoodMateModel] Training accuracy: {self.model_data.get('training_accuracy', 'N/A')}")

    def predict_risk_level(self, mood, location, time_period, day_of_week, user_goal):
        """
        Predict the risk level for the given user context.

        Args:
            mood: str - One of: happy, relaxed, stress, worry, frustration, disappointment
            location: str - One of: home, office, meeting_room
            time_period: str - One of: morning, afternoon, evening, night
            day_of_week: int - 0 (Sunday) to 6 (Saturday)
            user_goal: str - One of: relaxation, productivity, social, learning, exercise

        Returns:
            dict with 'risk_level' and 'confidence'
        """
        if not self._loaded:
            self.load()

        # Prepare input features
        features = np.array([[mood, location, time_period, day_of_week, user_goal]])

        # Predict using the trained pipeline
        prediction = self.pipeline.predict(features)[0]

        # Get prediction probabilities for confidence score
        probabilities = self.pipeline.predict_proba(features)[0]
        confidence = float(max(probabilities))

        return {
            'risk_level': prediction,
            'confidence': round(confidence, 4),
        }

    def get_recommendation(self, mood, location, time_period, allergies=None):
        """
        Generate a context-aware recommendation using the model's
        learned keyword associations.

        Args:
            mood: str - Current mood type
            location: str - Current location
            time_period: str - Current time period
            allergies: list - User's allergies for filtering

        Returns:
            dict with 'recommendation' and 'score'
        """
        if not self._loaded:
            self.load()

        recommendations = self.model_data.get('recommendations', [])
        location_keywords = self.model_data.get('location_keywords', {})
        mood_keywords = self.model_data.get('mood_keywords', {})

        if not recommendations:
            return {
                'recommendation': 'Take a moment to breathe and do what feels right.',
                'score': 0,
            }

        location_words = location_keywords.get(location, [])
        mood_words = mood_keywords.get(mood, [])

        best_match = recommendations[0]
        best_score = 0

        for rec in recommendations:
            lower_rec = rec.lower()
            score = 0

            # Location matching (+2 per keyword)
            for word in location_words:
                if word.lower() in lower_rec:
                    score += 2

            # Mood matching (+3 per keyword)
            for word in mood_words:
                if word.lower() in lower_rec:
                    score += 3

            # Allergy filtering (-100 if allergen detected)
            if allergies:
                has_allergen = False
                for allergy in allergies:
                    if allergy and allergy.lower() in lower_rec:
                        has_allergen = True
                        break
                if has_allergen:
                    score = -100

            if score > best_score:
                best_score = score
                best_match = rec

        return {
            'recommendation': best_match,
            'score': best_score,
        }

    def get_model_info(self):
        """Return model metadata"""
        if not self._loaded:
            self.load()

        return {
            'version': self.model_data.get('version', 'unknown'),
            'training_samples': self.model_data.get('training_samples', 0),
            'training_accuracy': self.model_data.get('training_accuracy', 0),
            'feature_names': self.model_data.get('feature_names', []),
            'mood_types': self.model_data.get('mood_types', []),
            'location_types': self.model_data.get('location_types', []),
            'risk_levels': self.model_data.get('risk_levels', []),
        }
