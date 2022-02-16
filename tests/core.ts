import {Result, System} from '../src/core';
import {TestRunner, TestSpec} from '../src/lib';
import {assembleAndBoot} from './helpers';

export const CoreTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('end ends', () => {
    t.assertThat(assembleAndBoot(sys, `end`)).is(Result.END);
  });

  t.test('missing end ends with SEGFAULT', () => {
    t.assertThat(assembleAndBoot(sys, ``)).is(Result.SEGFAULT);
  });

  t.test('vsync vsyncs', () => {
    t.assertThat(assembleAndBoot(sys, `vsync`)).is(Result.VSYNC);
  });

  t.test('brk breaks', () => {
    t.assertThat(assembleAndBoot(sys, `brk`)).is(Result.BRK);
  });
}