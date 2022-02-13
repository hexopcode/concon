import {Flags, Registers, Result, System} from '../src/core';
import {TestRunner, TestSpec} from '../src/lib';
import {assembleAndBoot} from './helpers';

export const CoreTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('END ends', () => {
    t.assert(assembleAndBoot(sys, `END`) == Result.END, 'Ended');
  });

  t.test('missing END ends with SEGFAULT', () => {
    t.assert(assembleAndBoot(sys, ``) == Result.SEGFAULT, 'Seg fault');
  });

  t.test('VSYNC vsyncs', () => {
    t.assert(assembleAndBoot(sys, `VSYNC`) == Result.VSYNC, 'Vsynced');
  });

  t.test('BRK breaks', () => {
    t.assert(assembleAndBoot(sys, `BRK`) == Result.BRK, 'Break');
  });
}