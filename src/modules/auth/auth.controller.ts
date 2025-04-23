import { 
    Controller, Post, Body, UseGuards, Request 
  } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
  import { AuthService } from './auth.service';
  import { RegisterDto } from './dto/register.dto';
  import { LoginDto } from './dto/login.dto';
  import { LocalAuthGuard } from './guard/local.guard';
  import { JwtAuthGuard } from './guard/jwt.guard';
  
  @ApiTags('Auth')
  @Controller('auth')
  export class AuthController {
    constructor(private readonly auth: AuthService) {}
  
    @Post('register')
    @ApiOperation({ summary: 'Create a new user' })
    async register(@Body() dto: RegisterDto) {
      return this.auth.register(dto);
    }
  
    @UseGuards(LocalAuthGuard)
    @Post('login')
    @ApiOperation({ summary: 'Login and get a JWT' })
    async login(@Request() req, @Body() dto: LoginDto) {
      return this.auth.login(dto);
    }
  
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('me')
    @ApiOperation({ summary: 'Fetch your own profile' })
    getProfile(@Request() req) {
      return req.user;
    }
  }
  