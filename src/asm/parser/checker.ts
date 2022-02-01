import {Registers} from '../../core';
import {AsmErrorCollector} from '../base';
import {Ast, Stmt} from './ast';

type SyntheticRegistersStmt = Stmt & {
  register?: Registers,
  register1?: Registers,
  register2?: Registers,
}

export function check(ast: Ast, collectErrors: AsmErrorCollector): Ast {
  return new Checker(ast, collectErrors).check();
}

class Checker {
  private readonly ast: Ast;
  private readonly collectErrors: AsmErrorCollector;

  constructor(ast: Ast, collectErrors: AsmErrorCollector) {
    this.ast = ast;
    this.collectErrors = collectErrors;
  }

  check(): Ast {
    for (const stmt of this.ast) {
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