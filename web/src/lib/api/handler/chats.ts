import type { ChatResponse, GroupChatResponse } from '..';
import { handler } from '../handler';

export const getAllChats = async (): Promise<GroupChatResponse> => {
  return await handler.get('chats/all').json<GroupChatResponse>();
};

export const getOrCreateChat = async (id: string): Promise<ChatResponse> => {
  return await handler.post('chats', { json: { contactID: id } }).json<ChatResponse>();
};
