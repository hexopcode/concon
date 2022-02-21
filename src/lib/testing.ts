export type TestSpec = (t: TestRunner) => void;

type TestCase = {
  description: string,
  fn: () => void,
};

export enum TestResultEnum {
  PASSED,
  FAILED,
}

type TestResult = {
  description: string,
  result: TestResultEnum,
  error?: Error,
}

export function runTests(...specs: TestSpec[]): Set<TestResult> {
  const allResults: TestResult[] = [];

  for (const spec of specs) {
    const runner = new TestRunner();
    spec(runner);
    allResults.push(...runner.run());
  }

  return new Set(allResults);
}

function assertInternal(cond: boolean, message: string) {
  if (!cond) {
    console.error(message);
    throw new Error(message);
  }
}

class Expect<T> {
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

export class TestRunner {
  private testBefore?: () => void;
  private testAfter?: () => void;
  private readonly allTestCases: Set<TestCase>;
  private readonly allTestResults: Set<TestResult>;

  constructor() {
    this.allTestCases = new Set();
    this.allTestResults = new Set();
  }

  before(fn: () => void) {
    this.testBefore = fn;
  }

  after(fn: () => void) {
    this.testAfter = fn;
  }

  test(description: string, fn: () => void) {
    this.allTestCases.add({description, fn});
  }

  assert(cond: boolean, message: string) {
    assertInternal(cond, message);
  }

  assertThat<T>(value: T): Expect<T> {
    return new Expect(value);
  }

  run(): Set<TestResult> {
    for (const testCase of this.allTestCases) {
      if (this.testBefore) {
        this.testBefore();
      }

      try {
        testCase.fn();
        this.allTestResults.add({
          description: testCase.description,
          result: TestResultEnum.PASSED,
        });
      } catch (e) {
        console.error(e);
        this.allTestResults.add({
          description: testCase.description,
          result: TestResultEnum.FAILED,
          error: e as Error,
        });
      }

      if (this.testAfter) {
        this.testAfter();
      }
    }

    return this.allTestResults;
  }
}