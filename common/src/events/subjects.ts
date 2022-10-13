export enum Subjects {
  // User Events
  UserCreated = 'user:created',
  UserUpdated = 'user:updated',
  UserUpdateLastOnline = 'user:update-last-online',

  FriendAdded = 'friend:added',
  FriendRemoved = 'friend:removed',

  RequestAdded = 'request:added',

  // Chat Events
  ChatMembersAdded = 'chat:members-added',
  ChatUpdateLastSeen = 'chat:update-last-seen',

  GroupMemberJoined = 'group:member-joined',
  GroupMemberAdded = 'group:member-added',
  GroupMemberRemoved = 'group:member-removed',

  MessageCreated = 'message:created',
  MessageUpdated = 'message:updated',
  MessageDeleted = 'message:deleted',

  // Media Events
  MediaAvatarUploaded = 'media:avatar-uploaded',
  MediaImageUploaded = 'media:image-uploaded',
  MediaFileDeleted = 'media:file-deleted',
}
