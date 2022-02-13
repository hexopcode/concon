import {Flags, Registers, Result, System} from '../src/core';
import {TestRunner, TestSpec} from '../src/lib';
import {assembleAndBoot} from './helpers';

export const CoreTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('end ends', () => {
    t.assert(assembleAndBoot(sys, `end`) == Result.END, 'Ended');
  });

  t.test('missing end ends with SEGFAULT', () => {
    t.assert(assembleAndBoot(sys, ``) == Result.SEGFAULT, 'Seg fault');
  });

  t.test('vsync vsyncs', () => {
    t.assert(assembleAndBoot(sys, `vsync`) == Result.VSYNC, 'Vsynced');
  });

  t.test('brk breaks', () => {
    t.assert(assembleAndBoot(sys, `brk`) == Result.BRK, 'Break');
  });
}