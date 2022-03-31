import {err, ok, Result} from '../../lib/types';
import {CodegenError} from '../base';
import {CodegenModule} from './module';
import {ProgramAst} from '../parser';
import {Module, EntrypointModule, Program} from './types';

export function codegen(ast: ProgramAst) {
  return new CodegenProgram(ast).codegen();
}

class CodegenProgram {
  private readonly ast: ProgramAst;

  constructor(ast: ProgramAst) {
    this.ast = ast;
  }

  codegen(): Result<Program, CodegenError> {
    const libs: Map<string, Module> = new Map();

    for (const ast of this.ast.libs) {
      const code = new CodegenModule(ast).codegen();
      if (code.isErr()) return err(code);

      libs.set(ast.path, code.unwrap());
    }

    const entrypoint = new CodegenModule(this.ast.entrypoint).codegen() as Result<EntrypointModule, CodegenError>;
    if (entrypoint.isErr()) return err(entrypoint);

    return ok({libs, entrypoint: entrypoint.unwrap()});
  }
}