// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { DBModule } from 'src/database/db.module';    // ← import the DBModule
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [DBModule],        // ← register it here
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}