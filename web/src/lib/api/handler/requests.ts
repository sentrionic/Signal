import { handler } from '../handler';
import type { Request } from '../models';

export const getRequests = async (): Promise<Request[]> => {
  return await handler.get('requests').json<Request[]>();
};

export const sendRequest = async (username: string): Promise<boolean> => {
  return await handler.post('requests', { json: { username } }).json<boolean>();
};

export const removeRequest = async (id: string): Promise<boolean> => {
  return await handler.post(`requests/${id}/remove`).json<boolean>();
};

export const acceptRequest = async (id: string): Promise<boolean> => {
  return await handler.post(`requests/${id}/accept`).json<boolean>();
};
