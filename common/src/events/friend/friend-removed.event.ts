export class FriendRemovedEvent {
  constructor(public readonly receiverId: string, public readonly currentId: string) {}

  toString() {
    return JSON.stringify({
      receiverId: this.receiverId,
      currentId: this.currentId,
    });
  }
}
