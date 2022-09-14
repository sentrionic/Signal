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

export interface ChatResponse {
  id: string;
  user: UserResponse;
}

export interface GroupResponse {
  id: string;
  name: string;
  image: string;
  createdAt: string;
  memberCount: number;
}

export interface GroupChatResponse {
  chats: ChatResponse[];
  groups: GroupResponse[];
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
