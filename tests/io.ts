import {Result, System} from '../src/core';
import {TestRunner, TestSpec} from '../src/lib';
import {assembleAndBoot} from './helpers';

class OutRecorder {
  readonly data: number[];

  constructor() {
    this.data = [];
  }

  out(data: number) {
    this.data.push(data);
  }

  outb(data: number) {
    this.data.push(data);
  }
};

export const IoTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('out outs words', () => {
    const rec = new OutRecorder();
    sys.registerOutputDevice(0x00, rec);
    sys.registerOutputDevice(0xff, rec);
    sys.registerOutputDevice(0x1234, rec);

    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0xff
        mov r1, 0xcc
        mov r2, 0xaa

        out 0x00, 0x12
        out r0, 0x34
        out 0x1234, r1
        out r0, r2
        
        end
    `)).is(Result.END);
    t.assertThat(rec.data).isArrayEqual([0x12, 0x34, 0xcc, 0xaa]);
  });

  t.test('out outs bytes', () => {
    const rec = new OutRecorder();
    sys.registerOutputDevice(0x00, rec);
    sys.registerOutputDevice(0xff, rec);
    sys.registerOutputDevice(0x1234, rec);

    t.assertThat(assembleAndBoot(sys, `
        mov r0, 0xff
        mov r1, 0xcc
        mov r2, 0xaa

        outb 0x00, 0x12
        outb r0, 0x34
        outb 0x1234, r1
        outb r0, r2
        
        end
    `)).is(Result.END);
    t.assertThat(rec.data).isArrayEqual([0x12, 0x34, 0xcc, 0xaa]);
  });
}