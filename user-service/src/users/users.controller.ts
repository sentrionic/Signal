import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
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
import { YupValidationPipe, GetUserId, FieldError, JwtAuthGuard, BufferFile } from '@senorg/common';
import { LoginInput } from './dto/login.input';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserInput } from './dto/update-user.dto';
import { RegisterSchema, UpdateSchema } from '../common/schema/user.schema';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../common/types/env';

@Controller('accounts')
@ApiTags('User Operation')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  @Post()
  @UsePipes(new YupValidationPipe(RegisterSchema))
  @ApiOperation({ summary: 'Register Account' })
  @ApiCreatedResponse({ description: 'Newly Created User', type: Account })
  @ApiBadRequestResponse({ type: [FieldError] })
  @ApiBody({ type: RegisterInput })
  async register(
    @Body() input: RegisterInput,
    @Res({ passthrough: true }) res: e.Response,
  ): Promise<Account> {
    const user = await this.usersService.register(input);
    this.setCookie(res, user.id);
    return user;
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'User Login' })
  @ApiOkResponse({ description: 'Current User', type: Account })
  @ApiBadRequestResponse({ description: 'Invalid credentials' })
  @ApiBody({ type: LoginInput })
  async login(
    @Body() input: LoginInput,
    @Res({ passthrough: true }) res: e.Response,
  ): Promise<Account> {
    const user = await this.usersService.login(input);
    this.setCookie(res, user.id);
    return user;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get Current User' })
  @ApiOkResponse({ description: 'Current user', type: Account })
  async getCurrent(@GetUserId() userId: string): Promise<Account> {
    return await this.usersService.getCurrent(userId);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update Current User' })
  @ApiOkResponse({ description: 'Update Success', type: Account })
  @ApiUnauthorizedResponse()
  @ApiBadRequestResponse({ type: [FieldError] })
  @ApiBody({ type: UpdateUserInput })
  @ApiConsumes('multipart/form-data')
  async updateAccount(
    @GetUserId() userId: string,
    @Body(new YupValidationPipe(UpdateSchema)) data: UpdateUserInput,
    @UploadedFile() image?: BufferFile,
  ): Promise<Account> {
    return await this.usersService.updateAccount(userId, data, image);
  }

  @Post('/logout')
  @ApiOperation({ summary: 'User Logout' })
  async logout(@Res({ passthrough: true }) res: e.Response): Promise<boolean> {
    res.clearCookie(this.configService.getOrThrow('COOKIE_NAME'));
    return true;
  }

  private setCookie(res: e.Response, userId: string) {
    const jwt = this.jwtService.sign({ userId });
    res.cookie(this.configService.getOrThrow('COOKIE_NAME'), jwt, {
      maxAge: this.configService.get<number>('SESSION_DURATION') ?? 0,
    });
  }
}
