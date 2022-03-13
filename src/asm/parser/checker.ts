import {Registers} from '../../core';
import {AsmErrorCollector} from '../base';
import {ProgramAst, Instr} from './ast';

type SyntheticRegistersInstr = Instr & {
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
    for (const instr of this.ast.entrypoint.main.instrs) {
      this.checkRegistersAreValid(instr as SyntheticRegistersInstr);
    }
    return this.ast;
  }

  private checkRegistersAreValid(synthInstr: SyntheticRegistersInstr) {
    this.checkRegisterIsValid(synthInstr.register||null, synthInstr.line);
    this.checkRegisterIsValid(synthInstr.register1||null, synthInstr.line);
    this.checkRegisterIsValid(synthInstr.register2||null, synthInstr.line);
  }

  private checkRegisterIsValid(reg: Registers|null, line: number) {
    if (reg == Registers.RIP || reg == Registers.RFL || reg == Registers.RIN) {
      this.collectErrors({
        type: 'ParserError',
        line,
        message: `Cannot set value for register ${Registers[reg]}`
      });
    }
  }
}