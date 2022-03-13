import {
  EntrypointAst,
  LibraryAst,
  ModuleAst,
  ProgramAst,
} from './ast';
import {ParserError, AsmErrorCollector, AsmError} from '../base';
import {Graph, hasCycles} from '../../lib/algorithm';
import {Parser} from './parser';
import {err, ok, Result} from '../../lib/types';
import {SourceError, SourceResolver} from '../../lib/source';
import {tokenize} from './tokenizer';

export function parseProgram(
  resolver: SourceResolver,
  entrypointPath: string,
  collectError: AsmErrorCollector): Result<ProgramAst, AsmError> {
return new ProgramParser(resolver, collectError).parse(entrypointPath);
}

class ProgramParser {
private readonly resolver: SourceResolver;
private readonly collectError: AsmErrorCollector;

constructor(resolver: SourceResolver, collectError: AsmErrorCollector) {
  this.resolver = resolver;
  this.collectError = collectError;
}

parse(entrypointPath: string): Result<ProgramAst, AsmError> {
  const libraries: Map<string, LibraryAst> = new Map();
  const entrypoint = this.tokenizeAndParse<EntrypointAst>(entrypointPath, 'EntrypointAst');
  if (entrypoint.isErr()) return err(entrypoint);
  
  const graph: Graph<string> = {
    nodes: [entrypointPath],
    edges: [],
  };

  const libraryQueue: string[] = [...entrypoint.unwrap().uses.map(use => use.path)];
  graph.edges.push(...libraryQueue.map(dep => ({from: entrypointPath, to: dep})));

  while (libraryQueue.length > 0) {
    const libraryPath = libraryQueue.shift()!;
    const library = this.tokenizeAndParse<LibraryAst>(libraryPath, 'LibraryAst');
    if (library.isErr()) return err(library);
    libraries.set(libraryPath, library.unwrap());

    const deps = [...library.unwrap().uses.map(use => use.path)];
    graph.edges.push(...deps.map(dep => ({from: libraryPath, to: dep})));
    if (hasCycles(graph)) {
      // FIXME: output dependency cycle in error message
      return err({
        type: 'ParserError',
        line: library.unwrap().line,
        message: `${libraryPath} has dependency cycle`,
      });
    }

    libraryQueue.push(...deps);
  }

  return ok({
    type: 'ProgramAst',
    line: -1,
    libs: [...libraries.values()],
    entrypoint: entrypoint.unwrap(),
  });
}

private tokenizeAndParse<Type extends ModuleAst<any>>(path: string, tstr: Type['type']): Result<Type, AsmError> {
  const source = this.resolver.source(path);
  if (source.isErr()) {
    return err({
      type: 'BaseError',
      message: source.failure().message,
    });
  }
  if (source.unwrap().library && tstr == 'EntrypointAst') {
    return err({
      type: 'BaseError',
      message: `entrypoint cannot be library: ${path}`,
    });
  }
  if (!source.unwrap().library && tstr == 'LibraryAst') {
    return err({
      type: 'BaseError',
      message: `library cannot be entrypoint: ${path}`,
    });
  }

  const tokens = tokenize(source.unwrap().code);
  if (tokens.isErr()) return err(tokens);

  return new Parser(tokens.unwrap(), this.collectError).parse<Type>(path, tstr);
}
}