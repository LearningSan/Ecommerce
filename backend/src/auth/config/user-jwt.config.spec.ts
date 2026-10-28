import { Test, TestingModule } from '@nestjs/testing';
import { UserJwtConfig } from './user-jwt.config';

describe('UserJwtConfig', () => {
  let provider: UserJwtConfig;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserJwtConfig],
    }).compile();

    provider = module.get<UserJwtConfig>(UserJwtConfig);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
