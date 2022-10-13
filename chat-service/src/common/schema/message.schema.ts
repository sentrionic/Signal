import { object, string } from 'yup';

export const MessageSchema = object().shape({
  text: string()
    .optional()
    .test('empty', 'Message must not be empty', (text) => text?.length !== 0)
    .max(2000),
});
