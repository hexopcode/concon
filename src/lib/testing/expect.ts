import {assertInternal} from './asserts';

export class Expect<T> {
  private readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  isArrayEqual(expect: T) {
    if (!Array.isArray(this.value)) {
      assertInternal(false, `Expected ${this.value} to be an array`);
    }
    if (!Array.isArray(expect)) {
      assertInternal(false, `Expected ${expect} to be an array`);
    }
    
    const v: any[] = (this.value as unknown) as any[];
    const exp: any[] = (expect as unknown) as any[];

    if (v.length != exp.length) {
      assertInternal(false, `Expected ${v} to be of length ${exp.length}`);
    }

    for (let i = 0; i < v.length; ++i) {
      if (v[i] != exp[i]) {
        assertInternal(false, `Expected [${i}] to be ${exp[i]}`);
      }
    }
  }

  is(expect: T) {
    assertInternal(this.value == expect, `Expected ${expect} but got ${this.value}`);
  }
}