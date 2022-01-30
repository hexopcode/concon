import {assemble} from '../asm';
import {MEMORY_SCREEN_OFFSET, MEMORY_SCREEN_SIZE, System} from '../core';
import {runTests} from '../lib';
import {ALL_TESTS} from '../tests';
import {ConconScreen} from './components';

console.log(runTests(...ALL_TESTS));

const screen = new ConconScreen();
screen.attach(document.body);

const sys = new System();
sys.loadProgram(assemble(`END`));
sys.boot();

const buffer: Uint8Array = sys.debugMem(MEMORY_SCREEN_OFFSET, MEMORY_SCREEN_SIZE);
for (let i = 0; i < MEMORY_SCREEN_SIZE; ++i) {
  buffer[i] = Math.random() * 256 | 0;
}
screen.render(buffer);