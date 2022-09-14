import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { GetUserId } from '../common/decorator/user.decorator';
import { ChatResponse } from './dto/chat.response';
import { AuthGuard } from '../common/guards/auth.guard';
import { ChatDto } from './dto/chat.dto';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GroupsService } from '../groups/groups.service';
import { GroupChatResponse } from '../groups/dto/group-chat.response';

@Controller('chats')
@UseGuards(AuthGuard)
@ApiTags('Chat Operation')
export class ChatsController {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly groupService: GroupsService,
  ) {}

  @Get('all')
  @ApiCookieAuth()
  @ApiOperation({ summary: "Get current user's chats and groups" })
  @ApiOkResponse({ description: 'List of chats', type: GroupChatResponse })
  async getChatsAndGroups(@GetUserId() id: string): Promise<GroupChatResponse> {
    const [chats, groups] = await Promise.all([
      this.chatsService.getUserChats(id),
      this.groupService.getUserGroups(id),
    ]);

    return { chats, groups };
  }

  @Get()
  @ApiCookieAuth()
  @ApiOperation({ summary: "Get current user's chats" })
  @ApiOkResponse({ description: 'List of chats', type: [ChatResponse] })
  async getChats(@GetUserId() id: string): Promise<ChatResponse[]> {
    return this.chatsService.getUserChats(id);
  }

  @Post()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get an existing chat or create a new one' })
  @ApiCreatedResponse({ description: 'Newly created chat', type: ChatResponse })
  async getOrCreateChat(
    @GetUserId() id: string,
    @Body() { contactID }: ChatDto,
  ): Promise<ChatResponse> {
    return this.chatsService.getOrCreateChat(id, contactID);
  }
}
