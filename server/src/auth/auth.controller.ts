import { Controller, Post, Get, Body, Headers } from '@nestjs/common';
import { AuthService, User } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: { username?: string; email?: string; password?: string }) {
    return this.authService.login(body.username || body.email || '', body.password || '');
  }

  @Post('refresh')
  refresh(@Body() body: { refreshToken?: string }) {
    return this.authService.refresh(body.refreshToken || '');
  }

  @Get('users')
  getUsers(): User[] {
    return this.authService.getUsers();
  }

  @Get('me')
  getCurrentUser(@Headers('authorization') authHeader?: string): User {
    return this.authService.getUserFromHeader(authHeader);
  }
}
