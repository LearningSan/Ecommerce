import { Test, TestingModule } from '@nestjs/testing';
import { UserJwtStrategy } from './user-jwt.strategy';

describe('UserJwtStrategy', () => {
  let provider: UserJwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserJwtStrategy],
    }).compile();

    provider = module.get<UserJwtStrategy>(UserJwtStrategy);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
