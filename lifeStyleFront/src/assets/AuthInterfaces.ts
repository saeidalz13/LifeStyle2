export interface User {
  id: number;
  email: string;
  password: string;
  created_at: {
    String: string;
    Valid: boolean;
  };
}
