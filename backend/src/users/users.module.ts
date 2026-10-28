import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UserRepository } from './repositories/user.repository';
import { UserCredentialEntity } from './entities/user-credential.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';

@Module({
  imports:[TypeOrmModule.forFeature([UserEntity ,UserCredentialEntity])],
  controllers: [UsersController],
  providers: [UsersService,UserRepository],
  exports:[UserRepository]
})
export class UsersModule {}
