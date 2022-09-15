import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  Put,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { MessageResponse } from './dto/message.response';
import { GetUserId } from '../common/decorator/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { YupValidationPipe } from '../common/pipes/validation.pipe';
import { MessageSchema } from '../common/schema/message.schema';
import { BufferFile } from '../common/types/buffer.file';

@ApiTags('Message Operation')
@Controller('messages')
@UseGuards(AuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('chats/:chatId')
  @ApiOperation({ summary: 'Get Chat Messages' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiCookieAuth()
  @ApiOkResponse({ type: [MessageResponse] })
  async getChatMessages(
    @Param('chatId') chatId: string,
    @GetUserId() userId: string,
    @Query('cursor') cursor?: string | null,
  ): Promise<MessageResponse[]> {
    return this.messagesService.getChatMessages(userId, chatId, cursor);
  }

  @Get('groups/:groupId')
  @ApiOperation({ summary: 'Get Group Messages' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiCookieAuth()
  @ApiOkResponse({ type: [MessageResponse] })
  async getGroupMessages(
    @Param('groupId') groupId: string,
    @GetUserId() userId: string,
    @Query('cursor') cursor?: string | null,
  ): Promise<MessageResponse[]> {
    return this.messagesService.getGroupMessages(userId, groupId, cursor);
  }

  @Post('chats/:chatId')
  @UseInterceptors(FileInterceptor('file'))
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Send Message to Chat' })
  @ApiOkResponse({ description: 'Message Success', type: Boolean })
  @ApiUnauthorizedResponse()
  @ApiBody({ type: CreateMessageDto })
  @ApiConsumes('multipart/form-data')
  async createChatMessage(
    @GetUserId() userId: string,
    @Param('chatId') chatId: string,
    @Body(new YupValidationPipe(MessageSchema)) input: CreateMessageDto,
    @UploadedFile() file?: BufferFile,
  ): Promise<boolean> {
    return this.messagesService.createChatMessage(userId, chatId, input, file);
  }

  @Post('groups/:groupId')
  @UseInterceptors(FileInterceptor('file'))
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Send Message to Group' })
  @ApiOkResponse({ description: 'Message Success', type: Boolean })
  @ApiUnauthorizedResponse()
  @ApiBody({ type: CreateMessageDto })
  @ApiConsumes('multipart/form-data')
  async createGroupMessage(
    @GetUserId() userId: string,
    @Param('groupId') groupId: string,
    @Body(new YupValidationPipe(MessageSchema)) input: CreateMessageDto,
    @UploadedFile() file?: BufferFile,
  ): Promise<boolean> {
    return this.messagesService.createGroupMessage(userId, groupId, input, file);
  }

  @Put('/:messageId')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Edit Message' })
  @ApiOkResponse({ description: 'Edit Success', type: Boolean })
  @ApiUnauthorizedResponse()
  @ApiBody({ type: UpdateMessageDto })
  async editMessage(
    @GetUserId() user: string,
    @Param('messageId') messageId: string,
    @Body(new YupValidationPipe(MessageSchema)) input: UpdateMessageDto,
  ): Promise<boolean> {
    return this.messagesService.updateMessage(user, messageId, input);
  }

  @Delete('/:messageId')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete Message' })
  @ApiOkResponse({ description: 'Delete Success', type: Boolean })
  @ApiUnauthorizedResponse()
  async deleteMessage(
    @GetUserId() userId: string,
    @Param('messageId') messageId: string,
  ): Promise<boolean> {
    return this.messagesService.deleteMessage(userId, messageId);
  }
}
