import type { Result, PageResult } from "../../model";
import request from "../../utils/request";
import type { AxiosPromise } from "axios";
import type { RecentComment, CommentQuery, Comment } from "./types";

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

/**
 * 查看评论列表
 * @param params 查询条件
 * @returns 评论列表
 */
export function getCommentList(
  params: CommentQuery
): AxiosPromise<Result<PageResult<Comment[]>>> {
  return request({
    url: "/comments",
    method: "get",
    params,
  });
}

/**
 * 添加评论
 * @param data 评论信息
 * @returns 添加结果
 */
export interface AddCommentParams {
  typeId: number;
  commentType: number;
  commentContent: string;
  replyId?: number;
  toUid?: number;
}

export function addComment(
  data: AddCommentParams
): AxiosPromise<Result<null>> {
  return request({
    url: "/comments",
    method: "post",
    data,
  });
}

/**
 * 点赞评论
 * @param commentId 评论id
 * @returns 点赞结果
 */
export function likeComment(
  commentId: number
): AxiosPromise<Result<null>> {
  return request({
    url: `/comments/${commentId}/like`,
    method: "post",
  });
} 