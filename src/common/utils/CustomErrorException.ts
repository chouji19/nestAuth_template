export class CustomErrorException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CustomErrorException';
  }
}
