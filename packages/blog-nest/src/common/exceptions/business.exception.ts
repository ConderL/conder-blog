import { HttpException, HttpStatus } from '@nestjs/common';
import { BUSINESS_ERROR_CODE } from './business.error.codes';

type BusinessError = {
  code: number;
  message: string;
};

export class BusinessException extends HttpException {
  constructor(err: BusinessError | string) {
    if (typeof err === 'string') {
      err = {
        code: BUSINESS_ERROR_CODE.COMMON,
        message: err,
      };
    }
    super(
      {
        code: err.code,
        message: err.message,
      },
      HttpStatus.OK,
    );
  }

  static throwForbidden() {
    throw new BusinessException({
      code: BUSINESS_ERROR_CODE.ACCESS_FORBIDDEN,
      message: '抱歉哦，您无此权限！',
    });
  }

  static throwPermissionDisabled() {
    throw new BusinessException({
      code: BUSINESS_ERROR_CODE.PERMISSION_DISABLED,
      message: '该权限已被禁用！',
    });
  }

  static throwUserDisabled() {
    throw new BusinessException({
      code: BUSINESS_ERROR_CODE.USER_DISABLED,
      message: '该用户已被冻结！',
    });
  }

  static throwTokenInvalid() {
    throw new BusinessException({
      code: BUSINESS_ERROR_CODE.TOKEN_INVALID,
      message: '登录已过期，请重新登录！',
    });
  }

  static throwFileNotFound() {
    throw new BusinessException({
      code: BUSINESS_ERROR_CODE.COMMON,
      message: '文件不存在！',
    });
  }

  static throwFileUploadError(message = '文件上传失败！') {
    throw new BusinessException({
      code: BUSINESS_ERROR_CODE.COMMON,
      message,
    });
  }

  static throwDataNotFound(entity = '数据') {
    throw new BusinessException({
      code: BUSINESS_ERROR_CODE.COMMON,
      message: `${entity}不存在！`,
    });
  }

  static throwDataExists(entity = '数据') {
    throw new BusinessException({
      code: BUSINESS_ERROR_CODE.COMMON,
      message: `${entity}已存在！`,
    });
  }

  static throwOperationFailed(operation = '操作') {
    throw new BusinessException({
      code: BUSINESS_ERROR_CODE.COMMON,
      message: `${operation}失败！`,
    });
  }
}
