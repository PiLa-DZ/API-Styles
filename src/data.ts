export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Workout {
  id: string;
  userId: string;
  title: string;
  duration: number; // in minutes
}

export const users: User[] = [
  { id: "u-1", name: "Nabil", email: "nabil@example.com" },
  { id: "u-2", name: "Alex", email: "alex@example.com" },
];

export const workouts: Workout[] = [
  { id: "w-1", userId: "u-1", title: "Heavy Squat Day", duration: 45 },
  {
    id: "w-2",
    userId: "u-1",
    title: "Zsh Script Optimization Run",
    duration: 60,
  },
  { id: "w-3", userId: "u-2", title: "Cardio Blitz", duration: 30 },
];
