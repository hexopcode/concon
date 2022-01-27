import {assemble} from '../asm';
import {Result, System} from '../core';

const sys = new System();
sys.reset();
sys.loadProgram(assemble(`
// dummy
NOP
NOP
VSYNC
NOP
VSYNC
MOVI R0, 0x1234
END
`));
sys.boot();

function cycle() {
  const result = sys.cycle();
  if (result == Result.VSYNC) {
    console.log('vsync');
    // TODO: render to screen
    requestAnimationFrame(cycle);
  } else if (result == Result.END) {
    console.log('registers', sys.debugRegisters());
  }
}

cycle();