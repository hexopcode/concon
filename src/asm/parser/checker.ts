import {Registers} from '../../core';
import {AsmErrorCollector} from '../base';
import {ProgramAst, Stmt} from './ast';

type SyntheticRegistersStmt = Stmt & {
  register?: Registers,
  register1?: Registers,
  register2?: Registers,
}

export function check(ast: ProgramAst, collectErrors: AsmErrorCollector): ProgramAst {
  return new Checker(ast, collectErrors).check();
}

class Checker {
  private readonly ast: ProgramAst;
  private readonly collectErrors: AsmErrorCollector;

  constructor(ast: ProgramAst, collectErrors: AsmErrorCollector) {
    this.ast = ast;
    this.collectErrors = collectErrors;
  }

  check(): ProgramAst {
    for (const stmt of this.ast.main.stmts) {
      this.checkRegistersAreValid(stmt as SyntheticRegistersStmt);
    }
    return this.ast;
  }

  private checkRegistersAreValid(synthStmt: SyntheticRegistersStmt) {
    this.checkRegisterIsValid(synthStmt.register||null, synthStmt.line);
    this.checkRegisterIsValid(synthStmt.register1||null, synthStmt.line);
    this.checkRegisterIsValid(synthStmt.register2||null, synthStmt.line);
  }

  private checkRegisterIsValid(reg: Registers|null, line: number) {
    if (reg == Registers.RIP || reg == Registers.RFL || reg == Registers.RIN) {
      this.collectErrors({
        line,
        message: `Cannot set value for register ${Registers[reg]}`
      });
    }
  }
}