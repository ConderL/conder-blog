import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1746436781180 implements MigrationInterface {
    name = 'Init1746436781180'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`t_user_role\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`role_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`t_role\` (\`id\` int NOT NULL AUTO_INCREMENT, \`create_time\` datetime NULL, \`update_time\` datetime NULL, \`role_name\` varchar(50) NOT NULL, \`role_desc\` varchar(50) NULL, \`is_disable\` tinyint NOT NULL DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`t_role_menu\` (\`role_id\` int NOT NULL, \`menu_id\` int NOT NULL, PRIMARY KEY (\`role_id\`, \`menu_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`t_menu\` (\`id\` int NOT NULL AUTO_INCREMENT, \`create_time\` datetime NULL, \`update_time\` datetime NULL, \`menu_name\` varchar(50) NOT NULL, \`path\` varchar(255) NULL, \`component\` varchar(50) NULL, \`icon\` varchar(50) NULL, \`parent_id\` int NOT NULL DEFAULT '0', \`order_num\` int NOT NULL DEFAULT '1', \`is_hidden\` tinyint NOT NULL DEFAULT '0', \`menu_type\` char(1) NOT NULL, \`perms\` varchar(100) NULL, \`is_disable\` tinyint NOT NULL DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`t_user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`create_time\` datetime NULL, \`update_time\` datetime NULL, \`nickname\` varchar(50) NOT NULL, \`username\` varchar(50) NOT NULL, \`password\` varchar(255) NOT NULL, \`avatar\` varchar(255) NULL, \`web_site\` varchar(255) NULL, \`intro\` text NULL, \`email\` varchar(100) NULL, \`ip_address\` varchar(255) NULL, \`ip_source\` varchar(255) NULL, \`login_type\` int NOT NULL DEFAULT '1', \`is_disable\` int NOT NULL DEFAULT '0', \`login_time\` timestamp NULL, \`qq_open_id\` varchar(100) NULL, \`gitee_open_id\` varchar(100) NULL, \`github_open_id\` varchar(100) NULL, UNIQUE INDEX \`IDX_cebdcd668896f79744000f50dd\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`t_upload_file\` (\`id\` int NOT NULL AUTO_INCREMENT COMMENT '主键id', \`file_md5\` varchar(32) NOT NULL COMMENT '文件MD5', \`url\` varchar(255) NOT NULL COMMENT '文件访问地址', \`path\` varchar(255) NOT NULL COMMENT '文件存储路径', \`file_size\` int NOT NULL COMMENT '文件大小（字节）' DEFAULT '0', \`create_time\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_d6e207d9693a272481d202e088\` (\`file_md5\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`t_visit_log\` (\`id\` int NOT NULL AUTO_INCREMENT, \`create_time\` datetime NULL, \`update_time\` datetime NULL, \`page\` varchar(50) NULL, \`ip_address\` varchar(50) NULL, \`ip_source\` varchar(50) NULL, \`os\` varchar(50) NULL, \`browser\` varchar(50) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`t_task_log\` (\`id\` int NOT NULL AUTO_INCREMENT COMMENT '日志ID', \`task_name\` varchar(64) NOT NULL COMMENT '任务名称', \`task_group\` varchar(64) NOT NULL COMMENT '任务分组', \`invoke_target\` varchar(255) NOT NULL COMMENT '调用目标', \`task_message\` varchar(255) NULL COMMENT '日志信息' DEFAULT '', \`status\` int NOT NULL COMMENT '执行状态（0失败 1成功）' DEFAULT '1', \`error_info\` longtext NULL COMMENT '错误信息', \`create_time\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`t_operation_log\` (\`id\` int NOT NULL AUTO_INCREMENT, \`create_time\` datetime NULL, \`update_time\` datetime NULL, \`module\` varchar(20) NOT NULL, \`type\` varchar(20) NOT NULL, \`uri\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`params\` longtext NOT NULL, \`method\` varchar(20) NOT NULL, \`data\` longtext NOT NULL, \`user_id\` int NOT NULL, \`nickname\` varchar(50) NOT NULL, \`ip_address\` varchar(50) NOT NULL, \`ip_source\` varchar(50) NOT NULL, \`times\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`login_log\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(50) NOT NULL COMMENT '用户账号', \`ip_address\` varchar(128) NOT NULL COMMENT '登录IP地址', \`login_location\` varchar(255) NULL COMMENT '登录地点', \`browser\` varchar(50) NULL COMMENT '浏览器类型', \`os\` varchar(50) NULL COMMENT '操作系统', \`status\` int NOT NULL COMMENT '登录状态（0成功 1失败）' DEFAULT '0', \`msg\` varchar(255) NULL COMMENT '提示消息', \`login_time\` datetime(6) NOT NULL COMMENT '访问时间' DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`t_exception_log\` (\`id\` int NOT NULL AUTO_INCREMENT, \`create_time\` datetime NULL, \`update_time\` datetime NULL, \`module\` varchar(20) NOT NULL, \`uri\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`error_method\` varchar(255) NOT NULL, \`message\` longtext NOT NULL, \`params\` longtext NOT NULL, \`request_method\` varchar(20) NOT NULL, \`ip_address\` varchar(50) NOT NULL, \`ip_source\` varchar(50) NOT NULL, \`os\` varchar(50) NOT NULL, \`browser\` varchar(50) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`oauth_user_info\` (\`id\` int NOT NULL AUTO_INCREMENT COMMENT '主键ID', \`sourceId\` varchar(50) NOT NULL COMMENT '用户来源标识ID', \`username\` varchar(50) NOT NULL COMMENT '用户名', \`nickname\` varchar(50) NOT NULL COMMENT '用户昵称', \`avatar\` varchar(255) NOT NULL COMMENT '用户头像', \`email\` varchar(100) NULL COMMENT '用户邮箱', \`loginType\` tinyint NOT NULL COMMENT '登录方式 (1邮箱 2QQ 3Gitee 4Github)' DEFAULT '0', \`accessToken\` varchar(255) NOT NULL COMMENT '访问令牌', \`userId\` int NULL COMMENT '关联的系统用户ID', \`createTime\` datetime NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP, \`updateTime\` datetime NULL COMMENT '更新时间', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`t_chat_record\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NULL COMMENT '用户id', \`nickname\` varchar(50) NOT NULL COMMENT '用户昵称', \`avatar\` varchar(255) NOT NULL COMMENT '头像', \`content\` varchar(1000) NOT NULL COMMENT '聊天内容', \`ip_address\` varchar(50) NOT NULL COMMENT 'ip地址', \`ip_source\` varchar(50) NOT NULL COMMENT 'ip来源', \`create_time\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`t_talk\` (\`id\` int NOT NULL AUTO_INCREMENT, \`create_time\` datetime NULL, \`update_time\` datetime NULL, \`user_id\` int NOT NULL, \`talk_content\` varchar(2000) NOT NULL, \`images\` varchar(2500) NULL, \`is_top\` tinyint(1) NOT NULL DEFAULT '0', \`status\` tinyint(1) NOT NULL DEFAULT '1', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`t_tag\` (\`id\` int NOT NULL AUTO_INCREMENT, \`create_time\` datetime NULL, \`update_time\` datetime NULL, \`tag_name\` varchar(20) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`t_site_config\` (\`id\` int NOT NULL AUTO_INCREMENT COMMENT '主键', \`user_avatar\` varchar(255) NOT NULL COMMENT '用户头像', \`tourist_avatar\` varchar(255) NOT NULL COMMENT '游客头像', \`site_name\` varchar(20) NOT NULL COMMENT '网站名称', \`site_address\` varchar(50) NOT NULL COMMENT '网站地址', \`site_intro\` varchar(50) NOT NULL COMMENT '网站简介', \`site_notice\` varchar(200) NOT NULL COMMENT '网站公告', \`create_site_time\` varchar(20) NOT NULL COMMENT '建站日期', \`record_number\` varchar(50) NOT NULL COMMENT '备案号', \`author_avatar\` varchar(255) NOT NULL COMMENT '作者头像', \`site_author\` varchar(50) NOT NULL COMMENT '网站作者', \`article_cover\` varchar(255) NOT NULL COMMENT '文章默认封面', \`about_me\` text NULL COMMENT '关于我', \`github\` varchar(50) NULL COMMENT 'Github' DEFAULT '', \`gitee\` varchar(50) NULL COMMENT 'Gitee' DEFAULT '', \`bilibili\` varchar(50) NULL COMMENT '哔哩哔哩' DEFAULT '', \`qq\` varchar(20) NULL COMMENT 'QQ', \`comment_check\` tinyint NOT NULL COMMENT '是否评论审核 (0否 1是)' DEFAULT '0', \`message_check\` tinyint NOT NULL COMMENT '是否留言审核 (0否 1是)' DEFAULT '0', \`baidu_check\` tinyint NOT NULL COMMENT '是否百度审核 (0否 1是)' DEFAULT '1', \`is_reward\` tinyint NOT NULL COMMENT '是否开启打赏 (0否 1是)' DEFAULT '1', \`wei_xin_code\` varchar(255) NULL COMMENT '微信二维码' DEFAULT '', \`ali_code\` varchar(255) NULL COMMENT '支付宝二维码' DEFAULT '', \`email_notice\` tinyint NOT NULL COMMENT '是否邮箱通知 (0否 1是)' DEFAULT '1', \`social_list\` varchar(50) NOT NULL COMMENT '社交列表', \`login_list\` varchar(50) NOT NULL COMMENT '登录方式', \`is_music\` tinyint NOT NULL COMMENT '是否开启音乐播放器 (0否 1是)' DEFAULT '1', \`music_id\` varchar(20) NULL COMMENT '网易云歌单id' DEFAULT '', \`is_chat\` tinyint NOT NULL COMMENT '是否开启聊天室 (0否 1是)' DEFAULT '1', \`websocket_url\` varchar(50) NULL COMMENT 'websocket链接', \`create_time\` datetime NOT NULL COMMENT '创建时间', \`update_time\` datetime NULL COMMENT '更新时间', \`archive_wallpaper\` varchar(255) NULL COMMENT '归档背景', \`category_wallpaper\` varchar(255) NULL COMMENT '分类背景', \`tag_wallpaper\` varchar(255) NULL COMMENT '标签背景', \`talk_wallpaper\` varchar(255) NULL COMMENT '说说背景', \`album_wallpaper\` varchar(255) NULL COMMENT '相册背景', \`friend_wallpaper\` varchar(255) NULL COMMENT '友链背景', \`message_wallpaper\` varchar(255) NULL COMMENT '留言板背景', \`about_wallpaper\` varchar(255) NULL COMMENT '关于背景', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`t_photo\` (\`id\` int NOT NULL AUTO_INCREMENT, \`album_id\` int NOT NULL COMMENT '所属相册ID', \`photo_url\` text NOT NULL COMMENT '照片URL', \`photo_name\` text NOT NULL COMMENT '照片名称', \`photo_desc\` varchar(50) NULL COMMENT '照片描述', \`create_time\` datetime NOT NULL COMMENT '创建时间', \`update_time\` datetime NULL COMMENT '更新时间', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`t_message\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nickname\` varchar(50) NOT NULL COMMENT '昵称', \`avatar\` varchar(255) NOT NULL COMMENT '头像', \`message_content\` varchar(255) NOT NULL COMMENT '留言内容', \`ip_address\` varchar(50) NOT NULL COMMENT 'IP地址', \`ip_source\` varchar(50) NOT NULL COMMENT 'IP来源', \`is_check\` int NOT NULL COMMENT '是否审核通过（0：未通过，1：通过）' DEFAULT '1', \`create_time\` datetime NOT NULL COMMENT '创建时间', \`update_time\` datetime NULL COMMENT '更新时间', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`t_friend\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(20) NOT NULL, \`color\` varchar(20) NOT NULL, \`avatar\` varchar(255) NOT NULL, \`url\` varchar(50) NOT NULL, \`introduction\` varchar(100) NOT NULL, \`create_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`update_time\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`t_category\` (\`id\` int NOT NULL AUTO_INCREMENT, \`create_time\` datetime NULL, \`update_time\` datetime NULL, \`category_name\` varchar(50) NOT NULL, \`parent_id\` int NOT NULL DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`t_article\` (\`id\` int NOT NULL AUTO_INCREMENT, \`create_time\` datetime NULL, \`update_time\` datetime NULL, \`user_id\` int NOT NULL, \`article_title\` varchar(50) NOT NULL, \`article_content\` longtext NOT NULL, \`article_desc\` varchar(100) NOT NULL, \`article_type\` tinyint(1) NOT NULL DEFAULT '1', \`status\` tinyint(1) NOT NULL DEFAULT '1', \`is_top\` int NOT NULL DEFAULT '0', \`is_delete\` int NOT NULL DEFAULT '0', \`article_cover\` varchar(255) NULL, \`category_id\` int NOT NULL, \`is_recommend\` int NOT NULL DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`t_comment\` (\`id\` int NOT NULL AUTO_INCREMENT, \`create_time\` datetime NULL, \`update_time\` datetime NULL, \`comment_type\` tinyint(1) NOT NULL, \`type_id\` int NULL, \`comment_content\` text NOT NULL, \`from_uid\` int NOT NULL, \`to_uid\` int NULL, \`parent_id\` int NULL, \`reply_id\` int NULL, \`is_check\` tinyint(1) NOT NULL DEFAULT '1', \`like_count\` int NOT NULL DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`t_carousel\` (\`id\` int NOT NULL AUTO_INCREMENT COMMENT '主键', \`img_url\` varchar(255) NOT NULL COMMENT '轮播图地址', \`status\` int NOT NULL COMMENT '是否显示 (0否 1是)' DEFAULT '0', \`remark\` varchar(50) NULL COMMENT '备注' DEFAULT '', \`create_time\` datetime NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP, \`update_time\` datetime(6) NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`t_blog_file\` (\`id\` int NOT NULL AUTO_INCREMENT, \`create_time\` datetime NULL, \`update_time\` datetime NULL, \`file_name\` varchar(255) NOT NULL, \`file_url\` varchar(255) NOT NULL, \`file_size\` int NOT NULL, \`file_type\` varchar(255) NOT NULL, \`file_md5\` varchar(255) NULL, \`user_id\` int NOT NULL, \`is_delete\` int NOT NULL DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`t_article_tag\` (\`article_id\` int NOT NULL, \`tag_id\` int NOT NULL, PRIMARY KEY (\`article_id\`, \`tag_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`t_album\` (\`id\` int NOT NULL AUTO_INCREMENT, \`create_time\` datetime NULL, \`update_time\` datetime NULL, \`album_name\` varchar(20) NOT NULL, \`album_cover\` varchar(255) NOT NULL, \`album_desc\` varchar(50) NOT NULL, \`status\` tinyint(1) NOT NULL DEFAULT '1', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`t_task\` (\`id\` int NOT NULL AUTO_INCREMENT COMMENT '任务ID', \`task_name\` varchar(64) NOT NULL COMMENT '任务名称', \`task_group\` varchar(64) NOT NULL COMMENT '任务组名' DEFAULT 'DEFAULT', \`invoke_target\` varchar(500) NOT NULL COMMENT '调用目标', \`cron_expression\` varchar(255) NULL COMMENT 'cron执行表达式', \`misfire_policy\` tinyint(1) NOT NULL COMMENT '计划执行错误策略 (1立即执行 2执行一次 3放弃执行)' DEFAULT '3', \`concurrent\` tinyint(1) NOT NULL COMMENT '是否并发执行 (0否 1是)' DEFAULT '0', \`status\` tinyint(1) NOT NULL COMMENT '任务状态 (0运行 1暂停)' DEFAULT '0', \`remark\` varchar(500) NULL COMMENT '任务备注信息', \`create_time\` datetime NULL COMMENT '创建时间', \`update_time\` datetime NULL COMMENT '更新时间', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`t_operation_log\` DROP COLUMN \`update_time\``);
        await queryRunner.query(`ALTER TABLE \`t_operation_log\` ADD \`update_time\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`page\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`page\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`ip_address\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`ip_address\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`ip_source\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`ip_source\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`os\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`os\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`browser\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`browser\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`t_operation_log\` CHANGE \`create_time\` \`create_time\` datetime NOT NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_3758fd14acf37bf178ee2e5989\` ON \`t_article_tag\` (\`article_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_b6cb605022304a8338b5a11dc8\` ON \`t_article_tag\` (\`tag_id\`)`);
        await queryRunner.query(`ALTER TABLE \`t_talk\` ADD CONSTRAINT \`FK_b8d8ba27beff753dda33bc0f5df\` FOREIGN KEY (\`user_id\`) REFERENCES \`t_user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`t_article\` ADD CONSTRAINT \`FK_96bda4ac9b3040cec82f40bbb41\` FOREIGN KEY (\`category_id\`) REFERENCES \`t_category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`t_comment\` ADD CONSTRAINT \`FK_29b51b5cb8ffb020a78c1a75704\` FOREIGN KEY (\`type_id\`) REFERENCES \`t_article\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`t_comment\` ADD CONSTRAINT \`FK_eb9382e4a3659bae4595e039ad6\` FOREIGN KEY (\`from_uid\`) REFERENCES \`t_user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`t_blog_file\` ADD CONSTRAINT \`FK_13b96e20dc93843d6f95879a1c6\` FOREIGN KEY (\`user_id\`) REFERENCES \`t_user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`t_article_tag\` ADD CONSTRAINT \`FK_3758fd14acf37bf178ee2e5989e\` FOREIGN KEY (\`article_id\`) REFERENCES \`t_article\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`t_article_tag\` ADD CONSTRAINT \`FK_b6cb605022304a8338b5a11dc8d\` FOREIGN KEY (\`tag_id\`) REFERENCES \`t_tag\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`t_article_tag\` DROP FOREIGN KEY \`FK_b6cb605022304a8338b5a11dc8d\``);
        await queryRunner.query(`ALTER TABLE \`t_article_tag\` DROP FOREIGN KEY \`FK_3758fd14acf37bf178ee2e5989e\``);
        await queryRunner.query(`ALTER TABLE \`t_blog_file\` DROP FOREIGN KEY \`FK_13b96e20dc93843d6f95879a1c6\``);
        await queryRunner.query(`ALTER TABLE \`t_comment\` DROP FOREIGN KEY \`FK_eb9382e4a3659bae4595e039ad6\``);
        await queryRunner.query(`ALTER TABLE \`t_comment\` DROP FOREIGN KEY \`FK_29b51b5cb8ffb020a78c1a75704\``);
        await queryRunner.query(`ALTER TABLE \`t_article\` DROP FOREIGN KEY \`FK_96bda4ac9b3040cec82f40bbb41\``);
        await queryRunner.query(`ALTER TABLE \`t_talk\` DROP FOREIGN KEY \`FK_b8d8ba27beff753dda33bc0f5df\``);
        await queryRunner.query(`DROP INDEX \`IDX_b6cb605022304a8338b5a11dc8\` ON \`t_article_tag\``);
        await queryRunner.query(`DROP INDEX \`IDX_3758fd14acf37bf178ee2e5989\` ON \`t_article_tag\``);
        await queryRunner.query(`ALTER TABLE \`t_operation_log\` CHANGE \`create_time\` \`create_time\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`browser\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`browser\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`os\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`os\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`ip_source\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`ip_source\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`ip_address\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`ip_address\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`page\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`page\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`t_operation_log\` DROP COLUMN \`update_time\``);
        await queryRunner.query(`ALTER TABLE \`t_operation_log\` ADD \`update_time\` datetime NULL`);
        await queryRunner.query(`DROP TABLE \`t_task\``);
        await queryRunner.query(`DROP TABLE \`t_album\``);
        await queryRunner.query(`DROP TABLE \`t_article_tag\``);
        await queryRunner.query(`DROP TABLE \`t_blog_file\``);
        await queryRunner.query(`DROP TABLE \`t_carousel\``);
        await queryRunner.query(`DROP TABLE \`t_comment\``);
        await queryRunner.query(`DROP TABLE \`t_article\``);
        await queryRunner.query(`DROP TABLE \`t_category\``);
        await queryRunner.query(`DROP TABLE \`t_friend\``);
        await queryRunner.query(`DROP TABLE \`t_message\``);
        await queryRunner.query(`DROP TABLE \`t_photo\``);
        await queryRunner.query(`DROP TABLE \`t_site_config\``);
        await queryRunner.query(`DROP TABLE \`t_tag\``);
        await queryRunner.query(`DROP TABLE \`t_talk\``);
        await queryRunner.query(`DROP TABLE \`t_chat_record\``);
        await queryRunner.query(`DROP TABLE \`oauth_user_info\``);
        await queryRunner.query(`DROP TABLE \`t_exception_log\``);
        await queryRunner.query(`DROP TABLE \`login_log\``);
        await queryRunner.query(`DROP TABLE \`t_operation_log\``);
        await queryRunner.query(`DROP TABLE \`t_task_log\``);
        await queryRunner.query(`DROP TABLE \`t_visit_log\``);
        await queryRunner.query(`DROP INDEX \`IDX_d6e207d9693a272481d202e088\` ON \`t_upload_file\``);
        await queryRunner.query(`DROP TABLE \`t_upload_file\``);
        await queryRunner.query(`DROP INDEX \`IDX_cebdcd668896f79744000f50dd\` ON \`t_user\``);
        await queryRunner.query(`DROP TABLE \`t_user\``);
        await queryRunner.query(`DROP TABLE \`t_menu\``);
        await queryRunner.query(`DROP TABLE \`t_role_menu\``);
        await queryRunner.query(`DROP TABLE \`t_role\``);
        await queryRunner.query(`DROP TABLE \`t_user_role\``);
    }

}
