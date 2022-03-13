export abstract class Result<T, E> {
  protected readonly valueOrError: T|E;

  protected constructor(valueOrError: T|E) {
    this.valueOrError = valueOrError;
  }

  isOk() {
    return this instanceof OkResult;
  }

  isErr() {
    return this instanceof ErrResult;
  }

  expect(message: string): T|never {
    if (this.isOk()) {
      return this.valueOrError as T;
    }
    throw new Error(message);
  }

  unwrap(): T|never {
    return this.expect('failed to unwrap result');
  }

  unwrapOr(value: T): T {
    return this.isOk() ? this.valueOrError as T : value;
  }

  unwrapOrElse(fn: () => T): T {
    return this.isOk() ? this.valueOrError as T : fn();
  }

  failure(): E|never {
    if (this.isErr()) {
      return this.valueOrError as E;
    }
    throw new Error(`Invalid access to result error`);
  }
}

class OkResult<T> extends Result<T, any> {
  constructor(value: T|OkResult<T>) {
    super(value instanceof OkResult ? (value.valueOrError as T) : (value as T));
  }
}

class ErrResult<E> extends Result<any, E> {
  constructor(value: E|ErrResult<E>) {
    super(value instanceof ErrResult ? (value.valueOrError as E) : (value as E));
  }
}

export function ok<T>(value?: T): Result<T, any> {
  return new OkResult(value ?? (undefined as any));
}

export function err<E>(err: E|Result<any, E>): Result<any, E> {
  return new ErrResult(err);
}