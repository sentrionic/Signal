import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { GroupResponse } from './dto/group.response';
import { InjectRepository } from '@mikro-orm/nestjs';
import { User } from '../users/entities/user.entity';
import { EntityRepository } from '@mikro-orm/core';
import { Group } from './entities/group.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(User)
    private userRepository: EntityRepository<User>,
    @InjectRepository(Group)
    private groupRepository: EntityRepository<Group>,
  ) {}

  async getUserGroups(current: string): Promise<GroupResponse[]> {
    const chats = await this.groupRepository.find({
      members: { id: current },
    });

    const response: GroupResponse[] = [];

    for (const c of chats) {
      await this.groupRepository.populate(c, ['members']);
      response.push(c.toGroupResponse());
    }

    return response;
  }

  async createGroupChat(current: string, name: string, ids: string[]): Promise<GroupResponse> {
    const group = new Group(name);

    const users = await this.userRepository.find({ id: { $in: [...ids, current] } });

    users.forEach((u) => group.members.add(u));

    await this.groupRepository.persistAndFlush(group);

    return group.toGroupResponse();
  }

  async addUserToGroup(currentId: string, username: string, groupID: string): Promise<boolean> {
    const current = await this.userRepository.getReference(currentId);
    const group = await this.groupRepository.findOne({ id: groupID }, { populate: ['members'] });

    if (!group) {
      throw new NotFoundException();
    }

    if (!group.members.contains(current)) {
      throw new UnauthorizedException();
    }

    const member = await this.userRepository.findOne({ username });

    if (!member) {
      throw new NotFoundException();
    }

    if (group.members.contains(member)) {
      throw new BadRequestException({ message: 'This user is already a member' });
    }

    group.members.add(member);

    await this.groupRepository.flush();

    return true;
  }

  async leaveGroup(currentId: string, groupID: string): Promise<boolean> {
    const current = await this.userRepository.getReference(currentId);
    const group = await this.groupRepository.findOne({ id: groupID }, { populate: ['members'] });

    if (!group) {
      throw new NotFoundException();
    }

    group.members.remove(current);

    await this.groupRepository.flush();

    return true;
  }
}
