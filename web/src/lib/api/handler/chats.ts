import type { ChatResponse } from '..';
import { handler } from '../handler';

export const getChats = async (): Promise<ChatResponse[]> => {
  return await handler.get('chats').json<ChatResponse[]>();
};

export const getOrCreateChat = async (id: string): Promise<ChatResponse> => {
  return await handler.post('chats', { json: { contactID: id } }).json<ChatResponse>();
};
