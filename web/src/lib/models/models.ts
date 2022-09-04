export interface LoginUser {
  email: string;
  password: string;
}

export interface RegisterUser extends LoginUser {
  displayName: string;
}

export interface User {
  id: string;
  displayName: string;
  email: string;
  image: string;
}

export interface FieldError {
  field: string;
  message: string;
}
