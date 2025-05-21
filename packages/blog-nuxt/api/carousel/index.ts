import type { Result } from "../../model";
import request from "../../utils/request";
import type { AxiosPromise } from "axios";
import type { Carousel } from "./types";

/**
 * 获取轮播图列表
 * @returns 轮播图列表
 */
export function getCarouselList(): AxiosPromise<Result<Carousel[]>> {
  return request({
    url: "/carousel/list",
    method: "get",
  });
} 