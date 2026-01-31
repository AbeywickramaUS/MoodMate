// Feature options for MoodMate app
export const MOODS = [
  { id: 'happy', label: 'Happy', emoji: '😊', color: '#4ADE80' },
  { id: 'stress', label: 'Stress', emoji: '😰', color: '#F87171' },
  { id: 'worry', label: 'Worry', emoji: '😟', color: '#FBBF24' },
  { id: 'frustration', label: 'Frustration', emoji: '😤', color: '#FB923C' },
  { id: 'disappointment', label: 'Disappointment', emoji: '😔', color: '#A78BFA' },
] as const;

export const LOCATIONS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'office', label: 'Office', icon: '🏢' },
  { id: 'meeting_room', label: 'Meeting Room', icon: '👥' },
] as const;

export const TIME_PERIODS = [
  { id: 'morning', label: 'Morning', range: '6AM - 12PM' },
  { id: 'afternoon', label: 'Afternoon', range: '12PM - 6PM' },
  { id: 'evening', label: 'Evening', range: '6PM - 10PM' },
  { id: 'night', label: 'Night', range: '10PM - 6AM' },
] as const;

export const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
] as const;

export const USER_GOALS = [
  { id: 'relaxation', label: 'Relaxation', icon: '🧘' },
  { id: 'productivity', label: 'Productivity', icon: '💪' },
  { id: 'social', label: 'Social Connection', icon: '👥' },
  { id: 'learning', label: 'Learning', icon: '📚' },
  { id: 'exercise', label: 'Exercise', icon: '🏃' },
] as const;

export type MoodType = typeof MOODS[number]['id'];
export type LocationType = typeof LOCATIONS[number]['id'];
export type TimePeriodType = typeof TIME_PERIODS[number]['id'];
export type UserGoalType = typeof USER_GOALS[number]['id'];
