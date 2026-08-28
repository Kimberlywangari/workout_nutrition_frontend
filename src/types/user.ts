export type Role = "trainer" | "trainee";

export interface Trainer {
  id: number;
  username: string;
}

export interface Profile {
  id: number;
  user: string;
  age: number | null;
  gender: string | null;
  role: Role;
  trainer: string | null;
}
