# MoodMate

MoodMate is an intelligent, context-aware recommendation engine designed to monitor user well-being and provide adaptive solutions. By analyzing emotional states, environmental context, and personal constraints, the system proactively works to reduce "Risk Levels" and improve the user's daily quality of life.

## 🌟 Overview

The system operates on a continuous feedback loop: it gathers real-time data, suggests optimized tasks, analyzes weekly trends, and adapts its strategy based on whether a user's risk level is **High, Stable, or Improving.**

---

## 🧠 Machine Learning & Predictions

The core intelligence of this project is powered by pre-trained Scikit-learn/Python models. These files handle the transformation of raw user data into actionable risk predictions.

* **`preprocessor.pkl`**: Handles data scaling, encoding, and cleaning of real-time inputs (Mood, Time, Location).
* **`model.pkl`**: The trained brain that calculates the "Risk Level" based on the processed features.



---

## 🛠 Core Data Inputs

MoodMate synthesizes data from multiple components to ensure high-precision recommendations:

* **Mood Prediction:** Real-time emotional state (e.g., Happy, Stress, Worry, Frustration, Disappointment).
* **Spatio-Temporal Tracking:** Current time, day, and specific location (Office, Meeting Room, Home, etc.).
* **User Guardrails:** Pre-defined preferences, personal goals, and **allergies**.
* **Task Planning:** Integration with external components for daily schedule management.

---

## 🔄 The Adaptive Logic Loop

### 1. Daily Recommendations & Convenience
The system provides daily tasks based on the user's current mood and location. 
* **Shortcuts:** Quick access to required tools.
* **Resources:** Direct links and "Song Locations" for immediate convenience.

### 2. Weekly Risk Analysis
At the end of each week, the system generates a **Historical Report and Graph**.
* **Stable/Improving:** Continues current support patterns.
* **High Risk:** Triggers **Unique Solution Recommendations** for the following week, tailored to the user's location goals and time constraints.

### 3. Recovery Protocol
The process is recursive. If the weekly trend analysis shows no improvement, the system adapts and provides new recommendations until the user reaches a "Recovered" or "Stable" state.

---

## 🛡 Safety & User Control

### Allergy & Goal Filtering
Before any recommendation is issued, the system cross-references the task with the user’s **Allergy Profile**. 
* If a recommendation is unsuitable (e.g., an outdoor task for someone with pollen allergies), the system suggests an **alternative option** that fits the user's preferences.

### User Autonomy (Override System)
* Users have the authority to **Override** or **Reject** any suggestion.
* Upon rejection, the system immediately provides a different solution that better suits the user's immediate needs.

---

## 📈 Visualizing Progress
The app provides a detailed dashboard featuring:
* **Historical Trends:** A 7-day lookback at emotional and risk fluctuations.
* **Risk Status:** Clear indicators: **High Risk**, **Stable**, or **Improving**.


