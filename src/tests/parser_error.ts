import {assembleCheck} from '../asm';
import {System} from '../core';
import {TestRunner, TestSpec} from '../lib';

export const ParserErrorTests: TestSpec = (t: TestRunner) => {
  const sys = new System();

  t.before(() => {
    sys.reset();
  });

  t.test('parser fails with unknown identifier', () => {
    const errors = assembleCheck(`POTATO`);

    t.assert(errors.length == 1, 'Has assembly error');
    t.assert(errors[0].message == 'Invalid token: POTATO', 'Has error message');
  });

  t.test('parser fails with incorrect operand', () => {
    const errors = assembleCheck(`INC 0x1234`);

    t.assert(errors.length == 1, 'Has assembly error');
    t.assert(errors[0].message == 'Invalid token: NUMBER. Expected register', 'Has error message');
  });
};