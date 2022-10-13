export class FileDeletedEvent {
  constructor(public readonly filename: string) {}

  toString() {
    return JSON.stringify({
      filename: this.filename,
    });
  }
}
