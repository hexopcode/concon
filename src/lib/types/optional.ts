abstract class Optional<T> {
  private readonly valueOrEmpty: T|undefined;
  
  protected constructor(valueOrEmpty: T|undefined = undefined) {
    this.valueOrEmpty = valueOrEmpty;
  }

  isSome() {
    return this.valueOrEmpty instanceof SomeOptional;
  }

  isEmpty() {
    return this.valueOrEmpty instanceof EmptyOptional;
  }

  expect(message: string): T|never {
    if (this.isSome()) {
      return this.valueOrEmpty as T;
    }
    throw new Error(message);
  }

  unwrap(): T|never {
    return this.expect('failed to unwrap result');
  }

  unwrapOr(value: T): T {
    return this.isSome() ? this.valueOrEmpty as T : value;
  }

  unwrapOrElse(fn: () => T): T {
    return this.isSome() ? this.valueOrEmpty as T : fn();
  }
}

class SomeOptional<T> extends Optional<T> {
  constructor(value: T) {
    super(value);
  }
}

class EmptyOptional<T> extends Optional<T> {
  constructor() {
    super();
  }
}

export function some<T>(value: T): Optional<T> {
  return new SomeOptional(value);
}

export function empty<T>(): Optional<T> {
  return new EmptyOptional();
}