
export type Role = 'admin' | 'user';

export interface Car {
  id: string;
  make: string;
  model: string;
  plate: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string; // Used as login
  password: string;
  role: Role;
  cars: Car[];
}

export interface Registration {
  id: string;
  userId: string;
  carId: string;
  weekId: string; // Format: "YYYY-WNN"
  monthId: string; // Format: "YYYY-MM"
  timestamp: string;
  parkingSpot?: string;
}

export interface AppSettings {
  weeklyCapacity: number;
  manualOpenWeeks: string[]; // List of weeks manually opened by admin
  loginImageUrl: string | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
