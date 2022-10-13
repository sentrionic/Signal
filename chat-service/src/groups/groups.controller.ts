import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupResponse } from './dto/group.response';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddUserDto } from './dto/add-user.dto';
import { GroupSchema } from '../common/schema/group.schema';
import {
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ChatResponse } from '../chats/dto/chat.response';
import { GetUserId, JwtAuthGuard, YupValidationPipe } from '@senorg/common';

@Controller('groups')
@UseGuards(JwtAuthGuard)
@ApiTags('Group Operation')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create Group' })
  @ApiCreatedResponse({ description: 'Newly created group', type: GroupResponse })
  @ApiBody({ type: CreateGroupDto })
  async createGroup(
    @GetUserId() id: string,
    @Body(new YupValidationPipe(GroupSchema)) { name, ids = [] }: CreateGroupDto,
  ): Promise<ChatResponse> {
    return this.groupsService.createGroupChat(id, name, ids);
  }

  @Post(':chatId')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Add User' })
  @ApiCreatedResponse({ description: 'Success confirmation', type: Boolean })
  @ApiBody({ type: AddUserDto })
  async addUser(
    @GetUserId() userId: string,
    @Param('chatId') chatId: string,
    @Body() { username }: AddUserDto,
  ): Promise<boolean> {
    return this.groupsService.addUserToGroup(userId, username, chatId);
  }

  @Delete(':chatId')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Leave Group' })
  @ApiOkResponse({ description: 'Success confirmation', type: Boolean })
  async leaveGroup(@GetUserId() userId: string, @Param('chatId') chatId: string): Promise<boolean> {
    return this.groupsService.leaveGroup(userId, chatId);
  }
}
