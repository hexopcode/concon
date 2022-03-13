import {AsmError, ParserError} from './base';
import {SourceResolver} from '../lib/source';
import {codegen, DEFAULT_LINKER_OPTIONS, link, LinkerOptions} from './codegen';
import {prune, parseProgram} from './parser';
import {err, Result} from '../lib/types';

type ErrorLogger = (errors: AsmError[]) => void;

function logErrors(errors: AsmError[]) {
  if (errors.length > 0) {
    errors.forEach(asmError => {
      if (asmError.type == 'ParserError') {
        const err = asmError as ParserError;
        console.error(`Error at line ${err.line}: ${err.message}`);
      } else {
        console.error(`Error: ${asmError.message}`);
      }
    });
  }
}

export function assemble(resolver: SourceResolver, entrypoint: string, linkerOptions: LinkerOptions = DEFAULT_LINKER_OPTIONS): Result<Uint8Array, AsmError> {
  return new Assembler(resolver, linkerOptions, logErrors).assemble(entrypoint);
}

export function assembleCheck(resolver: SourceResolver, entrypoint: string, linkerOptions: LinkerOptions = DEFAULT_LINKER_OPTIONS): AsmError[] {
  const asm = new Assembler(resolver, linkerOptions);
  asm.assemble(entrypoint);
  return asm.errors;
}

class Assembler {
  private readonly resolver: SourceResolver;
  private readonly linkerOptions: LinkerOptions;
  private readonly errorLogger: ErrorLogger;
  readonly errors: AsmError[];

  constructor(resolver: SourceResolver, linkerOptions: LinkerOptions, errorLogger: ErrorLogger = () => {}) {
    this.resolver = resolver;
    this.linkerOptions = linkerOptions;
    this.errorLogger = errorLogger;
    this.errors = [];
  }

  assemble(entrypoint: string): Result<Uint8Array, AsmError> {
    const collector = this.collectErrors.bind(this);
    const ast = parseProgram(this.resolver, entrypoint, collector);
    if (ast.isErr()) {
      this.errorLogger([ast.failure(), ...this.errors]);
      return err(ast);
    }

    const pruned = prune(ast.unwrap());
    
    const program = codegen(pruned);
    if (program.isErr()) {
      this.errorLogger([program.failure(), ...this.errors]);
      return err(program);
    }

    const bytes = link(program.unwrap(), this.linkerOptions);
    if (bytes.isErr()) {
      this.errorLogger
      this.errorLogger([bytes.failure(), ...this.errors]);
      return err(program);
    }
    
    return bytes;
  }

  private collectErrors(...errors: AsmError[]): AsmError {
    this.errors.push(...errors);
    return errors[0];
  }
}