import {err, ok, Result} from '../types';
import {Source, SourceError} from './types';

export interface SourceResolver {
  list(includeLibraries?: boolean): Iterable<Source>;
  resolve(path: string): Result<string, SourceError>;
  source(path: string): Result<Source, SourceError>;
}

const TEST_PATH_PREFIX = '/__wds-outside-root__/1/src';

export class StaticSourceResolver implements SourceResolver {
  private readonly sources: Map<string, Source>;

  constructor(sources: Map<string, Source> = new Map()) {
    this.sources = sources;
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

  static normalize(path: string): string {
    return path.replace(TEST_PATH_PREFIX, '');
  }

  forTestEnv(): StaticSourceResolver {
    const testSources: Map<string, Source> = new Map();
    for (const [path, source] of this.sources) {
      const testPath = StaticSourceResolver.normalize(path);
      const testSource: Source = {
        path: testPath,
        code: source.code,
        library: source.library,
      };
      testSources.set(testPath, testSource);
    }
    return new StaticSourceResolver(testSources);
  }
}