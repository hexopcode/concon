import {Flags, Registers, Result, System} from '../core';
import {TestRunner, TestSpec} from '../lib';
import {assembleAndBoot} from './helpers';

export const CoreTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('END ends', () => {
    t.assert(assembleAndBoot(sys, `END`) == Result.END, 'Ended');
  });

  t.test('VSYNC vsyncs', () => {
    t.assert(assembleAndBoot(sys, `VSYNC`) == Result.VSYNC, 'Vsynced');
  });

  t.test('BRK breaks', () => {
    t.assert(assembleAndBoot(sys, `BRK`) == Result.BRK, 'Break');
  });
}