import {err, ok, Result} from '../types';
import {Source, SourceError} from './types';

export interface SourceResolver {
  list(includeLibraries?: boolean): Iterable<Source>;
  resolve(path: string): Result<string, SourceError>;
  source(path: string): Result<Source, SourceError>;
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

  resolve(path: string): Result<string, SourceError> {
    const source = this.source(path);
    if (source.isErr()) return err(source);

    return ok(source.unwrap().code);
  }

  source(path: string): Result<Source, SourceError> {
    if (this.sources.has(path)) {
      return ok(this.sources.get(path)!);
    }
    return err({
      path,
      message: `Source not found: ${path}`,
    });
  }
}