import {Opcodes, Result, System} from "../core";

const sys = new System();
sys.reset();
sys.loadProgram(new Uint8Array([
  Opcodes.NOP,
  Opcodes.NOP,
  Opcodes.VSYNC,
  Opcodes.NOP,
  Opcodes.VSYNC,
  Opcodes.END,
]));
sys.boot();

function cycle() {
  const result = sys.cycle();
  if (result == Result.VSYNC) {
    console.log('vsync');
    // TODO: render to screen
    requestAnimationFrame(cycle);
  }
}

cycle();