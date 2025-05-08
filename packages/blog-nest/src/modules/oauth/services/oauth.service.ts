import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import * as qs from 'qs';
import { OauthUserDto, OauthResultDto } from '../dto/oauth-user.dto';
import { OauthUserEntity } from '../entities/oauth-user.entity';
import { UserService } from '../../user/user.service';
import { JwtService } from '@nestjs/jwt';

/**
 * 第三方登录服务
 */
@Injectable()
export class OauthService {
  private readonly logger = new Logger(OauthService.name);

  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(OauthUserEntity)
    private oauthUserRepository: Repository<OauthUserEntity>,
  ) {}

  /**
   * 获取GitHub登录地址
   */
  getGithubAuthUrl(): string {
    const clientId = this.configService.get('oauth.github.clientId');
    const redirectUrl = this.configService.get('oauth.github.redirectUrl');
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=user`;
  }

  /**
   * 处理GitHub回调
   * @param code 授权码
   * @returns 用户信息
   */
  async handleGithubCallback(code: string): Promise<OauthResultDto> {
    try {
      // 1. 获取 access_token
      const tokenResponse = await axios.post(
        this.configService.get('oauth.github.accessTokenUrl'),
        {
          client_id: this.configService.get('oauth.github.clientId'),
          client_secret: this.configService.get('oauth.github.clientSecret'),
          code,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );

      const { access_token } = tokenResponse.data;

      if (!access_token) {
        throw new Error('GitHub授权失败，无法获取访问令牌');
      }

      // 2. 获取用户信息
      const userResponse = await axios.get(this.configService.get('oauth.github.userInfoUrl'), {
        headers: {
          Authorization: `token ${access_token}`,
        },
      });

      const githubUser = {
        sourceId: String(userResponse.data.id),
        username: userResponse.data.login,
        nickname: userResponse.data.name || userResponse.data.login,
        avatar: userResponse.data.avatar_url,
        email: userResponse.data.email || '',
        loginType: 4, // Github
        accessToken: access_token,
      };

      // 3. 登录或注册
      return await this.loginOrRegister(githubUser);
    } catch (error) {
      this.logger.error('GitHub授权失败', error);
      return {
        success: false,
        message: 'GitHub授权失败: ' + error.message,
      };
    }
  }

  /**
   * 获取Gitee登录地址
   */
  getGiteeAuthUrl(): string {
    const clientId = this.configService.get('oauth.gitee.clientId');
    const redirectUrl = this.configService.get('oauth.gitee.redirectUrl');
    return `https://gitee.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code`;
  }

  /**
   * 处理Gitee回调
   * @param code 授权码
   * @returns 用户信息
   */
  async handleGiteeCallback(code: string): Promise<OauthResultDto> {
    try {
      // 1. 获取 access_token
      const tokenResponse = await axios.post(
        this.configService.get('oauth.gitee.accessTokenUrl'),
        qs.stringify({
          client_id: this.configService.get('oauth.gitee.clientId'),
          client_secret: this.configService.get('oauth.gitee.clientSecret'),
          code,
          redirect_uri: this.configService.get('oauth.gitee.redirectUrl'),
          grant_type: this.configService.get('oauth.gitee.grantType'),
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const { access_token } = tokenResponse.data;

      if (!access_token) {
        throw new Error('Gitee授权失败，无法获取访问令牌');
      }

      // 2. 获取用户信息
      const userInfoUrl = this.configService
        .get('oauth.gitee.userInfoUrl')
        .replace('{access_token}', access_token);
      const userResponse = await axios.get(userInfoUrl);

      const giteeUser = {
        sourceId: String(userResponse.data.id),
        username: userResponse.data.login,
        nickname: userResponse.data.name || userResponse.data.login,
        avatar: userResponse.data.avatar_url,
        email: userResponse.data.email || '',
        loginType: 3, // Gitee
        accessToken: access_token,
      };

      // 3. 登录或注册
      return await this.loginOrRegister(giteeUser);
    } catch (error) {
      this.logger.error('Gitee授权失败', error);
      return {
        success: false,
        message: 'Gitee授权失败: ' + error.message,
      };
    }
  }

  /**
   * 获取QQ登录地址
   */
  getQQAuthUrl(): string {
    const appId = this.configService.get('oauth.qq.appId');
    const redirectUrl = this.configService.get('oauth.qq.redirectUrl');
    return `https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUrl)}&state=qq`;
  }

  /**
   * 处理QQ回调
   * @param code 授权码
   * @returns 用户信息
   */
  async handleQQCallback(code: string): Promise<OauthResultDto> {
    try {
      // 1. 获取 access_token
      const tokenUrl = `${this.configService.get('oauth.qq.accessTokenUrl')}?grant_type=authorization_code&client_id=${this.configService.get('oauth.qq.appId')}&client_secret=${this.configService.get('oauth.qq.appKey')}&code=${code}&redirect_uri=${encodeURIComponent(this.configService.get('oauth.qq.redirectUrl'))}`;

      const tokenResponse = await axios.get(tokenUrl);
      const tokenParams = qs.parse(tokenResponse.data);
      const accessToken = tokenParams.access_token as string;

      if (!accessToken) {
        throw new Error('QQ授权失败，无法获取访问令牌');
      }

      // 2. 获取OpenID
      const openIdUrl = `${this.configService.get('oauth.qq.userOpenidUrl')}?access_token=${accessToken}`;
      const openIdResponse = await axios.get(openIdUrl);

      // 从callback({"client_id":"YOUR_APPID","openid":"YOUR_OPENID"})中提取openid
      const openIdMatch = openIdResponse.data.match(/"openid":"([^"]+)"/);
      const openId = openIdMatch ? openIdMatch[1] : null;

      if (!openId) {
        throw new Error('QQ授权失败，无法获取OpenID');
      }

      // 3. 获取用户信息
      const userInfoUrl = `${this.configService.get('oauth.qq.userInfoUrl')}?access_token=${accessToken}&oauth_consumer_key=${this.configService.get('oauth.qq.appId')}&openid=${openId}`;
      const userResponse = await axios.get(userInfoUrl);

      const qqUser = {
        sourceId: openId,
        username: `qq_${openId.substring(0, 8)}`,
        nickname: userResponse.data.nickname,
        avatar: userResponse.data.figureurl_qq_2 || userResponse.data.figureurl_qq_1,
        email: '',
        loginType: 2, // QQ
        accessToken,
      };

      // 4. 登录或注册
      return await this.loginOrRegister(qqUser);
    } catch (error) {
      this.logger.error('QQ授权失败', error);
      return {
        success: false,
        message: 'QQ授权失败: ' + error.message,
      };
    }
  }

  /**
   * 处理第三方登录或注册
   * @param oauthUser 第三方用户信息
   * @returns 登录结果
   */
  async loginOrRegister(oauthUser: OauthUserDto): Promise<OauthResultDto> {
    try {
      // 1. 查询是否存在对应的第三方用户记录
      let oauthUserEntity = await this.oauthUserRepository.findOne({
        where: {
          sourceId: oauthUser.sourceId,
          loginType: oauthUser.loginType,
        },
      });

      // 2. 查找本地用户
      let localUser;
      let userId;

      // 如果存在第三方用户记录且有关联的本地用户ID
      if (oauthUserEntity && oauthUserEntity.userId) {
        try {
          localUser = await this.userService.findById(oauthUserEntity.userId);
          if (localUser) {
            userId = localUser.id;
            this.logger.log(`找到关联的本地用户: ${localUser.username}`);
          } else {
            this.logger.warn(`关联的本地用户不存在, ID: ${oauthUserEntity.userId}`);
            // 清除无效关联
            oauthUserEntity.userId = null;
          }
        } catch (error) {
          this.logger.error(`查询本地用户出错: ${error.message}`);
        }
      }

      // 3. 如果未找到本地用户，尝试通过邮箱查找
      if (!localUser && oauthUser.email) {
        try {
          localUser = await this.userService.findByEmail(oauthUser.email);
          if (localUser) {
            userId = localUser.id;
            this.logger.log(`通过邮箱找到本地用户: ${localUser.username}`);
          }
        } catch (error) {
          this.logger.error(`通过邮箱查询本地用户出错: ${error.message}`);
        }
      }

      // 4. 如果不存在第三方用户记录，创建新记录
      if (!oauthUserEntity) {
        oauthUserEntity = this.oauthUserRepository.create({
          sourceId: oauthUser.sourceId,
          username: oauthUser.username,
          nickname: oauthUser.nickname,
          avatar: oauthUser.avatar,
          email: oauthUser.email,
          loginType: oauthUser.loginType,
          accessToken: oauthUser.accessToken,
          userId: userId, // 如果已找到本地用户，设置关联
        });
        await this.oauthUserRepository.save(oauthUserEntity);
        this.logger.log(`创建新的第三方用户记录: ${oauthUser.username}`);
      } else {
        // 5. 如果存在，更新记录
        oauthUserEntity.username = oauthUser.username;
        oauthUserEntity.nickname = oauthUser.nickname;
        oauthUserEntity.avatar = oauthUser.avatar;
        oauthUserEntity.email = oauthUser.email;
        oauthUserEntity.accessToken = oauthUser.accessToken;

        // 如果找到了本地用户，但记录中没有关联，则更新关联
        if (userId && !oauthUserEntity.userId) {
          oauthUserEntity.userId = userId;
        }

        oauthUserEntity.updateTime = new Date();
        await this.oauthUserRepository.save(oauthUserEntity);
        this.logger.log(`更新第三方用户记录: ${oauthUser.username}`);
      }

      // 6. 如果本地用户不存在，创建新用户
      if (!localUser) {
        try {
          localUser = await this.userService.createUserFromOauth({
            username: oauthUser.username,
            nickname: oauthUser.nickname,
            avatar: oauthUser.avatar,
            email: oauthUser.email || '',
            loginType: oauthUser.loginType,
            sourceId: oauthUser.sourceId,
          });

          userId = localUser.id;
          this.logger.log(`创建新的本地用户: ${localUser.username}, ID: ${userId}`);

          // 更新第三方用户记录，关联本地用户ID
          if (!oauthUserEntity.userId) {
            oauthUserEntity.userId = userId;
            await this.oauthUserRepository.save(oauthUserEntity);
            this.logger.log(`更新第三方用户记录，关联本地用户ID: ${userId}`);
          }
        } catch (error) {
          this.logger.error(`创建本地用户失败: ${error.message}`);
          throw new Error(`创建用户失败: ${error.message}`);
        }
      }

      // 7. 生成JWT令牌
      const token = await this.userService.generateToken(localUser);

      // 8. 返回登录结果
      return {
        success: true,
        userId: localUser.id,
        username: localUser.username,
        nickname: localUser.nickname,
        avatar: localUser.avatar,
        token,
      };
    } catch (error) {
      this.logger.error('第三方登录或注册失败', error);
      return {
        success: false,
        message: '登录失败: ' + error.message,
      };
    }
  }

  /**
   * 验证OAuth令牌
   * @param token JWT令牌
   * @param loginType 登录类型 (1邮箱 2QQ 3Gitee 4Github)
   * @returns 用户令牌和基本信息
   */
  async verifyOauthToken(token: string, loginType: number): Promise<any> {
    this.logger.log(`验证OAuth令牌: loginType=${loginType}, token=${token.substring(0, 20)}...`);

    if (!token) {
      this.logger.error('令牌为空');
      throw new Error('令牌不能为空');
    }

    try {
      // 验证JWT令牌
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get('jwt.secret'),
      });

      this.logger.log(`令牌解析成功: ${JSON.stringify(decoded)}`);

      // 获取用户ID，兼容不同格式的JWT
      const userId = decoded.sub || decoded.id;

      if (!userId) {
        this.logger.warn('令牌中缺少用户ID');
        throw new Error('无效的令牌格式');
      }

      // 验证用户存在且状态正常
      const user = await this.userService.findById(userId);

      if (!user) {
        this.logger.warn(`用户不存在: id=${userId}`);
        throw new Error('用户不存在');
      }

      if (user.isDisable === 1) {
        this.logger.warn(`用户已被禁用: id=${user.id}`);
        throw new Error('用户已被禁用');
      }

      // 检查用户是否有有效的OAuth记录
      let oauthUser = null;
      if (loginType !== 1) {
        // 如果不是邮箱登录，尝试查找OAuth记录
        oauthUser = await this.oauthUserRepository.findOne({
          where: {
            userId: user.id,
            loginType: loginType,
          },
        });

        if (!oauthUser) {
          // 尝试查询是否有未关联的OAuth记录
          const oauthUsers = await this.oauthUserRepository.find({
            where: {
              loginType: loginType,
            },
          });

          this.logger.log(`找到${oauthUsers.length}条未关联的OAuth记录`);

          // 如果有未关联的记录，关联到当前用户
          if (oauthUsers.length > 0) {
            oauthUser = oauthUsers[0];
            oauthUser.userId = user.id;
            await this.oauthUserRepository.save(oauthUser);
            this.logger.log(`已关联OAuth记录到用户: userId=${user.id}, oauthId=${oauthUser.id}`);
          } else {
            this.logger.warn(`用户没有对应的第三方登录记录: id=${user.id}, loginType=${loginType}`);
          }
        }
      }

      // 重新生成一个新鲜的令牌
      const payload = {
        username: user.username,
        sub: user.id,
        nickname: user.nickname || user.username,
      };
      const newToken = this.jwtService.sign(payload, {
        secret: this.configService.get('jwt.secret'),
        expiresIn: this.configService.get('jwt.expiresIn') || '24h',
      });

      // 返回完整的用户信息和令牌
      return {
        token: newToken,
        id: user.id,
        username: user.username,
        nickname: user.nickname || user.username,
        avatar: user.avatar || '',
        email: user.email || '',
      };
    } catch (error) {
      this.logger.error(`验证OAuth令牌失败: ${error.message}`);
      throw new Error(`验证失败: ${error.message}`);
    }
  }
}
