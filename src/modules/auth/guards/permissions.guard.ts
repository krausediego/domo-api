import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class PermissionsGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissionsRequired = this.reflector.get<string[]>('permissions', context.getHandler());
    const request = context.switchToHttp().getRequest();

    if (!permissionsRequired?.length) {
      return true;
    }

    // Primeiro verifica se o usuário está autenticado
    const isAuthenticated = await super.canActivate(context);

    if (!isAuthenticated) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    if (!request.user) {
      throw new UnauthorizedException('Usuário não encontrado no request');
    }

    return this.matchPermissions(permissionsRequired, request.user.permissions as string[]);
  }

  matchPermissions(permissionsRequired: string[], permissions: string[]): boolean {
    return permissions.some((permission) => permissionsRequired?.includes(permission));
  }
}
