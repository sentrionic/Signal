import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { GetUserId } from '../common/decorator/user.decorator';
import { AddRequestDto } from './dto/add-request.dto';
import { UserResponse } from './dto/user.response';
import { RequestResponse } from './dto/request.response';
import { YupValidationPipe } from '../common/pipes/validation.pipe';
import { FriendSchema } from '../common/schema/user.schema';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@Controller()
@UseGuards(AuthGuard)
@ApiTags('Friend Operation')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get('requests')
  @ApiCookieAuth()
  @ApiOperation({ summary: "Get current user's requests" })
  @ApiOkResponse({ description: 'A list of requests', type: [RequestResponse] })
  async getRequests(@GetUserId() userId: string): Promise<RequestResponse[]> {
    return this.friendsService.getFriendRequests(userId);
  }

  @Post('requests')
  @ApiOperation({ summary: 'Send friend request' })
  @ApiOkResponse({ description: 'Success confirmation', type: Boolean })
  @ApiBadRequestResponse({ description: 'Invalid Username' })
  @ApiBody({ type: AddRequestDto })
  async addRequest(
    @GetUserId() userId: string,
    @Body(new YupValidationPipe(FriendSchema)) { username }: AddRequestDto,
  ): Promise<boolean> {
    return this.friendsService.addFriendRequest(userId, username);
  }

  @Post('requests/:id/accept')
  @HttpCode(200)
  @ApiOperation({ summary: 'Accept Friend Request' })
  @ApiOkResponse({ description: 'Success confirmation', type: Boolean })
  @ApiCookieAuth()
  async acceptRequest(@GetUserId() userId: string, @Param('id') id: string): Promise<boolean> {
    return this.friendsService.acceptFriendRequest(userId, id);
  }

  @Post('requests/:id/remove')
  @HttpCode(200)
  @ApiOperation({ summary: 'Remove Friend Request' })
  @ApiOkResponse({ description: 'Success confirmation', type: Boolean })
  @ApiCookieAuth()
  async removeRequest(@GetUserId() userId: string, @Param('id') id: string): Promise<boolean> {
    return this.friendsService.removeFriendRequest(userId, id);
  }

  @Get('friends')
  @ApiCookieAuth()
  @ApiOperation({ summary: "Get current user's friends" })
  @ApiOkResponse({ description: 'A list of friends', type: [UserResponse] })
  async getFriends(@GetUserId() userId: string): Promise<UserResponse[]> {
    return this.friendsService.getFriends(userId);
  }

  @Delete('friends/:id')
  @HttpCode(200)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Remove Friend' })
  @ApiOkResponse({ description: 'Success confirmation', type: Boolean })
  async removeFriend(@GetUserId() userId: string, @Param('id') id: string): Promise<boolean> {
    return this.friendsService.removeFriend(userId, id);
  }
}
