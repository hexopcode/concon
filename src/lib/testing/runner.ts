import {assertInternal} from './asserts';
import {Expect} from './expect';

export type TestSpec = (t: TestRunner) => void;

type TestCase = {
  description: string,
  fn: () => void,
};

enum TestResultEnum {
  PASSED,
  FAILED,
}

type TestResult = {
  description: string,
  result: TestResultEnum,
  error?: Error,
};

type TestResultSummary = {
  total: number,
  passed: TestResult[],
  failed: TestResult[],
};

export function runTests(...specs: TestSpec[]): Set<TestResult> {
  const allResults: TestResult[] = [];

  for (const spec of specs) {
    const runner = new TestRunner();
    spec(runner);
    allResults.push(...runner.run());
  }

  return new Set(allResults);
}

export function runTestsSummary(...specs: TestSpec[]): TestResultSummary {
  const results = [...runTests(...specs)];
  return {
    total: results.length,
    passed: results.filter(r => r.result == TestResultEnum.PASSED),
    failed: results.filter(r => r.result == TestResultEnum.FAILED),
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