import { createHash, randomUUID } from 'node:crypto';

import { HttpStatus, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import ms from 'ms';

import { AllConfigType } from '@/config';

import { EnterpriseUser } from '../enterprise-user/domain';
import { EnterpriseUserService } from '../enterprise-user/enterprise-user.service';
import { Permission } from '../permission/domain';
import { PermissionService } from '../permission/permission.service';
import { Role } from '../role/domain/role';
import { Session } from '../session/domain';
import { SessionService } from '../session/session.service';
import { AuthLoginDto, LoginResponseDto } from './dto';
import { JwtRefreshPayloadType } from './strategies/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly enterpriseUserService: EnterpriseUserService,
    private readonly permissionService: PermissionService,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async validateLogin(loginDto: AuthLoginDto): Promise<LoginResponseDto> {
    const enterpriseUser = await this.enterpriseUserService.findUserByEmail(loginDto.email);

    if (!enterpriseUser) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: 'notFound',
        },
      });
    }

    const isValidPassword = await bcrypt.compare(loginDto.password, enterpriseUser.password);

    if (!isValidPassword) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          password: 'incorrectPassword',
        },
      });
    }

    const hash = createHash('sha256').update(randomUUID()).digest('hex');

    const session = await this.sessionService.create({
      userId: enterpriseUser.id,
      hash,
    });

    const permissions = await this.permissionService.findSlugsByRoleId(enterpriseUser.roles.map((role) => role.id));

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      user: enterpriseUser,
      hash,
      sessionId: session.id,
      roles: enterpriseUser.roles,
      permissions,
    });

    return {
      refreshToken,
      token,
      tokenExpires,
      user: {
        id: enterpriseUser.id,
        enterpriseId: enterpriseUser.enterpriseId,
        email: enterpriseUser.email,
      },
    };
  }

  async refreshToken(data: Pick<JwtRefreshPayloadType, 'sessionId' | 'hash'>): Promise<LoginResponseDto> {
    const session = await this.sessionService.findById(data.sessionId);

    if (!session?.active) {
      throw new UnauthorizedException();
    }

    if (session.hash !== data.hash) {
      throw new UnauthorizedException();
    }

    const hash = createHash('sha256').update(randomUUID()).digest('hex');

    const enterpriseUser = await this.enterpriseUserService.findById(session.userId);

    if (!enterpriseUser) {
      throw new UnauthorizedException();
    }

    await this.sessionService.update(session.id, {
      hash,
    });

    const permissions = await this.permissionService.findSlugsByRoleId(enterpriseUser.roles.map((role) => role.id));

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      user: enterpriseUser,
      hash,
      sessionId: session.id,
      roles: enterpriseUser.roles,
      permissions,
    });

    return {
      refreshToken,
      token,
      tokenExpires,
      user: {
        id: enterpriseUser.id,
        enterpriseId: enterpriseUser.enterpriseId,
        email: enterpriseUser.email,
      },
    };
  }

  async logout(sessionId: Session['id']): Promise<void> {
    await this.sessionService.inactivateById(sessionId);
  }

  private async getTokensData(data: {
    user: EnterpriseUser;
    roles: Pick<Role, 'id' | 'name'>[];
    permissions: Permission['slug'][];
    sessionId: Session['id'];
    hash: Session['hash'];
  }) {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });

    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const [token, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        {
          sub: data.user.id,
          enterpriseId: data.user.enterpriseId,
          sessionId: data.sessionId,
          roles: data.roles,
          permissions: data.permissions,
        },
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn,
        },
      ),
      await this.jwtService.signAsync(
        {
          sessionId: data.sessionId,
          hash: data.hash,
        },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
            infer: true,
          }),
        },
      ),
    ]);

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }
}
