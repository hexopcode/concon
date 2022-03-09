import {ConconContext} from './context';
import {ConconDevBarElement, LIST_SOURCES} from './devbar';
import {ConconOutputElement} from './output';
import {Source, SourceResolver, StaticSourceResolver} from '../../lib/source';
import {use, ContextElement} from '../../lib/dom';
import {stripes} from '../examples';

export const LOAD_SOURCE = 'load-source';

declare global {
  interface HTMLElementEventMap {
    [LOAD_SOURCE]: CustomEvent<Source>,
  }
}

export class ConconConsoleElement extends HTMLElement {
  private readonly devbar: ConconDevBarElement;
  private readonly output: ConconOutputElement;
  private readonly context: ConconContext;
  private readonly resolver: SourceResolver;

  constructor() {
    super();
    this.devbar = this.querySelector('concon-devbar')! as ConconDevBarElement;
    this.devbar.addEventListener(LIST_SOURCES, this.handleListSources.bind(this));
    this.output = this.querySelector('concon-output')! as ConconOutputElement;

    this.context = use(this.closest('concon-context')! as ContextElement<ConconContext>);
    this.resolver = this.context.resolver;
    (this.resolver as StaticSourceResolver).add(stripes);
  }

  connectedCallback() {
    const source = this.resolver.source('/concon/examples/stripes.con');
    if (source) {
      this.loadSource(source);
    }
  }

  log(text: string) {
    const child = document.createElement('div');
    child.innerHTML = text;
    this.output.add(child);
  }

  clear() {
    this.output.clear();
  }

  private loadSource(source: Source) {
    this.dispatchEvent(new CustomEvent<Source>(LOAD_SOURCE, {detail: source}));
  }

  private handleListSources() {
    this.clear();
  
    for (const source of this.resolver.list()) {
      const child = document.createElement('div');
      child.innerHTML = source.path;
      child.addEventListener('click', () => {
        this.loadSource(source);
        this.clear();
      }, {once: true});
      this.output.add(child);
    }
  }
}