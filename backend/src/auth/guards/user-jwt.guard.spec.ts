import { UserJwtGuard } from './user-jwt.guard';

describe('UserJwtGuard', () => {
  it('should be defined', () => {
    expect(new UserJwtGuard()).toBeDefined();
  });
});
