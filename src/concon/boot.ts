import {assemble} from '../asm';
import {MemoryArea, Result, System} from '../core';
import {runTests, TestResultEnum} from '../lib';
import {ALL_TESTS} from '../tests';
import {ConconScreen} from './components';

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
screen.attach(document.body);

const sys = new System();
sys.loadProgram(assemble(`
    MOV R0, 0
  loop:
    CMP R0, 0x1000
    JZ render
    MOV R1, 0x1000
    ADD R1, R0
    STO R1, 0b1110010011100100
    INC R0
    JMP loop

  render:
    VSYNC
    END
`));

if (sys.boot() == Result.VSYNC) {
  cycle();
}

function cycle() {
  screen.render(sys.memoryArea(MemoryArea.SCREEN));

  const result = sys.cycle();
  if (result == Result.VSYNC) {
    requestAnimationFrame(cycle);
  }
}