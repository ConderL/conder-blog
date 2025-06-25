import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTasks1750045000000 implements MigrationInterface {
  name = 'AddTasks1750045000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 检查任务是否已存在
    const clearChatTask = await queryRunner.query(
      `SELECT * FROM t_task WHERE task_name = '清理聊天记录'`
    );

    const updateAnimeTask = await queryRunner.query(
      `SELECT * FROM t_task WHERE task_name = '更新番剧信息'`
    );

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // 如果清理聊天记录任务不存在，则添加
    if (!clearChatTask || clearChatTask.length === 0) {
      await queryRunner.query(`
                INSERT INTO t_task 
                (task_name, task_group, invoke_target, cron_expression, misfire_policy, concurrent, status, remark, create_time, update_time)
                VALUES
                ('清理聊天记录', 'SYSTEM', 'taskService.clearChatHistory', '0 0 1 * * 0', 3, 0, 0, '每周日凌晨1点清理聊天记录', '${now}', '${now}')
            `);
      console.log('成功添加清理聊天记录任务');
    } else {
      console.log('清理聊天记录任务已存在，跳过添加');
    }

    // 如果更新番剧信息任务不存在，则添加
    if (!updateAnimeTask || updateAnimeTask.length === 0) {
      await queryRunner.query(`
                INSERT INTO t_task 
                (task_name, task_group, invoke_target, cron_expression, misfire_policy, concurrent, status, remark, create_time, update_time)
                VALUES
                ('更新番剧信息', 'SYSTEM', 'taskService.handleAnimeUpdate', '0 0 2 * * *', 3, 0, 0, '每天凌晨2点更新番剧信息', '${now}', '${now}')
            `);
      console.log('成功添加更新番剧信息任务');
    } else {
      console.log('更新番剧信息任务已存在，跳过添加');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM t_task WHERE task_name = '清理聊天记录'`);
    await queryRunner.query(`DELETE FROM t_task WHERE task_name = '更新番剧信息'`);
  }
} 