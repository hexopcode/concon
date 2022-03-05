import {assemble} from '../asm';
import {MemoryArea, Result, System} from '../core';
import {runTests, TestResultEnum} from '../lib';
import {ALL_TESTS} from '../../tests';
import {ConconScreen} from './components';
import {StaticSourceResolver} from '../lib/source';

const testResults = runTests(...ALL_TESTS);
const testResultsCollection = [...testResults.values()];
const total = testResultsCollection.length;
const failed = testResultsCollection.filter(result => result.result == TestResultEnum.FAILED);

if (failed.length > 0) {
  console.log(`%cFAILED ${failed.length}/${total}`, 'color: red');
  console.log(failed);
} else {
  console.log(`%cPASSED ${total}/${total}`, 'color: green');
}

const screen = new ConconScreen();
screen.attach(document.querySelector('#screen')!);

const sys = new System();
sys.registerOutputDevice(0x00, screen);

const resolver = new StaticSourceResolver();
const entrypoint = 'entrypoint.con'; 
resolver.add(entrypoint, `
proc ror:
  mov r11, r10
  shr r11, 1
  mov r12, r10
  and r12, 1
  shl r12, 15
  or r12, r11
  mov r10, r12
  ret

  mov r0, 0
  mov r10, 0b1110010011100100

loop:
  cmp r0, 0x1000
  jz render
  mov r1, 0x1000
  add r1, r0

  call ror

  sto r1, r10
  inc r0
  jmp loop

render:
  vsync
  mov r0, 0

  call ror

  // jmp loop

  end
`);

sys.loadProgram(assemble(resolver, entrypoint));

if (sys.boot() == Result.VSYNC) {
  cycle();
}

function cycle() {
  screen.render(sys.memoryArea(MemoryArea.FRAMEBUFFER));

  const result = sys.cycle();
  if (result == Result.VSYNC) {
    requestAnimationFrame(cycle);
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState == 'visible') {
    screen.render(sys.memoryArea(MemoryArea.FRAMEBUFFER));
  }
});