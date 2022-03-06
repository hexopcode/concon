import {assemble} from '../asm';
import {MemoryArea, Result, System} from '../core';
import {runTestsSummary} from '../lib/testing';
import {ALL_TESTS} from '../../tests';
import {ConconConsoleElement, ConconScreenElement} from './components';
import {StaticSourceResolver} from '../lib/source';
import {stripes} from './examples';

customElements.define('concon-console', ConconConsoleElement);
customElements.define('concon-screen', ConconScreenElement);
const screen = document.querySelector('concon-screen')! as ConconScreenElement;
const con = document.querySelector('concon-console')! as ConconConsoleElement;

const testSummary = runTestsSummary(...ALL_TESTS);
if (testSummary.failed.length > 0) {
  con.log(`TESTS FAILED ${testSummary.failed.length}/${testSummary.total}`);
} else {
  con.log(`TESTS PASSED ${testSummary.total}/${testSummary.total}`);
}

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
  } else {
    con.log(`PROGRAM ${stripes.path.toUpperCase()} TERMINATED: ${Result[result]}`);
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState == 'visible') {
    screen.render(sys.memoryArea(MemoryArea.FRAMEBUFFER));
  }
});