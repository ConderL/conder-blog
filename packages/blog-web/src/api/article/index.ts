import { PageQuery, PageResult, Result } from "@/model";
import request from "@/utils/request";
import { AxiosPromise } from "axios";
import { Article, ArticleInfo, ArticleRecommend, ArticleSearch } from "./types";

/**
 * 查看文章列表
 * @param params 查询条件
 * @returns 文章列表
 */
export function getArticleList(
	params: PageQuery
): AxiosPromise<Result<PageResult<Article[]>>> {
	return request({
		url: "/articles/list",
		method: "get",
		params,
	});
}

/**
 * 查看文章
 * @param articleId 文章id
 */
export function getArticle(
	articleId: number
): AxiosPromise<Result<ArticleInfo>> {
	return request({
		url: `/articles/${articleId}`,
		method: "get",
	});
}

/**
 * 查看推荐文章
 * @returns 推荐文章
 */
export function getArticleRecommend(): AxiosPromise<
	Result<ArticleRecommend[]>
> {
	return request({
		url: "/articles/recommend",
		method: "get",
	});
}

/**
 * 搜索文章
 * @returns 文章列表
 */
export function searchArticle(
	keyword: string
): AxiosPromise<Result<ArticleSearch[]>> {
	return request({
		url: "/articles/search",
		method: "get",
		params: {
			keyword,
		},
	});
}

/**
 * 点赞文章
 * @param articleId 文章id
 */
export function likeArticle(articleId: number): AxiosPromise<Result<null>> {
	return request({
		url: `/articles/${articleId}/like`,
		method: "post",
	});
}

/**
 * 取消点赞文章
 * @param articleId 文章id
 */
export function unlikeArticle(articleId: number): AxiosPromise<Result<null>> {
	console.log(`发起文章取消点赞请求: articleId=${articleId}`);
	// 因为DELETE路由出现404错误，暂时改用POST请求，添加操作类型参数
	return request({
		url: `/articles/${articleId}/like`,
		method: "post",
		// 添加操作参数，区分点赞和取消点赞
		params: {
			type: "unlike",
		},
		// 确保携带凭证
		withCredentials: true,
	});
}
