export class UserUpdatedEvent {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly bio: string,
    public readonly displayName: string,
    public readonly image: string,
    public readonly version: number,
  ) {}

  toString() {
    return JSON.stringify({
      id: this.id,
      displayName: this.displayName,
      username: this.username,
      bio: this.bio,
      image: this.image,
      version: this.version,
    });
  }
}
