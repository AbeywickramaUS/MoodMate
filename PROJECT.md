# MoodMate - Mood Tracking & Wellness App

A React Native mobile application for mood tracking, personalized wellness recommendations, and mental health trend visualization.

---

## 📋 Project Overview

| Property | Value |
|----------|-------|
| **App Name** | MoodMate |
| **Package ID** | `com.moodmate.app` |
| **Version** | 1.0.0 |
| **Platform** | Android & iOS |
| **Framework** | React Native with Expo |

---

## 🛠️ Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.0 | UI Component Library |
| **React Native** | 0.81.5 | Cross-platform Mobile Framework |
| **Expo SDK** | ~54.0.6 | Development & Build Platform |
| **TypeScript** | ~5.9.2 | Type-safe JavaScript |

### Navigation

| Library | Version | Purpose |
|---------|---------|---------|
| `@react-navigation/native` | ^7.1.28 | Core Navigation |
| `@react-navigation/bottom-tabs` | ^7.10.1 | Tab Navigation |
| `@react-navigation/native-stack` | ^7.11.0 | Stack Navigation |

### Data & Storage

| Library | Version | Purpose |
|---------|---------|---------|
| `@react-native-async-storage/async-storage` | ^2.2.0 | Local Data Persistence |

### UI & Visualization

| Library | Version | Purpose |
|---------|---------|---------|
| `react-native-chart-kit` | ^6.12.0 | Charts & Graphs |
| `react-native-svg` | 15.12.1 | SVG Rendering |
| `react-native-vector-icons` | ^10.3.0 | Icon Library |
| `react-native-safe-area-context` | ^5.6.2 | Safe Area Handling |
| `react-native-screens` | ~4.16.0 | Native Screen Containers |
| `expo-status-bar` | ~3.0.9 | Status Bar Control |

---

## 📁 Project Structure

```
MoodMate/
├── app/                          # Main Application
│   ├── App.tsx                   # Root Component & Navigation Setup
│   ├── index.ts                  # Entry Point
│   ├── app.json                  # Expo Configuration
│   ├── package.json              # Dependencies
│   ├── tsconfig.json             # TypeScript Config
│   ├── assets/                   # Images & Icons
│   └── src/
│       ├── components/           # Reusable UI Components
│       ├── context/
│       │   └── AppContext.tsx    # Global State Management
│       ├── data/
│       │   ├── features.ts       # Feature Constants & Types
│       │   └── recommendations.json  # Recommendation Database
│       ├── screens/
│       │   ├── HomeScreen.tsx          # Main Dashboard
│       │   ├── MoodInputScreen.tsx     # Mood Entry Form
│       │   ├── RecommendationScreen.tsx # AI Recommendations
│       │   ├── TrendsScreen.tsx        # Weekly Analytics
│       │   └── ProfileScreen.tsx       # User Settings
│       └── utils/
│           └── recommendationEngine.ts # AI Logic
├── model.pkl                     # ML Model Data (828MB)
├── preprocessor.pkl              # Data Preprocessor
└── instruction.md                # Project Instructions
```

---

## 📱 Screens & Interfaces

### 1. Home Screen (`HomeScreen.tsx`)
- **Purpose**: Main dashboard displaying current mood status
- **Features**:
  - Current risk level indicator
  - Quick mood logging button
  - Recent mood history preview
  - Time-based greeting

### 2. Mood Input Screen (`MoodInputScreen.tsx`)
- **Purpose**: Log user's current mood and location
- **Features**:
  - Mood selection (5 mood types)
  - Location context selection
  - Slide-from-bottom animation

### 3. Recommendation Screen (`RecommendationScreen.tsx`)
- **Purpose**: Display personalized wellness recommendations
- **Features**:
  - Context-aware suggestions
  - Allergy-filtered recommendations
  - Alternative recommendation option
  - Slide-from-right animation

### 4. Trends Screen (`TrendsScreen.tsx`)
- **Purpose**: Weekly mood analytics and visualization
- **Features**:
  - Mood distribution charts
  - Weekly summary statistics
  - Risk level trends
  - Visual data representations

### 5. Profile Screen (`ProfileScreen.tsx`)
- **Purpose**: User settings and preferences
- **Features**:
  - Allergy management
  - Preferred goal selection
  - App settings

---

## 🎨 UI Theme & Design

### Color Palette

| Element | Color Code | Usage |
|---------|------------|-------|
| Background Primary | `#0F172A` | Main background |
| Background Secondary | `#1E293B` | Tab bar, cards |
| Border Color | `#334155` | Separators |
| Accent Purple | `#8B5CF6` | Active state |
| Text Secondary | `#64748B` | Inactive text |

### Mood Colors

| Mood | Emoji | Color |
|------|-------|-------|
| Happy | 😊 | `#4ADE80` (Green) |
| Stress | 😰 | `#F87171` (Red) |
| Worry | 😟 | `#FBBF24` (Yellow) |
| Frustration | 😤 | `#FB923C` (Orange) |
| Disappointment | 😔 | `#A78BFA` (Purple) |

---

## 🧠 Data Models & Types

### MoodEntry Interface
```typescript
interface MoodEntry {
    id: string;
    mood: MoodType;
    timestamp: number;
    location: LocationType;
    riskLevel: 'low' | 'medium' | 'high';
}
```

### UserProfile Interface
```typescript
interface UserProfile {
    allergies: string[];
    preferredGoal: UserGoalType;
}
```

### Type Definitions
```typescript
type MoodType = 'happy' | 'stress' | 'worry' | 'frustration' | 'disappointment';
type LocationType = 'home' | 'office' | 'meeting_room';
type TimePeriodType = 'morning' | 'afternoon' | 'evening' | 'night';
type UserGoalType = 'relaxation' | 'productivity' | 'social' | 'learning' | 'exercise';
```

---

## ⚙️ Core Features

### 1. Mood Tracking
- Log current emotional state with 5 mood options
- Capture location context (Home/Office/Meeting Room)
- Automatic timestamp recording
- Persistent storage using AsyncStorage

### 2. AI Recommendation Engine
- Context-aware recommendation matching
- Location-based filtering
- Mood-based keyword matching
- Allergy filtering to exclude triggering suggestions
- Alternative recommendation generation

### 3. Risk Level Assessment
- Analyzes mood history from last 7 days
- Calculates negative mood ratio
- Tracks improvement trends
- Returns: `high` | `stable` | `improving`

### 4. Weekly Analytics
- Mood distribution visualization
- Total mood entries count
- Trend analysis
- Visual charts using react-native-chart-kit

---

## 🔧 State Management

### AppContext (`AppContext.tsx`)
Global state provider using React Context API:

| State | Type | Description |
|-------|------|-------------|
| `moodHistory` | `MoodEntry[]` | All logged moods |
| `userProfile` | `UserProfile` | User preferences |
| `currentRiskLevel` | `string` | Current risk assessment |
| `isLoading` | `boolean` | Loading state |

### Available Actions
- `addMoodEntry(mood, location)` - Log new mood
- `updateAllergies(allergies)` - Update allergy list
- `updatePreferredGoal(goal)` - Change wellness goal

### Storage Keys
```typescript
const STORAGE_KEYS = {
    MOOD_HISTORY: '@moodmate_mood_history',
    USER_PROFILE: '@moodmate_user_profile',
};
```

---

## 🚀 Running the App

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo CLI
- Expo Go app on mobile device

### Installation
```bash
# Navigate to app directory
cd "d:\sheha\RP\mobile app\MoodMate\app"

# Install dependencies
npm install
```

### Development Commands

| Command | Description |
|---------|-------------|
| `npx expo start` | Start in LAN mode |
| `npx expo start --tunnel` | Start with tunnel (remote access) |
| `npx expo start --clear` | Start with cleared cache |
| `npx expo start --android` | Start Android emulator |
| `npx expo start --ios` | Start iOS simulator |

### Tunnel Mode Setup
```bash
# Install ngrok globally (one-time)
npm install -g @expo/ngrok@^4.1.0

# Run with tunnel
npx expo start --tunnel
```

---

## 📊 Recommendation Algorithm

The recommendation engine uses a scoring system:

1. **Location Matching** (+2 points per keyword match)
   - Home: `home, flexible, comfortable, cook, workout, meditation`
   - Office: `office, work break, desk, stretches`
   - Meeting Room: `meeting, break, focus`

2. **Mood Matching** (+3 points per keyword match)
   - Happy: `enjoy, energizing, fun, dance, social`
   - Stress: `calming, grounding, meditation, relax, soothing`
   - Worry: `calming, grounding, reassure, gentle`
   - Frustration: `release, exercise, workout, channel`
   - Disappointment: `uplifting, comfort, gentle, kind`

3. **Allergy Filtering** (-100 points if allergen detected)

---

## 📦 Build Configuration

### app.json Settings
```json
{
  "expo": {
    "name": "MoodMate",
    "slug": "moodmate",
    "orientation": "portrait",
    "userInterfaceStyle": "dark",
    "newArchEnabled": true
  }
}
```

### Platform-Specific
- **iOS Bundle ID**: `com.moodmate.app`
- **Android Package**: `com.moodmate.app`
- **Splash Background**: `#0F172A`

---

## 📝 License

This project is private and proprietary.

---

*Documentation generated on January 31, 2026*
