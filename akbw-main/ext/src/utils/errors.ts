export type AppErrorCode =
  | "NOT_CONFIGURED"
  | "NO_INTERNET"
  | "TIMEOUT"
  | "HTTP"
  | "INVALID_RESPONSE"
  | "UNKNOWN";

export class ApiError extends Error {
  readonly code: AppErrorCode;
  readonly status?: number;

  constructor(code: AppErrorCode, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

const ERROR_MESSAGES: Record<AppErrorCode, string> = {
  NOT_CONFIGURED:
    "API URL yoki token sozlanmagan. Iltimos, sozlamalarni oching.",
  NO_INTERNET:
    "Internet aloqasi topilmadi. Tarmoq holatini tekshirib, qayta urinib ko'ring.",
  TIMEOUT: "So'rov vaqt o'tishi tufayli bekor bo'ldi. Qayta urinib ko'ring.",
  HTTP: "Server xatolik qaytardi. Iltimos, qayta urinib ko'ring.",
  INVALID_RESPONSE: "Serverdan noto'g'ri javob keldi.",
  UNKNOWN: "Kutilmagan xatolik yuz berdi. Qayta urinib ko'ring.",
};

export function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return ERROR_MESSAGES.UNKNOWN;
}

export function getErrorCode(error: unknown): AppErrorCode {
  if (error instanceof ApiError) return error.code;
  return "UNKNOWN";
}
