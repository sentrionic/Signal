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

@Controller('chats')
@UseGuards(AuthGuard)
@ApiTags('Chat Operation')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

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
