import { applyDecorators, SetMetadata } from '@nestjs/common';

export const LOG_KEY = 'system_log';

export interface LogOptions {
  description?: string;
  disableArgsLogging?: boolean;
  disableResultLogging?: boolean;
}

export const Log = (options: LogOptions = {}) => {
  return applyDecorators(
    SetMetadata(LOG_KEY, {
      description: options.description || '',
      disableArgsLogging: options.disableArgsLogging || false,
      disableResultLogging: options.disableResultLogging || false,
    }),
  );
};
