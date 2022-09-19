import { MessageResponse } from '../dto/message.response';

export const mockSocketService = {
  sendMessage: (_: string, __: MessageResponse) => {
    return;
  },
  editMessage: (_: string, __: MessageResponse) => {
    return;
  },
  deleteMessage: (_: string, __: MessageResponse) => {
    return;
  },
};
