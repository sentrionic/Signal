import type { UserResponse } from '..';
import { handler } from '../handler';

export const getFriends = async (): Promise<UserResponse[]> => {
  return await handler.get('friends').json<UserResponse[]>();
};

export const removeFriend = async (id: string): Promise<void> => {
  await handler.delete(`friends/${id}`);
};
