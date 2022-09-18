import type { MessageResponse } from '..';
import { handler } from '../handler';

export const getMessages = async (
  id: string,
  cursor?: string | null
): Promise<MessageResponse[]> => {
  return await handler
    .get(`messages/${id}${cursor ? `?cursor=${cursor}` : ''}`)
    .json<MessageResponse[]>();
};

export const createMessage = async (id: string, data: FormData): Promise<boolean> => {
  return await handler.post(`messages/${id}`, { body: data }).json<boolean>();
};

export const updateMessage = async (id: string, text: string): Promise<boolean> => {
  return await handler.put(`messages/${id}`, { json: { text } }).json<boolean>();
};

export const deleteMessage = async (id: string): Promise<boolean> => {
  return await handler.delete(`messages/${id}`).json<boolean>();
};
