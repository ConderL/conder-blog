import request from '@/utils/request'

/**
 * 获取番剧列表
 * @param params 查询参数
 * @returns 番剧列表
 */
export function getAnimeList(params?: any) {
  return request({
    url: '/anime/list',
    method: 'get',
    params
  })
}

/**
 * 获取番剧详情
 * @param id 番剧ID
 * @returns 番剧详情
 */
export function getAnimeDetail(id: number) {
  return request({
    url: `/anime/${id}`,
    method: 'get'
  })
}

/**
 * 添加番剧
 * @param data 番剧数据
 * @returns 添加结果
 */
export function addAnime(data: any) {
  return request({
    url: '/anime',
    method: 'post',
    data
  })
}

/**
 * 更新番剧
 * @param id 番剧ID
 * @param data 番剧数据
 * @returns 更新结果
 */
export function updateAnime(id: number, data: any) {
  return request({
    url: `/anime/${id}`,
    method: 'patch',
    data
  })
}

/**
 * 删除番剧
 * @param id 番剧ID
 * @returns 删除结果
 */
export function deleteAnime(id: number) {
  return request({
    url: `/anime/${id}`,
    method: 'delete'
  })
}

/**
 * 手动更新番剧信息
 * @param id 番剧ID
 * @returns 更新结果
 */
export function updateAnimeInfo(id: number) {
  return request({
    url: '/anime/update-info',
    method: 'post',
    data: { id }
  })
}

/**
 * 手动执行番剧信息更新任务
 * @returns 执行结果
 */
export function runUpdateTask() {
  return request({
    url: '/anime/run-update-task',
    method: 'post'
  })
} 