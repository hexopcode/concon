import {assemble} from '../asm';
import {MEMORY_SCREEN_OFFSET, MEMORY_SCREEN_SIZE, Result, System} from '../core';
import {runTests} from '../lib';
import {ALL_TESTS} from '../tests';
import {ConconScreen} from './components';

console.log(runTests(...ALL_TESTS));

const screen = new ConconScreen();
screen.attach(document.body);

const sys = new System();
sys.loadProgram(assemble(`
    STOI 0x178F, 0b1111111111111111
    STOI 0x17AF, 0b1001100110011001
    STOI 0x17CF, 0b0110011001100110
    STOI 0x17EF, 0b1111111111111111
    VSYNC
    END
`));

if (sys.boot() == Result.VSYNC) {
  cycle();
}

function cycle() {
  const buffer: Uint8Array = sys.debugMem(MEMORY_SCREEN_OFFSET, MEMORY_SCREEN_SIZE);
  screen.render(buffer);

  const result = sys.cycle();
  if (result == Result.VSYNC) {
    requestAnimationFrame(cycle);
  }
}