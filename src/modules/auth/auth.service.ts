import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DBService } from 'src/database/db.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DBService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    const [user] = await this.db.query(
      `INSERT INTO users (email, password, username)
       VALUES ($1, $2, $3)
       RETURNING id, email, username, is_active, created_at, updated_at`,
      [dto.email, hash, dto.username],
    );
    return user;
  }

  async validateUser(email: string, pass: string) {
    const [user] = await this.db.query<any>(
      `SELECT * FROM users WHERE email = $1`,
      [email],
    );
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...rest } = user;
      return rest;
    }
    return null;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email };
    return { access_token: this.jwt.sign(payload) };
  }

  async getUserById(id: number) {
    const [user] = await this.db.query<any>(
      `SELECT id, email, username, is_active, created_at, updated_at
         FROM users WHERE id = $1`,
      [id],
    );
    return user;
  }
}
