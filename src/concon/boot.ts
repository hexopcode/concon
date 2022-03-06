import {assemble} from '../asm';
import {MemoryArea, Result, System} from '../core';
import {runTests, TestResultEnum} from '../lib/testing';
import {ALL_TESTS} from '../../tests';
import {ConconScreenElement} from './components';
import {StaticSourceResolver} from '../lib/source';
import {stripes} from './examples';

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

customElements.define('concon-screen', ConconScreenElement);
const screen = document.querySelector('concon-screen')! as ConconScreenElement;

const sys = new System();
sys.registerOutputDevice(0x00, screen);

const resolver = new StaticSourceResolver();
resolver.add(stripes);

sys.loadProgram(assemble(resolver, stripes.path));

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