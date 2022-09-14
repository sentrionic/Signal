import { array, object, string } from 'yup';

export const GroupSchema = object().shape({
  name: string().min(3).max(30).trim().required('Name is required'),
  ids: array().of(string()),
});
