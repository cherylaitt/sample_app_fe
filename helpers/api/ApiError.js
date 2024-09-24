import { composeErrorMessage } from "./errorCodeMapping";

export class ApiError extends Error {
  constructor({ url, code, status, message, errors = {} }) {
    super(composeErrorMessage(status, code, message));
    this.url = url;
    this.code = code;
    this.status = status;
    this.errors = errors;
  }

  resourceNotFound() {
    return this.status === 404;
  }

  unauthorized() {
    return this.status === 401;
  }

  getFieldErrorMessage(fieldName) {
    if (Array.isArray(this.errors)) {
      const errorInfo = this.errors.find((error) => {
        return error.field === fieldName;
      });

      return errorInfo ? errorInfo.messages.join(",") : null;
    }

    return null;
  }
}
