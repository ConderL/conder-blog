import { PageResult, Result } from "~/model";
import request from "~/utils/request";

// 直接在文件中定义PageQuery接口，避免导入错误
export interface PageQuery {
  current: number;
  size: number;
}

// 直接在文件中定义Archives接口，避免导入错误
export interface Archives {
  id: number;
  articleTitle: string;
  articleCover: string;
  createTime: string;
}

/**
 * 查看文章归档
 * @param params 查询条件
 * @returns 文章归档
 */
export function getArchivesList(params: PageQuery) {
  return request({
    url: "/archives/list",
    method: "get",
    params,
  });
} 