import { Controller, Get, Post, Query, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('oasis')
  async getOasisAuthUrl(@Res() res: Response) {
    const url = await this.authService.getOasisAuthUrl();
    res.redirect(url);
  }

  @Get('callback')
  async handleOasisCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response
  ) {
    if (error) {
      return res.redirect(`http://localhost:3000?error=${error}`);
    }

    try {
      const tokens = await this.authService.exchangeCodeForTokens(code, state);
      // Set tokens as httpOnly cookies
      res.cookie('oasis_access_token', tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000, // 1 hour
      });
      res.cookie('oasis_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 3600000, // 30 days
      });
      res.redirect('http://localhost:3000');
    } catch (err) {
      res.redirect(`http://localhost:3000?error=${err.message}`);
    }
  }

  @Post('refresh')
  async refreshTokens(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies.oasis_refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token not found' });
    }

    try {
      const tokens = await this.authService.refreshTokens(refreshToken);
      // Update cookies
      res.cookie('oasis_access_token', tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000, // 1 hour
      });
      res.json({ success: true });
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  }

  @Get('userinfo')
  async getUserInfo(@Req() req: Request) {
    const accessToken = req.cookies.oasis_access_token;
    if (!accessToken) {
      return { error: 'Access token not found' };
    }

    try {
      return await this.authService.getUserInfo(accessToken);
    } catch (err) {
      return { error: err.message };
    }
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('oasis_access_token');
    res.clearCookie('oasis_refresh_token');
    res.json({ success: true });
  }
}