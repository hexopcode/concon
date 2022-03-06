import {ALL_TESTS} from '../../../tests';
import {ConconConsoleElement} from './console';
import {ConconScreenElement} from './screen';
import {MemoryArea, Result, System} from '../../core';
import {StaticSourceResolver} from '../../lib/source';
import {assemble} from '../../asm';
import {runTestsSummary} from '../../lib/testing';
import {stripes} from '../examples';

export class ConconElement extends HTMLElement {
  private readonly screen: ConconScreenElement;
  private readonly console: ConconConsoleElement;
  private readonly system: System;
  private readonly resolver: StaticSourceResolver;

  constructor() {
    super();
    this.screen = this.querySelector('concon-screen')! as ConconScreenElement;
    this.console = this.querySelector('concon-console')! as ConconConsoleElement;

    this.system = new System();
    this.system.registerOutputDevice(0x00, this.screen);

    this.resolver = new StaticSourceResolver();
    this.resolver.add(stripes);

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState == 'visible') {
        this.screen.render(this.system.memoryArea(MemoryArea.FRAMEBUFFER));
      }
    });
  }

  boot() {
    this.tests();

    this.system.loadProgram(assemble(this.resolver, this.resolver.paths()[0]));
    this.cycle();
  }

  private tests() {
    const testSummary = runTestsSummary(...ALL_TESTS);
    if (testSummary.failed.length > 0) {
      this.console.log(`TESTS FAILED ${testSummary.failed.length}/${testSummary.total}`);
    } else {
      this.console.log(`TESTS PASSED ${testSummary.total}/${testSummary.total}`);
    }
  }

  private cycle() {
    this.screen.render(this.system.memoryArea(MemoryArea.FRAMEBUFFER));

    const result = this.system.cycle();
    if (result == Result.VSYNC) {
      requestAnimationFrame(this.cycle.bind(this));
    } else {
      this.console.log(`PROGRAM ${stripes.path.toUpperCase()} TERMINATED: ${Result[result]}`);
    }
  }
}