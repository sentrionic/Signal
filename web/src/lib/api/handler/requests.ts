import { handler } from '../handler';
import type { RequestResponse } from '../index';

export const getRequests = async (): Promise<RequestResponse[]> => {
  return await handler.get('requests').json<RequestResponse[]>();
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
