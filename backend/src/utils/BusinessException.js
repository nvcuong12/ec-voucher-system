export class BusinessException extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.name = "BusinessException";
    this.code = code;
    this.status = status;
  }
}
