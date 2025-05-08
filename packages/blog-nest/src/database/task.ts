import { Task } from '../modules/admin/task/entities/task.entity';

/**
 * 系统默认定时任务数据
 */
export const tasks: Partial<Task>[] = [
  {
    taskName: '系统数据备份',
    taskGroup: 'SYSTEM',
    invokeTarget: 'taskService.handleDatabaseBackup',
    cronExpression: '0 0 3 * * *',
    misfirePolicy: 3,
    concurrent: 0,
    status: 0,
    remark: '每天凌晨3点执行数据库备份',
  },
  {
    taskName: '访问统计',
    taskGroup: 'SYSTEM',
    invokeTarget: 'taskService.handleHourlyVisitStats',
    cronExpression: '0 0 * * * *',
    misfirePolicy: 3,
    concurrent: 0,
    status: 0,
    remark: '每小时执行一次访问统计',
  },
  {
    taskName: '数据清理',
    taskGroup: 'SYSTEM',
    invokeTarget: 'taskService.handleDataCleanup',
    cronExpression: '0 0 2 * * *',
    misfirePolicy: 3,
    concurrent: 0,
    status: 0,
    remark: '每天凌晨2点执行数据清理',
  },
  {
    taskName: '清理过期会话',
    taskGroup: 'SYSTEM',
    invokeTarget: 'taskService.handleExpiredSessions',
    cronExpression: '0 */5 * * * *',
    misfirePolicy: 1,
    concurrent: 0,
    status: 0,
    remark: '每5分钟清理一次过期的在线用户会话',
  },
  {
    taskName: '清空访客记录',
    taskGroup: 'SYSTEM',
    invokeTarget: 'taskService.clearVisitorRecords',
    cronExpression: '0 0 0 * * *',
    misfirePolicy: 3,
    concurrent: 0,
    status: 0,
    remark: '每天0点清空临时访客记录',
  },
  {
    taskName: '清理旧访问日志',
    taskGroup: 'SYSTEM',
    invokeTarget: 'taskService.clearOldVisitLogs',
    cronExpression: '0 30 1 * * *',
    misfirePolicy: 3,
    concurrent: 0,
    status: 0,
    remark: '每天凌晨1点30分清理一周前的访问日志',
  },
];

/**
 * 插入默认定时任务
 * @param connection 数据库连接
 */
export const insertTasks = async (connection) => {
  const taskRepository = connection.getRepository(Task);

  // 检查是否已存在任务数据
  const count = await taskRepository.count();
  if (count > 0) {
    console.log('已存在定时任务数据，跳过初始化');
    return;
  }

  // 添加创建时间和更新时间
  const now = new Date();
  const tasksWithTimestamp = tasks.map((task) => ({
    ...task,
    createTime: now,
    updateTime: now,
  }));

  // 插入数据
  await taskRepository.insert(tasksWithTimestamp);
  console.log(`成功初始化 ${tasks.length} 个系统默认定时任务`);
};
