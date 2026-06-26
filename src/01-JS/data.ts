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

// Changed to let so we can modify the contents at runtime
export let users: User[] = [
  { id: "u-1", name: "Nabil", email: "nabil@example.com" },
  { id: "u-2", name: "Alex", email: "alex@example.com" },
];

export let workouts: Workout[] = [
  { id: "w-1", userId: "u-1", title: "Heavy Squat Day", duration: 45 },
  {
    id: "w-2",
    userId: "u-1",
    title: "Zsh Script Optimization Run",
    duration: 60,
  },
  { id: "w-3", userId: "u-2", title: "Cardio Blitz", duration: 30 },
];

// Helper functions to simulate database updates on mutable state
export const mutationUtils = {
  addWorkout: (w: Workout) => workouts.push(w),
  updateWorkout: (id: string, title: string, duration: number) => {
    const w = workouts.find((item) => item.id === id);
    if (w) {
      w.title = title;
      w.duration = duration;
    }
    return w;
  },
  deleteWorkout: (id: string) => {
    const index = workouts.findIndex((item) => item.id === id);
    if (index !== -1) {
      const [deleted] = workouts.splice(index, 1);
      return deleted;
    }
    return null;
  },
};
