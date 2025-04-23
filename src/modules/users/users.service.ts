// src/modules/users/users.service.ts
import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { DBService } from 'src/database/db.service';
  import { CreateUserDto } from './dto/create-user.dto';
  import { UpdateUserDto } from './dto/update-user.dto';
  import { UserEntity } from './entities/user.entity';
  
  @Injectable()
  export class UsersService {
    constructor(private readonly db: DBService) {}
  
    /**
     * Create a new user.
     * If you ever hit a PK/email collision, bump your sequence with:
     *   SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id),0) FROM users) + 1);
     */
    async createUser(dto: CreateUserDto): Promise<UserEntity> {
      try {
        const [user] = await this.db.query<UserEntity>(
          `INSERT INTO users (email, password, username)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [dto.email, dto.password, dto.username],
        );
        return user;
      } catch (err: any) {
        // If you ever rework DBService to surface PG error codes,
        // you could catch 23505 here and throw ConflictException(...)
        throw new InternalServerErrorException('Could not create user');
      }
    }
  
    /** List every user */
    async getAllUsers(): Promise<UserEntity[]> {
      return this.db.query<UserEntity>(`SELECT * FROM users`);
    }
  
    /** Fetch one by PK */
    async getUserById(id: number): Promise<UserEntity> {
      const rows = await this.db.query<UserEntity>(
        `SELECT * FROM users WHERE id = $1`,
        [id],
      );
      const user = rows[0];
      if (!user) {
        throw new NotFoundException(`User #${id} not found`);
      }
      return user;
    }
  
    /**
     * Patch any subset of updatable fields.
     * Throws if you pass no fields at all.
     */
    async updateUser(
      id: number,
      dto: UpdateUserDto,
    ): Promise<UserEntity> {
      const sets: string[] = [];
      const vals: any[] = [];
      let idx = 1;
  
      for (const [key, value] of Object.entries(dto) as [
        keyof UpdateUserDto,
        any,
      ][]) {
        if (value !== undefined && value !== null) {
          sets.push(`${key} = $${idx}`);
          vals.push(value);
          idx++;
        }
      }
  
      if (sets.length === 0) {
        throw new BadRequestException('No fields provided for update');
      }
  
      // push the `id` for the WHERE clause
      vals.push(id);
  
      const rows = await this.db.query<UserEntity>(
        `UPDATE users
            SET ${sets.join(', ')}, updated_at = now()
          WHERE id = $${idx}
          RETURNING *`,
        vals,
      );
  
      const user = rows[0];
      if (!user) {
        throw new NotFoundException(`User #${id} not found for update`);
      }
      return user;
    }
  
    /** Delete one by PK */
    async deleteUser(id: number): Promise<UserEntity> {
      const rows = await this.db.query<UserEntity>(
        `DELETE FROM users
          WHERE id = $1
         RETURNING *`,
        [id],
      );
      const user = rows[0];
      if (!user) {
        throw new NotFoundException(`User #${id} not found for delete`);
      }
      return user;
    }
  }
  