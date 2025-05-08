import { PageQuery, PageResult, Result } from "@/model";
import request from "@/utils/request";
import { AxiosPromise } from "axios";
import {
	Comment,
	CommentForm,
	CommentQuery,
	RecentComment,
	Reply,
} from "./types";

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
 * 添加评论
 */
export function addComment(data: CommentForm): AxiosPromise<Result<null>> {
	return request({
		url: "/comments/add",
		method: "post",
		data,
	});
}

/**
 * 查看评论列表
 * @returns 评论列表
 */
export function getCommentList(
	params: CommentQuery
): AxiosPromise<Result<PageResult<Comment[]>>> {
	return request({
		url: "/comments/list",
		method: "get",
		params,
	});
}

/**
 * 查看回复评论
 * @param commentId 评论id
 * @param params 分页参数
 * @returns 回复评论列表
 */
export function getReplyList(
	commentId: number,
	params: PageQuery
): AxiosPromise<Result<Reply[]>> {
	return request({
		url: `/comments/${commentId}/reply`,
		method: "get",
		params,
	});
}

/**
 * 点赞评论
 * @param commentId 评论id
 */
export function likeComment(commentId: number): AxiosPromise<Result<null>> {
	console.log(`发起评论点赞请求: commentId=${commentId}`);
	return request({
		url: `/comments/${commentId}/like`,
		method: "post",
		// 确保携带凭证
		withCredentials: true,
	});
}

/**
 * 取消点赞评论
 * @param commentId 评论id
 */
export function unlikeComment(commentId: number): AxiosPromise<Result<null>> {
	console.log(`发起评论取消点赞请求: commentId=${commentId}`);
	// 因为DELETE路由出现404错误，暂时改用POST请求，添加操作类型参数
	return request({
		url: `/comments/${commentId}/like`,
		method: "post",
		// 添加操作参数，区分点赞和取消点赞
		params: {
			type: "unlike",
		},
		// 确保携带凭证
		withCredentials: true,
	});
}
