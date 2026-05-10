import { Controller, Get, Post, Query, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService, OasisUser } from './auth.service';

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
      res.cookie('oasis_access_token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000,
      });
      res.cookie('oasis_refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 3600000,
      });
      res.redirect('http://localhost:3000');
    } catch (err) {
      res.redirect(`http://localhost:3000?error=${err.message}`);
    }
  }

  @Post('oasis/callback')
  async handleOasisCallbackPost(
    @Req() req: Request,
    @Res() res: Response
  ) {
    const code = req.body.code;
    const codeVerifier = req.body.code_verifier;

    if (!code || !codeVerifier) {
      return res.status(400).json({ error: 'Missing code or code_verifier' });
    }

    try {
      const tokens = await this.authService.exchangeCodeWithPKCE(code, codeVerifier);
      res.cookie('oasis_access_token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000,
      });
      res.cookie('oasis_refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 3600000,
      });
      res.json(tokens);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  @Post('oasis/refresh')
  async refreshOasisTokens(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies.oasis_refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token not found' });
    }

    try {
      const tokens = await this.authService.refreshTokens(refreshToken);
      res.cookie('oasis_access_token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000,
      });
      res.json(tokens);
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  }

  @Get('oasis/userinfo')
  async getOasisUserInfo(@Req() req: Request): Promise<OasisUser | { error: string }> {
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

  @Get('oasis/token')
  async getOasisToken(@Req() req: Request): Promise<{ access_token?: string; error?: string }> {
    const accessToken = req.cookies.oasis_access_token;
    if (!accessToken) {
      return { error: 'Access token not found' };
    }

    try {
      const isValid = await this.authService.validateToken(accessToken);
      if (!isValid) {
        return { error: 'Token expired' };
      }
      return { access_token: accessToken };
    } catch (err) {
      return { error: err.message };
    }
  }

  @Post('oasis/logout')
  async logoutOasis(@Res() res: Response) {
    res.clearCookie('oasis_access_token');
    res.clearCookie('oasis_refresh_token');
    res.json({ success: true });
  }

  @Post('refresh')
  async refreshTokens(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies.oasis_refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token not found' });
    }

    try {
      const tokens = await this.authService.refreshTokens(refreshToken);
      res.cookie('oasis_access_token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000,
      });
      res.json({ success: true });
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  }

  @Get('userinfo')
  async getUserInfo(@Req() req: Request): Promise<OasisUser | { error: string }> {
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