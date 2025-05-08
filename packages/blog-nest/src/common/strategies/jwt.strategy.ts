import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../modules/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret', 'your-secret-key'),
    });
    this.logger.log(
      `JWT Strategy initialized with secret: ${configService.get('jwt.secret', 'your-secret-key')}`,
    );
  }

  async validate(payload: any) {
    this.logger.log(`Validating JWT payload: ${JSON.stringify(payload)}`);
    try {
      // 从payload中获取用户ID，优先使用id，如果没有则使用sub
      const userId = payload.id || payload.sub;

      if (!userId) {
        this.logger.error('无效的JWT载荷: 缺少用户ID');
        throw new UnauthorizedException('无效的认证令牌');
      }

      // 通过ID查找用户
      const user = await this.userService.findById(userId);

      // 如果找不到用户，抛出异常而不是返回默认对象
      if (!user) {
        this.logger.error(`用户不存在，ID: ${userId}`);
        throw new UnauthorizedException('用户不存在或已被删除');
      }

      this.logger.log(`用户验证成功: ${user.username} (ID: ${user.id})`);

      // 确保返回的用户对象包含正确的ID
      return {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
      };
    } catch (error) {
      this.logger.error(`JWT验证出错: ${error.message}`);
      throw new UnauthorizedException('认证失败: ' + error.message);
    }
  }
}
