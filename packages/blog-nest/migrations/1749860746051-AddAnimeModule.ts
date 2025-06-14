import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAnimeModule1749860746051 implements MigrationInterface {
    name = 'AddAnimeModule1749860746051'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`t_article_tag\` DROP FOREIGN KEY \`FK_3758fd14acf37bf178ee2e5989e\``);
        await queryRunner.query(`ALTER TABLE \`t_article_tag\` DROP FOREIGN KEY \`FK_b6cb605022304a8338b5a11dc8d\``);
        await queryRunner.query(`DROP INDEX \`IDX_3758fd14acf37bf178ee2e5989\` ON \`t_article_tag\``);
        await queryRunner.query(`DROP INDEX \`IDX_b6cb605022304a8338b5a11dc8\` ON \`t_article_tag\``);
        await queryRunner.query(`CREATE TABLE \`t_anime\` (\`id\` int NOT NULL AUTO_INCREMENT COMMENT '番剧ID', \`anime_name\` varchar(100) NOT NULL COMMENT '番剧名称', \`platform\` tinyint(1) NOT NULL COMMENT '番剧平台 (1.bilibili 2.腾讯视频 3.爱奇艺 4.优酷)', \`anime_id\` varchar(50) NOT NULL COMMENT '番剧ID', \`anime_status\` tinyint(1) NOT NULL COMMENT '番剧状态 (1.连载中 2.已完结)', \`watch_status\` tinyint(1) NOT NULL COMMENT '追番状态 (1.想看 2.在看 3.已看)', \`cover\` varchar(255) NULL COMMENT '封面图片', \`rating\` decimal(3,1) NULL COMMENT '评分', \`rating_count\` int NULL COMMENT '评分人数', \`total_episodes\` int NULL COMMENT '总集数', \`current_episodes\` int NULL COMMENT '已更新集数', \`description\` text NULL COMMENT '简介', \`actors\` text NULL COMMENT '配音演员', \`areas\` varchar(100) NULL COMMENT '地区', \`subtitle\` varchar(100) NULL COMMENT '播放量信息', \`uname\` varchar(100) NULL COMMENT '作者', \`publish_time\` varchar(50) NULL COMMENT '发布时间', \`link\` varchar(255) NULL COMMENT '链接', \`styles\` json NULL COMMENT '类型', \`index_show\` varchar(50) NULL COMMENT '当前剧集信息', \`weekday\` tinyint(1) NULL COMMENT '更新星期几 (0-6，对应周日到周六)', \`favorites\` int NULL COMMENT '收藏数', \`views\` int NULL COMMENT '播放量', \`series_follow\` int NULL COMMENT '追番人数', \`details\` json NULL COMMENT '番剧详情JSON数据', \`last_update_time\` datetime NULL COMMENT '最后更新时间', \`create_time\` datetime NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP, \`update_time\` datetime NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`t_operation_log\` DROP COLUMN \`update_time\``);
        await queryRunner.query(`ALTER TABLE \`t_operation_log\` ADD \`update_time\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`t_operation_log\` CHANGE \`create_time\` \`create_time\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`page\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`page\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`ip_address\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`ip_address\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`ip_source\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`ip_source\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`os\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`os\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`browser\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`browser\` varchar(50) NULL`);
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
        await queryRunner.query(`ALTER TABLE \`t_operation_log\` CHANGE \`create_time\` \`create_time\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`page\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`page\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`ip_address\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`ip_address\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`ip_source\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`ip_source\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`os\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`os\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`browser\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`browser\` varchar(50) NULL`);
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
        await queryRunner.query(`CREATE INDEX \`IDX_3758fd14acf37bf178ee2e5989\` ON \`t_article_tag\` (\`article_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_b6cb605022304a8338b5a11dc8\` ON \`t_article_tag\` (\`tag_id\`)`);
        await queryRunner.query(`ALTER TABLE \`t_article_tag\` ADD CONSTRAINT \`FK_3758fd14acf37bf178ee2e5989e\` FOREIGN KEY (\`article_id\`) REFERENCES \`t_article\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`t_article_tag\` ADD CONSTRAINT \`FK_b6cb605022304a8338b5a11dc8d\` FOREIGN KEY (\`tag_id\`) REFERENCES \`t_tag\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`t_article_tag\` DROP FOREIGN KEY \`FK_b6cb605022304a8338b5a11dc8d\``);
        await queryRunner.query(`ALTER TABLE \`t_article_tag\` DROP FOREIGN KEY \`FK_3758fd14acf37bf178ee2e5989e\``);
        await queryRunner.query(`DROP INDEX \`IDX_b6cb605022304a8338b5a11dc8\` ON \`t_article_tag\``);
        await queryRunner.query(`DROP INDEX \`IDX_3758fd14acf37bf178ee2e5989\` ON \`t_article_tag\``);
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
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`browser\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`browser\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`os\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`os\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`ip_source\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`ip_source\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`ip_address\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`ip_address\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`page\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`page\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`t_operation_log\` CHANGE \`create_time\` \`create_time\` datetime NOT NULL`);
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
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`browser\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`browser\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`os\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`os\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`ip_source\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`ip_source\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`ip_address\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`ip_address\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` DROP COLUMN \`page\``);
        await queryRunner.query(`ALTER TABLE \`t_visit_log\` ADD \`page\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`t_operation_log\` CHANGE \`create_time\` \`create_time\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`t_operation_log\` DROP COLUMN \`update_time\``);
        await queryRunner.query(`ALTER TABLE \`t_operation_log\` ADD \`update_time\` datetime NULL`);
        await queryRunner.query(`DROP TABLE \`t_anime\``);
        await queryRunner.query(`CREATE INDEX \`IDX_b6cb605022304a8338b5a11dc8\` ON \`t_article_tag\` (\`tag_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_3758fd14acf37bf178ee2e5989\` ON \`t_article_tag\` (\`article_id\`)`);
        await queryRunner.query(`ALTER TABLE \`t_article_tag\` ADD CONSTRAINT \`FK_b6cb605022304a8338b5a11dc8d\` FOREIGN KEY (\`tag_id\`) REFERENCES \`t_tag\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`t_article_tag\` ADD CONSTRAINT \`FK_3758fd14acf37bf178ee2e5989e\` FOREIGN KEY (\`article_id\`) REFERENCES \`t_article\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
