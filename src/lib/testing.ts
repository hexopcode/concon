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
  const runner = new TestRunner();
  for (const spec of specs) {
    spec(runner);
  }
  return runner.run();
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
    if (!cond) {
      throw new Error(message);
    }
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