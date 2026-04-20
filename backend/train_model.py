"""
MoodMate - Model Training Script
Trains the mood prediction model and saves model.pkl & preprocessor.pkl

Usage:
    python train_model.py

This script:
1. Loads the training dataset
2. Preprocesses features using sklearn Pipeline
3. Trains a RandomForestClassifier for risk level prediction
4. Trains a recommendation matching model
5. Saves both model.pkl and preprocessor.pkl
"""

import pickle
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
import os
import json

# ─── Feature Definitions ─────────────────────────────────────────────────────

MOOD_TYPES = ['happy', 'relaxed', 'stress', 'worry', 'frustration', 'disappointment']
LOCATION_TYPES = ['home', 'office', 'meeting_room']
TIME_PERIODS = ['morning', 'afternoon', 'evening', 'night']
USER_GOALS = ['relaxation', 'productivity', 'social', 'learning', 'exercise']
RISK_LEVELS = ['low', 'stable', 'high', 'improving']

# ─── Recommendation Database ─────────────────────────────────────────────────

RECOMMENDATIONS = [
    "Since you're resting, choose a short guided meditation.",
    "Since you're working from home, choose a flexible and comfortable activity. A short movie, music session, or casual gaming works well.",
    "Since you're working from home, choose a flexible and comfortable activity. Cook, organize your space, or relax with journaling.",
    "Since you're working from home, choose a flexible and comfortable activity. Do a home workout or light indoor exercise.",
    "Since you're working from home, choose a flexible and comfortable activity. Take an online course or read comfortably from home.",
    "Since you're working from home, choose a flexible and comfortable activity. Try meditation, a power nap, or gentle stretching.",
    "Since you're working from home, choose a flexible and comfortable activity. You can plan a nearby quick outing or meet someone close by.",
    "You're at the office, so choose something suitable for a work break. Do simple stretches or a quick walk during break time.",
    "You're at the office, so choose something suitable for a work break. Organize your desk or take a quiet moment to reset.",
    "You're at the office, so choose something suitable for a work break. Pick light entertainment—short videos or music on headphones.",
    "You're at the office, so choose something suitable for a work break. Plan social time for after work or invite colleagues for a coffee break.",
    "You're at the office, so choose something suitable for a work break. Read short work-friendly articles or take micro-learning lessons.",
    "You're at the office, so choose something suitable for a work break. Try a short breathing exercise or a quick walk outside the building.",
    "You're in a meeting room, so choose a quiet and time-limited activity. Try quick breathing exercises or micro-meditation.",
    "You're in a meeting room, so choose a quiet and time-limited activity. Read a short article or review notes quietly.",
    "You're in a meeting room, so choose a quiet and time-limited activity. Reflect, journal digitally, or organize your tasks silently.",
    "Since you're working from home, choose a flexible and comfortable activity. Because of your emotional state, choose something calming and grounding.",
    "Since you're working from home, choose a flexible and comfortable activity. Since you're in a good mood, lean into enjoyable and energizing activities.",
    "You're at the office, so choose something suitable for a work break. Because of your emotional state, choose something calming and grounding.",
    "You're at the office, so choose something suitable for a work break. Since you're in a good mood, lean into enjoyable and energizing activities.",
    "You're in a meeting room, so choose a quiet and time-limited activity. Because of your emotional state, choose something calming and grounding.",
    "You're in a meeting room, so choose a quiet and time-limited activity. Since you're in a good mood, lean into enjoyable and energizing activities.",
]

# ─── Location & Mood Keywords for Matching ─────────────────────────────────

LOCATION_KEYWORDS = {
    'home': ['home', 'flexible', 'comfortable', 'cook', 'workout', 'meditation'],
    'office': ['office', 'work break', 'desk', 'stretches'],
    'meeting_room': ['meeting', 'break', 'focus'],
}

MOOD_KEYWORDS = {
    'happy': ['enjoy', 'energizing', 'fun', 'dance', 'social'],
    'relaxed': ['relax', 'calm', 'peaceful', 'gentle', 'mindful', 'meditation'],
    'stress': ['calming', 'grounding', 'meditation', 'relax', 'soothing'],
    'worry': ['calming', 'grounding', 'reassure', 'gentle'],
    'frustration': ['release', 'exercise', 'workout', 'channel'],
    'disappointment': ['uplifting', 'comfort', 'gentle', 'kind'],
}


def generate_training_data(n_samples=5000):
    """Generate synthetic training data for the model"""
    np.random.seed(42)

    data = []
    labels = []

    for _ in range(n_samples):
        mood = np.random.choice(MOOD_TYPES)
        location = np.random.choice(LOCATION_TYPES)
        time_period = np.random.choice(TIME_PERIODS)
        day_of_week = np.random.randint(0, 7)
        user_goal = np.random.choice(USER_GOALS)

        # Determine risk level based on mood patterns
        negative_moods = ['stress', 'worry', 'frustration', 'disappointment']
        if mood in negative_moods:
            risk_weights = [0.2, 0.3, 0.4, 0.1]  # low, stable, high, improving
        else:
            risk_weights = [0.4, 0.35, 0.05, 0.2]

        risk = np.random.choice(RISK_LEVELS, p=risk_weights)

        data.append([mood, location, time_period, day_of_week, user_goal])
        labels.append(risk)

    return np.array(data), np.array(labels)


def build_preprocessor():
    """Build the sklearn preprocessing pipeline"""
    categorical_features = [0, 1, 2, 4]  # mood, location, time_period, user_goal
    numerical_features = [3]  # day_of_week

    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features),
            ('num', StandardScaler(), numerical_features),
        ],
        remainder='passthrough'
    )

    return preprocessor


def build_model_pipeline(preprocessor):
    """Build the full ML pipeline with preprocessor + classifier"""
    pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            class_weight='balanced'
        ))
    ])

    return pipeline


def train_and_save():
    """Main training function"""
    print("=" * 60)
    print("MoodMate - Model Training")
    print("=" * 60)

    # Step 1: Generate training data
    print("\n[1/5] Generating training dataset...")
    X, y = generate_training_data(n_samples=5000)
    print(f"      Generated {len(X)} training samples")
    print(f"      Features: mood, location, time_period, day_of_week, user_goal")
    print(f"      Labels: {', '.join(RISK_LEVELS)}")

    # Step 2: Build preprocessor
    print("\n[2/5] Building preprocessing pipeline...")
    preprocessor = build_preprocessor()
    print("      ColumnTransformer with OneHotEncoder + StandardScaler")

    # Step 3: Build model
    print("\n[3/5] Building model pipeline...")
    model = build_model_pipeline(preprocessor)
    print("      RandomForestClassifier (n_estimators=100, max_depth=10)")

    # Step 4: Train
    print("\n[4/5] Training model...")
    model.fit(X, y)
    train_accuracy = model.score(X, y)
    print(f"      Training accuracy: {train_accuracy:.4f}")

    # Step 5: Save artifacts
    print("\n[5/5] Saving model artifacts...")

    # Save the full model pipeline
    model_data = {
        'pipeline': model,
        'feature_names': ['predicted_mood', 'location', 'time_period', 'day_of_week', 'user_goal'],
        'mood_types': MOOD_TYPES,
        'location_types': LOCATION_TYPES,
        'time_periods': TIME_PERIODS,
        'user_goals': USER_GOALS,
        'risk_levels': RISK_LEVELS,
        'recommendations': RECOMMENDATIONS,
        'location_keywords': LOCATION_KEYWORDS,
        'mood_keywords': MOOD_KEYWORDS,
        'version': '1.0.0',
        'training_samples': len(X),
        'training_accuracy': train_accuracy,
    }

    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model_data, f, protocol=pickle.HIGHEST_PROTOCOL)
    model_size = os.path.getsize(model_path) / (1024 * 1024)
    print(f"      Saved model.pkl ({model_size:.2f} MB)")

    # Save the preprocessor separately
    preprocessor_data = {
        'preprocessor': preprocessor,
        'feature_names': ['predicted_mood', 'location', 'time_period', 'day_of_week', 'user_goal'],
        'mood_types': MOOD_TYPES,
        'location_types': LOCATION_TYPES,
        'time_periods': TIME_PERIODS,
        'user_goals': USER_GOALS,
        'label_encoder_classes': RISK_LEVELS,
        'version': '1.0.0',
    }

    preprocessor_path = os.path.join(os.path.dirname(__file__), 'preprocessor.pkl')
    with open(preprocessor_path, 'wb') as f:
        pickle.dump(preprocessor_data, f, protocol=pickle.HIGHEST_PROTOCOL)
    preprocessor_size = os.path.getsize(preprocessor_path) / (1024 * 1024)
    print(f"      Saved preprocessor.pkl ({preprocessor_size:.2f} MB)")

    print("\n" + "=" * 60)
    print("Training complete!")
    print(f"  model.pkl:        {model_path}")
    print(f"  preprocessor.pkl: {preprocessor_path}")
    print("=" * 60)


if __name__ == '__main__':
    train_and_save()
