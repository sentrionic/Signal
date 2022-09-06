import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { GetUserId } from '../common/decorator/user.decorator';
import { AddRequestDto } from './dto/add-request.dto';
import { UserResponse } from './dto/user.response';
import { RequestResponse } from './dto/request.response';
import { YupValidationPipe } from '../common/pipes/validation.pipe';
import { FriendSchema } from '../common/schema/user.schema';

@Controller()
@UseGuards(AuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get('requests')
  async getRequests(@GetUserId() userId: string): Promise<RequestResponse[]> {
    return this.friendsService.getFriendRequests(userId);
  }

  @Post('requests')
  async addRequest(
    @GetUserId() userId: string,
    @Body(new YupValidationPipe(FriendSchema)) { username }: AddRequestDto,
  ): Promise<boolean> {
    return this.friendsService.addFriendRequest(userId, username);
  }

  @Post('requests/:id/accept')
  @HttpCode(200)
  async acceptRequest(@GetUserId() userId: string, @Param('id') id: string): Promise<boolean> {
    return this.friendsService.acceptFriendRequest(userId, id);
  }

  @Post('requests/:id/remove')
  @HttpCode(200)
  async removeRequest(@GetUserId() userId: string, @Param('id') id: string): Promise<boolean> {
    return this.friendsService.removeFriendRequest(userId, id);
  }

  @Get('friends')
  async getFriends(@GetUserId() userId: string): Promise<UserResponse[]> {
    return this.friendsService.getFriends(userId);
  }

  @Delete('friends/:id')
  @HttpCode(200)
  async removeFriend(@GetUserId() userId: string, @Param('id') id: string): Promise<boolean> {
    return this.friendsService.removeFriend(userId, id);
  }
}
