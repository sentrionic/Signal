import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Account } from './dto/account.response';
import { RegisterInput } from './dto/register.input';
import { UsersService } from './users.service';
import e from 'express';
import { YupValidationPipe } from '../common/pipes/validation.pipe';
import { LoginInput } from './dto/login.input';
import { AuthGuard } from '../common/guards/auth.guard';
import { GetUserId } from '../common/decorator/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserInput } from './dto/update-user.dto';
import { BufferFile } from 'src/common/types/buffer.file';
import { ConfigService } from '@nestjs/config';
import { RegisterSchema, UpdateSchema } from '../common/schema/user.schema';

@Controller('accounts')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UsePipes(new YupValidationPipe(RegisterSchema))
  async register(@Body() input: RegisterInput, @Req() req: e.Request): Promise<Account> {
    const user = await this.usersService.register(input);
    req.session.userId = user.id;
    return user;
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() input: LoginInput, @Req() req: e.Request): Promise<Account> {
    const user = await this.usersService.login(input);
    req.session.userId = user.id;
    return user;
  }

  @Get()
  @UseGuards(AuthGuard)
  async getCurrent(@GetUserId() userId: string): Promise<Account> {
    return await this.usersService.getCurrent(userId);
  }

  @Put()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateAccount(
    @GetUserId() userId: string,
    @Body(new YupValidationPipe(UpdateSchema)) data: UpdateUserInput,
    @UploadedFile() image?: BufferFile,
  ): Promise<Account> {
    return await this.usersService.updateAccount(userId, data, image);
  }

  @Post('/logout')
  async logout(@Req() req: e.Request, @Res() res: e.Response): Promise<any> {
    req.session?.destroy((err) => console.log(err));
    const cookie = this.configService.get('COOKIE_NAME') as string;
    return res.clearCookie(cookie).status(200).send(true);
  }
}
