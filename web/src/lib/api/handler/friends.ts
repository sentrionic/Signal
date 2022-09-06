import { handler } from '../handler';
import type { Friend } from '../models';

export const getFriends = async (): Promise<Friend[]> => {
  return await handler.get('friends').json<Friend[]>();
};

export const removeFriend = async (id: string): Promise<void> => {
  await handler.delete(`friends/${id}`);
};
