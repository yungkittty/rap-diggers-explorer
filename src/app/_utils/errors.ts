import { ErrorCode } from "../_constants/error-code";

export class CustomError extends Error {
  code: ErrorCode;
  constructor(error: ErrorCode) {
    super();
    this.code = error;
  }
}
