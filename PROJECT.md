# MoodMate - Mood Tracking & Wellness App

A Flutter mobile application for mood tracking, personalized wellness recommendations, and mental health trend visualization.

---

## 📋 Project Overview

| Property | Value |
|----------|-------|
| **App Name** | MoodMate |
| **Package ID** | `com.moodmate.app` |
| **Version** | 1.0.0 |
| **Platform** | Android, iOS & Web |
| **Framework** | Flutter (Dart) |

---

## 🛠️ Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Flutter** | 3.x | Cross-platform UI Framework |
| **Dart** | >=3.0.0 <4.0.0 | Programming Language |

### Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| `provider` | ^6.1.5+1 | State Management |
| `shared_preferences` | ^2.5.5 | Local Data Persistence |
| `fl_chart` | ^1.2.0 | Charts & Graphs |
| `flutter_svg` | ^2.2.4 | SVG Rendering |

---

## 📁 Project Structure

```
MoodMate/
├── moodmate_flutter/              # Flutter Application
│   ├── lib/
│   │   ├── main.dart              # Entry Point & Navigation Setup
│   │   ├── data/
│   │   │   ├── features.dart      # Feature Constants (Moods, Locations, Goals)
│   │   │   ├── recommendations.dart  # Recommendation Database
│   │   │   ├── songs.dart         # Song Database
│   │   │   └── activities.dart    # Activity Definitions
│   │   ├── models/
│   │   │   └── mood_entry.dart    # MoodEntry Data Model
│   │   ├── screens/
│   │   │   ├── home_screen.dart          # Main Dashboard
│   │   │   ├── mood_input_screen.dart    # Mood Entry Form (2-step)
│   │   │   ├── recommendation_screen.dart # AI Recommendations
│   │   │   ├── trends_screen.dart        # Weekly Analytics
│   │   │   └── profile_screen.dart       # User Settings
│   │   ├── state/
│   │   │   └── app_state.dart     # Global State (Provider)
│   │   └── utils/
│   │       ├── recommendation_engine.dart # AI Scoring Logic
│   │       ├── song_service.dart          # Music Suggestions
│   │       └── activity_service.dart      # Activity Matching
│   ├── pubspec.yaml               # Dependencies
│   └── test/                      # Tests
├── backend/                       # Python ML Backend
│   ├── model.pkl                  # Trained ML Model
│   ├── preprocessor.pkl           # Data Preprocessor
│   └── README.md                  # Backend Docs
├── app/                           # Original React Native App (Legacy)
│   └── src/                       # Source files
├── instruction.md                 # Project Instructions
└── PROJECT.md                     # This file
```

---

## 📱 Screens & Interfaces

### 1. Home Screen (`home_screen.dart`)
- **Purpose**: Main dashboard displaying current mood status
- **Features**:
  - Time-based greeting with ambient glow effects
  - Health & Mood Dashboard card
  - Current risk level indicator (High/Stable/Improving)
  - Semi-circular gauge charts (Logs Today, Total Logs)
  - Last recorded mood display
  - Quick action buttons (Log Mood, View Trends, Settings)

### 2. Mood Input Screen (`mood_input_screen.dart`)
- **Purpose**: Log user's current mood and location
- **Features**:
  - 2-step flow with step indicator
  - Mood selection grid (6 mood types with emojis)
  - Location selection (Home/Office/Meeting Room)
  - Navigate to recommendations on submit

### 3. Recommendation Screen (`recommendation_screen.dart`)
- **Purpose**: Display personalized wellness recommendations
- **Features**:
  - Context summary cards (mood + location)
  - AI-powered recommendation with scoring algorithm
  - Accept/Reject with alternative generation
  - Music recommendations when applicable
  - Suggested activities with category filters
  - Allergy-filtered recommendations

### 4. Trends Screen (`trends_screen.dart`)
- **Purpose**: Weekly mood analytics and visualization
- **Features**:
  - Risk status card with color coding
  - Weekly summary (total logs, happy percentage)
  - Mood distribution bar chart
  - Recent activity log

### 5. Profile Screen (`profile_screen.dart`)
- **Purpose**: User settings and preferences
- **Features**:
  - Allergy management (add/remove with persistence)
  - Goal selection grid (Relaxation, Productivity, Social, Learning, Exercise)
  - About section with version info

---

## 🎨 UI Theme & Design

### Color Palette

| Element | Color Code | Usage |
|---------|------------|-------|
| Background Primary | `#0F172A` | Main background |
| Background Secondary | `#1E293B` | Cards, tab bar |
| Border Color | `#2D3A52` | Card borders |
| Accent Purple | `#8B5CF6` | Primary actions |
| Active Indicator | `#A78BFA` | Active tab, selections |
| Text Secondary | `#94A3B8` | Subtitles, labels |

### Mood Colors

| Mood | Emoji | Color |
|------|-------|-------|
| Happy | 😊 | `#4ADE80` (Green) |
| Relaxed | ☺️ | `#60A5FA` (Blue) |
| Stress | 😰 | `#F87171` (Red) |
| Worry | 😟 | `#FBBF24` (Yellow) |
| Frustration | 😤 | `#FB923C` (Orange) |
| Disappointment | 😔 | `#A78BFA` (Purple) |

---

## 🧠 Data Models & Types

### MoodEntry
```dart
class MoodEntry {
    String id;
    String mood;       // 'happy', 'relaxed', 'stress', 'worry', 'frustration', 'disappointment'
    int timestamp;
    String location;   // 'home', 'office', 'meeting_room'
    String riskLevel;  // 'low', 'medium', 'high'
}
```

### UserProfile
```dart
class UserProfile {
    List<String> allergies;
    String preferredGoal; // 'relaxation', 'productivity', 'social', 'learning', 'exercise'
}
```

---

## ⚙️ Core Features

### 1. Mood Tracking
- Log current emotional state with 6 mood options
- Capture location context (Home/Office/Meeting Room)
- Automatic timestamp recording
- Persistent storage using SharedPreferences

### 2. AI Recommendation Engine
- Context-aware recommendation matching (mood + location + time)
- Location-based keyword scoring (+2 points per match)
- Mood-based keyword scoring (+3 points per match)
- Allergy filtering (-100 points if allergen detected)
- Alternative recommendation generation on rejection

### 3. Risk Level Assessment
- Analyzes mood history from last 7 days
- Calculates negative mood ratio
- Tracks improvement trends (first half vs second half comparison)
- Returns: `high` | `stable` | `improving`

### 4. Activity Suggestions
- Scored matching based on mood, location, time period
- Category filters: Exercise, Relaxation, Games & Fun, Outdoor
- Duration indicators and allergy-aware filtering

### 5. Music Recommendations
- Auto-detects music-related recommendations
- Mood-based song suggestions from built-in database
- Displays song title, artist, and genre

### 6. Weekly Analytics
- Mood distribution visualization
- Total mood entries count
- Happy percentage tracking
- Recent activity log with timestamps

---

## 🔧 State Management

### AppState (Provider + ChangeNotifier)
Global state provider using Flutter Provider pattern:

| State | Type | Description |
|-------|------|-------------|
| `moodHistory` | `List<MoodEntry>` | All logged moods |
| `userProfile` | `UserProfile` | User preferences |
| `currentRiskLevel` | `String` | Computed risk assessment |
| `isLoading` | `bool` | Loading state |

### Available Actions
- `addMoodEntry(mood, location)` - Log new mood
- `updateAllergies(allergies)` - Update allergy list
- `updatePreferredGoal(goal)` - Change wellness goal

### Storage Keys
```dart
const String _moodHistoryKey = '@moodmate_mood_history';
const String _userProfileKey = '@moodmate_user_profile';
```

---

## 🚀 Running the App

### Prerequisites
- Flutter SDK (3.x+)
- Dart SDK (>=3.0.0)

### Installation
```bash
# Navigate to Flutter app directory
cd "d:\sheha\RP\mobile app\MoodMate\moodmate_flutter"

# Install dependencies
flutter pub get
```

### Development Commands

| Command | Description |
|---------|-------------|
| `flutter run -d edge` | Run on Edge browser |
| `flutter run -d chrome` | Run on Chrome browser |
| `flutter run -d windows` | Run as Windows desktop app |
| `flutter run -d android` | Run on Android device/emulator |
| `flutter run -d ios` | Run on iOS simulator |

### Hot Reload
While the app is running, press:
- `r` — Hot reload (preserves state)
- `R` — Hot restart (resets state)
- `q` — Quit

---

## 📊 Recommendation Algorithm

The recommendation engine uses a scoring system:

1. **Location Matching** (+2 points per keyword match)
   - Home: `home, flexible, comfortable, cook, workout, meditation`
   - Office: `office, work break, desk, stretches`
   - Meeting Room: `meeting, break, focus`

2. **Mood Matching** (+3 points per keyword match)
   - Happy: `enjoy, energizing, fun, dance, social`
   - Relaxed: `relax, calm, peaceful, gentle, mindful, meditation`
   - Stress: `calming, grounding, meditation, relax, soothing`
   - Worry: `calming, grounding, reassure, gentle`
   - Frustration: `release, exercise, workout, channel`
   - Disappointment: `uplifting, comfort, gentle, kind`

3. **Allergy Filtering** (-100 points if allergen detected)

---

## 📝 Migration Notes

This app was originally built with React Native + Expo SDK and has been migrated to Flutter.

### What Changed
- **Framework**: React Native → Flutter
- **Language**: TypeScript → Dart
- **State Management**: React Context → Provider + ChangeNotifier
- **Storage**: AsyncStorage → SharedPreferences
- **Navigation**: React Navigation → Flutter Navigator with bottom tabs
- **Location**: expo-location GPS tracking → Manual location selection

### Original React Native Files (Legacy)
The `app/` directory contains the original React Native source code for reference.

---

## 📝 License

This project is private and proprietary.

---

*Documentation updated on April 18, 2026 — Flutter Migration*
