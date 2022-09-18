/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface RegisterInput {
  /** Unique. Must be a valid email. */
  email: string;

  /** Min 6, max 150 characters. */
  password: string;

  /** Min 3, max 30 characters. */
  displayName: string;
}

export interface Account {
  id: string;
  email: string;
  username: string;
  displayName: string;
  image: string;
  bio: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface LoginInput {
  /** Unique. Must be a valid email. */
  email: string;

  /** Min 6, max 150 characters. */
  password: string;
}

export interface UpdateUserInput {
  /** Unique. Must be a valid email. */
  email: string;

  /** Min 3, max 30 characters. */
  displayName: string;

  /** At most 200 characters. */
  bio: string;
}

export interface UserResponse {
  id: string;
  username: string;
  displayName: string;
  image: string;
  bio: string;
  lastOnline: string;
}

export enum RequestType {
  INCOMING = 'INCOMING',
  OUTGOING = 'OUTGOING',
}

export interface RequestResponse {
  user: UserResponse;
  type: RequestType;
}

export interface AddRequestDto {
  username: string;
}

export interface GroupResponse {
  id: string;
  name: string;
  image: string;
  createdAt: string;
  memberCount: number;
}

export interface ChatResponse {
  id: string;
  type: 'GROUP CHAT' | 'DIRECT CHAT';
  user: UserResponse | null;
  group: GroupResponse | null;
  lastMessage: string | null;
}

export interface ChatDto {
  contactID: string;
}

export interface CreateGroupDto {
  name: string;
  ids: string[];
}

export interface AddUserDto {
  username: string;
}

export interface AttachmentResponse {
  url: string;
  filetype: string;
  filename: string;
}

export interface MessageResponse {
  id: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO';
  text: string | null;
  user: UserResponse;
  attachment: AttachmentResponse | null;
  sentAt: string;
  deliveredAt: string | null;
  seenAt: string | null;
}

export interface CreateMessageDto {
  /** The message. Either this or the file must not be null */
  text?: string | null;

  /** @format binary */
  file?: File | null;
}

export interface UpdateMessageDto {
  /** The new message. */
  text: string;
}
