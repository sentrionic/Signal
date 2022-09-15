import type { AddUserDto, ChatResponse, CreateGroupDto } from '..';
import { handler } from '../handler';

export const createGroup = async (input: CreateGroupDto): Promise<ChatResponse> =>
  await handler.post('groups', { json: { ...input } }).json<ChatResponse>();

export const addMemberToGroup = async (id: string, input: AddUserDto): Promise<boolean> =>
  await handler.post(`groups/${id}`, { json: { ...input } }).json<boolean>();

export const leaveGroup = async (id: string): Promise<boolean> =>
  await handler.delete(`groups/${id}`).json<boolean>();
