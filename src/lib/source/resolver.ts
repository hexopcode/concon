export interface SourceResolver {
  resolve(path: string): string|undefined;
}

export class StaticSourceResolver implements SourceResolver {
  private readonly sources: Map<string, string>;

  constructor() {
    this.sources = new Map();
  }

  add(path: string, source: string) {
    // FIXME: resolve relative paths
    this.sources.set(path, source);
  }

  resolve(path: string): string|undefined {
    if (this.sources.has(path)) {
      return this.sources.get(path);
    }
    return undefined;
  }
}