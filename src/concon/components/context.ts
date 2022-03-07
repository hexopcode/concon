import {ContextElement} from '../../lib/dom';
import {SourceResolver, StaticSourceResolver} from '../../lib/source';

export type ConconContext = {
  type: 'ConconContext',
  resolver: SourceResolver,
};

export class ConconContextElement extends ContextElement<ConconContext> {
  private readonly context: ConconContext;

  constructor() {
    super();
    this.context = {
      type: 'ConconContext',
      resolver: new StaticSourceResolver(),
    }
  }

  get(): ConconContext {
    return this.context;
  }
}