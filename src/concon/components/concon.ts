import {ALL_TESTS} from '../../../tests';
import {ConconConsoleElement, LOAD_SOURCE} from './console';
import {ConconScreenElement} from './screen';
import {MemoryArea, Result, System} from '../../core';
import {SourceResolver} from '../../lib/source';
import {assemble} from '../../asm';
import {runTestsSummary} from '../../lib/testing';
import {ConconContext} from './context';
import {use, ContextElement} from '../../lib/dom';

export class ConconElement extends HTMLElement {
  private readonly screen: ConconScreenElement;
  private readonly console: ConconConsoleElement;
  private readonly context: ConconContext;
  private readonly resolver: SourceResolver;

  private readonly system: System;
  private source: Source|undefined;

  constructor() {
    super();
    this.screen = this.querySelector('concon-screen')! as ConconScreenElement;
    this.console = this.querySelector('concon-console')! as ConconConsoleElement;
    this.console.addEventListener(LOAD_SOURCE, this.handleLoadSource.bind(this));

    this.context = use(this.closest('concon-context')! as ContextElement<ConconContext>);
    this.resolver = this.context.resolver;

    this.system = new System();
    this.system.registerOutputDevice(0x00, this.screen);
    this.source = undefined;

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState == 'visible') {
        this.screen.render(this.system.memoryArea(MemoryArea.FRAMEBUFFER));
      }
    });
  }

  boot() {
    this.tests();
  }

  private handleLoadSource(e: CustomEvent<Source>) {
    this.source = e.detail;
    this.system.reset(false);
    this.system.loadProgram(assemble(this.resolver, this.source.path));
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
      this.console.log(`PROGRAM ${this.source?.path} TERMINATED: ${Result[result]}`);
    }
  }
}