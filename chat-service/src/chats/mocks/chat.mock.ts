import { Chat } from '../entities/chat.entity';
import { ChatType } from '../entities/chat-type.enum';

export const getMockChat = (): Chat => new Chat(ChatType.DIRECT_CHAT);

export const getMockGroupChat = (): Chat => new Chat(ChatType.GROUP_CHAT);
