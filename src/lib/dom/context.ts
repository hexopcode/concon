export type Context = {
  type: string,
};

const registry: Map<string, ContextElement<any>> = new Map();

export function use<T extends Context>(el: ContextElement<T>): T {
  return el.get();
}

export abstract class ContextElement<T extends Context> extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const ctx = this.get();
    registry.set(ctx.type, this);
  }

  abstract get(): T;
}