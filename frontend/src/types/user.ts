export interface User {
  id: string;
  name: string;
  email: string;
  role: string; // <-- Add this line
  given_name?: string;
  family_name?: string;
  // ...other properties
}