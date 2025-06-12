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

/**
 * 上传番剧封面
 * @param file 封面图片文件
 * @returns 上传结果，包含图片URL
 */
export function uploadAnimeCover(file: FormData) {
  return request({
    url: '/anime/upload-cover',
    method: 'post',
    data: file,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 从B站导入番剧
 * @param data 导入参数，包含B站番剧ID、追番状态和自定义封面信息
 * @returns 导入结果
 */
export function importFromBilibili(data: any) {
  return request({
    url: '/anime/import-from-bilibili',
    method: 'post',
    data
  })
} 