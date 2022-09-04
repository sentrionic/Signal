export interface FieldError {
  field: string;
  message: string;
}

export const formatErrors = (errors: FieldError[]) => {
  return { errors };
};
