export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta: {
    requestId: string;
  };
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: {
    requestId: string;
  };
};

export const successResponse = <T>(data: T, requestId: string): ApiSuccess<T> => ({
  success: true,
  data,
  meta: { requestId }
});

export const errorResponse = (
  code: string,
  message: string,
  requestId: string,
  details?: unknown
): ApiError => ({
  success: false,
  error: {
    code,
    message,
    ...(details === undefined ? {} : { details })
  },
  meta: { requestId }
});
