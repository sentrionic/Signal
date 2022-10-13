export interface UserResponse {
  id: string;
  username: string;
  displayName: string;
  image: string;
  bio: string;
  lastOnline?: string | null;
}
