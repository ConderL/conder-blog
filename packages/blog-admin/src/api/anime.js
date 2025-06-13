import request from '@/utils/request'

// 获取番剧列表
export function getAnimeList(query) {
  return request({
    url: '/anime/list',
    method: 'get',
    params: query
  })
}

// 获取番剧详情
export function getAnimeDetail(id) {
  return request({
    url: `/anime/${id}`,
    method: 'get'
  })
}

// 添加番剧
export function addAnime(data) {
  return request({
    url: '/anime',
    method: 'post',
    data: data
  })
}

// 更新番剧
export function updateAnime(id, data) {
  return request({
    url: `/anime/${id}`,
    method: 'patch',
    data: data
  })
}

// 删除番剧
export function deleteAnime(id) {
  return request({
    url: `/anime/${id}`,
    method: 'delete'
  })
}

// 手动更新番剧信息
export function updateAnimeInfo(id) {
  return request({
    url: '/anime/update-info',
    method: 'post',
    data: { id }
  })
}

// 运行更新任务
export function runUpdateTask() {
  return request({
    url: '/anime/run-update-task',
    method: 'post'
  })
}

// 从B站导入番剧
export function importFromBilibili(data) {
  return request({
    url: '/anime/import-from-bilibili',
    method: 'post',
    data: data
  })
}

// 添加导入腾讯视频番剧的API
export function importFromTencent(data) {
  return request({
    url: '/anime/import-from-tencent',
    method: 'post',
    data: data
  })
} 