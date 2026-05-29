/* eslint-disable @typescript-eslint/no-explicit-any */
export type ResponseType = {
  result?: string;
  status: string;
  content?: any;
  message?: string | null;
  localeMessage?: {
    messageCode: string;
    params?: Record<string, any>;
  } | null;
  warnings?: any;
  errors?: any;
};
