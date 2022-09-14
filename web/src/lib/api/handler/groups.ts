import type { AddUserDto, CreateGroupDto, GroupResponse } from '..';
import { handler } from '../handler';

export const createGroup = async (input: CreateGroupDto): Promise<GroupResponse> =>
  await handler.post('groups', { json: { ...input } }).json<GroupResponse>();

export const addMemberToGroup = async (id: string, input: AddUserDto): Promise<boolean> =>
  await handler.post(`groups/${id}`, { json: { ...input } }).json<boolean>();

export const leaveGroup = async (id: string): Promise<boolean> =>
  await handler.delete(`groups/${id}`).json<boolean>();
