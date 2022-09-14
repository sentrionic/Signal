import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GetUserId } from '../common/decorator/user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { GroupResponse } from './dto/group.response';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddUserDto } from './dto/add-user.dto';
import { YupValidationPipe } from '../common/pipes/validation.pipe';
import { GroupSchema } from '../common/schema/group.schema';
import {
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@Controller('groups')
@UseGuards(AuthGuard)
@ApiTags('Group Operation')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @ApiCookieAuth()
  @ApiOperation({ summary: "Get current user's groups" })
  @ApiOkResponse({ description: 'List of groups', type: [GroupResponse] })
  async fetchGroups(@GetUserId() id: string): Promise<GroupResponse[]> {
    return this.groupsService.getUserGroups(id);
  }

  @Post()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create Group' })
  @ApiCreatedResponse({ description: 'Newly created group', type: GroupResponse })
  @ApiBody({ type: CreateGroupDto })
  async createGroup(
    @GetUserId() id: string,
    @Body(new YupValidationPipe(GroupSchema)) { name, ids = [] }: CreateGroupDto,
  ): Promise<GroupResponse> {
    return this.groupsService.createGroupChat(id, name, ids);
  }

  @Post(':groupID')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Add User' })
  @ApiCreatedResponse({ description: 'Success confirmation', type: Boolean })
  @ApiBody({ type: AddUserDto })
  async addUser(
    @GetUserId() userId: string,
    @Param('groupID') groupID: string,
    @Body() { username }: AddUserDto,
  ): Promise<boolean> {
    return this.groupsService.addUserToGroup(userId, username, groupID);
  }

  @Delete(':groupID')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Leave Group' })
  @ApiOkResponse({ description: 'Success confirmation', type: Boolean })
  async leaveGroup(
    @GetUserId() userId: string,
    @Param('groupID') groupID: string,
  ): Promise<boolean> {
    return this.groupsService.leaveGroup(userId, groupID);
  }
}
