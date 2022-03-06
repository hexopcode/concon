import {Source} from './types';

export interface SourceResolver {
  resolve(path: string): string|undefined;
}

export class StaticSourceResolver implements SourceResolver {
  private readonly sources: Map<string, string>;

  constructor() {
    this.sources = new Map();
  }

  add(source: Source) {
    this.sources.set(source.path, source.code);
  }

  paths(): string[] {
    return [...this.sources.keys()];
  }

  resolve(path: string): string|undefined {
    // FIXME: resolve relative paths
    if (this.sources.has(path)) {
      return this.sources.get(path);
    }
    return undefined;
  }
}