import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { AuthLoginDto, LoginResponseDto, RefreshResponseDto } from './dto';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SerializeOptions({
    groups: ['me'],
  })
  @Post('login')
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: AuthLoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Omit<LoginResponseDto, 'refreshToken'>> {
    const { refreshToken, ...rest } = await this.authService.validateLogin(loginDto);

    // Set refreshToken in cookies.
    response.cookie('refreshToken', refreshToken);

    return {
      ...rest,
    };
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    type: RefreshResponseDto,
  })
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Request() request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Omit<RefreshResponseDto, 'refreshToken'>> {
    const { refreshToken, ...rest } = await this.authService.refreshToken({
      sessionId: request.user.sessionId,
      hash: request.user.hash,
    });

    // Set refreshToken in cookies.
    response.cookie('refreshToken', refreshToken);

    return {
      ...rest,
    };
  }

  @ApiBearerAuth()
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@Request() request): Promise<void> {
    await this.authService.logout(request.user.sessionId);
  }
}
