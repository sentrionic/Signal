import { Entity, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Message } from './message.entity';
import { v4 } from 'uuid';

@Entity()
export class Attachment {
  @PrimaryKey()
  id: string;

  @Property({ unique: true })
  url: string;

  @Property()
  filetype: string;

  @Property()
  filename: string;

  @OneToOne(() => Message, (message) => message.attachment, {
    onDelete: 'CASCADE',
  })
  message: Message;

  constructor(url: string, filetype: string, filename: string, message: Message) {
    this.id = v4();
    this.url = url;
    this.filetype = filetype;
    this.filename = filename;
    this.message = message;
  }
}
