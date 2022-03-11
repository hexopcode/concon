import {Source} from './types';

export interface SourceResolver {
  list(includeLibraries?: boolean): Iterable<Source>;
  resolve(path: string): string|undefined;
  source(path: string): Source|undefined;
}

export class StaticSourceResolver implements SourceResolver {
  private readonly sources: Map<string, Source>;

  constructor() {
    this.sources = new Map();
  }

  add(...sources: Source[]) {
    for (const source of sources) {
      this.sources.set(source.path, source);
    }
  }

  list(includeLibraries: boolean = false): Iterable<Source> {
    const sources = [...this.sources.values()];
    return sources.filter(s => !s.library || includeLibraries);
  }

  resolve(path: string): string|undefined {
    // FIXME: resolve relative paths
    if (this.sources.has(path)) {
      return this.source(path)!.code;
    }
    return undefined;
  }

  source(path: string): Source|undefined {
    if (this.sources.has(path)) {
      return this.sources.get(path)!;
    }
    return undefined;
  }
}