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
  screen.render(sys.memoryArea(MemoryArea.SCREEN));

  const result = sys.cycle();
  if (result == Result.VSYNC) {
    requestAnimationFrame(cycle);
  }
}