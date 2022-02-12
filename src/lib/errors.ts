export class SegFaultError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SegFaultError';
  }
}