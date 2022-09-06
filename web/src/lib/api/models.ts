export interface LoginUser {
  email: string;
  password: string;
}

export interface RegisterUser extends LoginUser {
  displayName: string;
}

export interface Account {
  id: string;
  displayName: string;
  email: string;
  image: string;
  username: string;
  bio: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface Friend {
  id: string;
  displayName: string;
  image: string;
  username: string;
  bio: string;
}

export enum RequestType {
  INCOMING = 'INCOMING',
  OUTGOING = 'OUTGOING',
}

export interface Request {
  user: Friend;
  type: RequestType;
}
