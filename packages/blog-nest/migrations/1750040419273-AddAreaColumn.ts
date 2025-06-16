import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAreaColumn1750040419273 implements MigrationInterface {
    name = 'AddAreaColumn1750040419273'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`t_anime\` ADD \`area\` json NULL COMMENT '地区类型'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`t_anime\` DROP COLUMN \`area\``);
    }
}
