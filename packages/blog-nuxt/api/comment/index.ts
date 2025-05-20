import type { Result } from "../../model";
import request from "../../utils/request";
import type { AxiosPromise } from "axios";
import type { RecentComment } from "./types";

/**
 * 查看最新评论
 * @returns 最新评论
 */
export function getRecentComment(): AxiosPromise<Result<RecentComment[]>> {
  return request({
    url: "/comments/recent",
    method: "get",
  });
} 