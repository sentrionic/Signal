import { RequestResponse } from '../../types/request.response';

export class RequestAddedEvent {
  constructor(public readonly receiverId: string, public readonly request: RequestResponse) {}

  toString() {
    return JSON.stringify({
      receiverId: this.receiverId,
      request: this.request,
    });
  }
}
