import type { PageQuery, PageResult, Result } from "../../model";
import request from "../../utils/request";
import type { AxiosPromise } from "axios";
import type { Article, ArticleInfo, ArticleRecommend, ArticleSearch } from "./types";

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
export function likeArticle(
	articleId: number
): AxiosPromise<Result<null>> {
	return request({
		url: `/articles/${articleId}/like`,
		method: "post",
	});
}

/**
 * 取消点赞文章
 * @param articleId 文章id
 */
export function unlikeArticle(
	articleId: number
): AxiosPromise<Result<null>> {
	return request({
		url: `/articles/${articleId}/unlike`,
		method: "post",
	});
} 