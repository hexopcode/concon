import {Opcodes} from '../../core';
import {unreachable} from '../../lib';
import {AsmErrorCollector} from '../base';
import {AstImmExpr, Stmt} from '../parser';
import {Program} from './program';

const FAKE_ADDR: number[] = [0xFF, 0xFF];

export function codegen(ast: Stmt[], collectError: AsmErrorCollector) {
  return new Codegen(ast, collectError).codegen();
}

class Codegen {
  private readonly ast: Stmt[];
  private readonly collectError: AsmErrorCollector;
  private readonly program: Program;
  private readonly bytes: number[];

  constructor(ast: Stmt[], collectError: AsmErrorCollector) {
    this.ast = ast;
    this.collectError = collectError;
    this.program = {
      startAddr: 0,
      labels: new Map(),
      codeExprs: new Map(),
      code: new Uint8Array(),
    };
    this.bytes = [];
  }

  codegen(): Program {
    this.emitOpcodes();

    this.program.code = new Uint8Array(this.bytes);
    return this.program as Program;
  }

  private emitOpcodes() {
    for (const stmt of this.ast) {
      try {
        switch (stmt.type) {
          case 'NopInstr':
            this.bytes.push(Opcodes.NOP);
            break;
          case 'EndInstr':
            this.bytes.push(Opcodes.END);
            break;
          case 'VsyncInstr':
            this.bytes.push(Opcodes.VSYNC);
            break;
          case 'BrkInstr':
            this.bytes.push(Opcodes.BRK);
            break;
          case 'MovInstr':
            if (stmt.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.MOVI);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(...this.immExpr(stmt.op2));
            } else {
              this.bytes.push(Opcodes.MOVR);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(stmt.op2.value);
            }
            break;
          case 'StoInstr':
            if (stmt.op1.type == 'AstImmExpr' && stmt.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.STOI);
              this.bytes.push(...this.immExpr(stmt.op1));
              this.bytes.push(...this.immExpr(stmt.op2));
            } else if (stmt.op1.type == 'AstRegExpr' && stmt.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.STORI);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(...this.immExpr(stmt.op2));
            } else if (stmt.op1.type == 'AstImmExpr' && stmt.op2.type == 'AstRegExpr') {
              this.bytes.push(Opcodes.STOR);
              this.bytes.push(...this.immExpr(stmt.op1));
              this.bytes.push(stmt.op2.value);
            } else if (stmt.op1.type == 'AstRegExpr' && stmt.op2.type == 'AstRegExpr') {
              this.bytes.push(Opcodes.STORR);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(stmt.op2.value);
            }
            break;
          case 'StobInstr':
            if (stmt.op1.type == 'AstImmExpr' && stmt.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.STOIB);
              this.bytes.push(...this.immExpr(stmt.op1));
              this.bytes.push(...this.immExpr(stmt.op2));
            } else if (stmt.op1.type == 'AstRegExpr' && stmt.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.STORIB);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(...this.immExpr(stmt.op2));
            } else if (stmt.op1.type == 'AstImmExpr' && stmt.op2.type == 'AstRegExpr') {
              this.bytes.push(Opcodes.STORB);
              this.bytes.push(...this.immExpr(stmt.op1));
              this.bytes.push(stmt.op2.value);
            } else if (stmt.op1.type == 'AstRegExpr' && stmt.op2.type == 'AstRegExpr') {
              this.bytes.push(Opcodes.STORRB);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(stmt.op2.value);
            }
            break;
          case 'LodInstr':
            if (stmt.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.LODR);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(...this.immExpr(stmt.op2));
            } else {
              this.bytes.push(Opcodes.LODRR);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(stmt.op2.value);
            }
            break;
          case 'LodbInstr':
            if (stmt.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.LODRB);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(...this.immExpr(stmt.op2));
            } else {
              this.bytes.push(Opcodes.LODRRB);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(stmt.op2.value);
            }
            break;
          case 'AddInstr':
            if (stmt.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.ADDI);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(...this.immExpr(stmt.op2));
            } else {
              this.bytes.push(Opcodes.ADDR);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(stmt.op2.value);
            }
            break;
          case 'SubInstr':
            if (stmt.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.SUBI);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(...this.immExpr(stmt.op2));
            } else {
              this.bytes.push(Opcodes.SUBR);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(stmt.op2.value);
            }
            break;
          case 'MulInstr':
            if (stmt.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.MULI);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(...this.immExpr(stmt.op2));
            } else {
              this.bytes.push(Opcodes.MULR);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(stmt.op2.value);
            }
            break;
          case 'DivInstr':
            if (stmt.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.DIVI);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(...this.immExpr(stmt.op2));
            } else {
              this.bytes.push(Opcodes.DIVR);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(stmt.op2.value);
            }
            break;
          case 'ModInstr':
            if (stmt.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.MODI);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(...this.immExpr(stmt.op2));
            } else {
              this.bytes.push(Opcodes.MODR);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(stmt.op2.value);
            }
            break;
          case 'IncInstr':
            this.bytes.push(Opcodes.INC);
            this.bytes.push(stmt.op.value);
            break;
          case 'DecInstr':
            this.bytes.push(Opcodes.DEC);
            this.bytes.push(stmt.op.value);
            break;
          case 'ShlInstr':
            if (stmt.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.SHLI);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(...this.immExpr(stmt.op2));
            } else {
              this.bytes.push(Opcodes.SHLR);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(stmt.op2.value);
            }
            break;
          case 'ShrInstr':
            if (stmt.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.SHRI);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(...this.immExpr(stmt.op2));
            } else {
              this.bytes.push(Opcodes.SHRR);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(stmt.op2.value);
            }
            break;
          case 'OrInstr':
            if (stmt.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.ORI);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(...this.immExpr(stmt.op2));
            } else {
              this.bytes.push(Opcodes.ORR);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(stmt.op2.value);
            }
            break;
          case 'AndInstr':
            if (stmt.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.ANDI);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(...this.immExpr(stmt.op2));
            } else {
              this.bytes.push(Opcodes.ANDR);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(stmt.op2.value);
            }
            break;
          case 'XorInstr':
            if (stmt.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.XORI);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(...this.immExpr(stmt.op2));
            } else {
              this.bytes.push(Opcodes.XORR);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(stmt.op2.value);
            }
            break;
          case 'NotInstr':
            this.bytes.push(Opcodes.NOT);
            this.bytes.push(stmt.op.value);
            break;
          case 'CmpInstr':
            if (stmt.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.CMPI);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(...this.immExpr(stmt.op2));
            } else {
              this.bytes.push(Opcodes.CMPR);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(stmt.op2.value);
            }
            break;
          case 'JmpInstr':
            if (stmt.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JMP);
              this.bytes.push(...this.immExpr(stmt.op));
            } else {
              this.bytes.push(Opcodes.JMPR);
              this.bytes.push(stmt.op.value);
            }
            break;
          case 'JzInstr':
            if (stmt.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JZ);
              this.bytes.push(...this.immExpr(stmt.op));
            } else {
              this.bytes.push(Opcodes.JZR);
              this.bytes.push(stmt.op.value);
            }
            break;
          case 'JnzInstr':
            if (stmt.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JNZ);
              this.bytes.push(...this.immExpr(stmt.op));
            } else {
              this.bytes.push(Opcodes.JNZR);
              this.bytes.push(stmt.op.value);
            }
            break;
          case 'JgInstr':
            if (stmt.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JG);
              this.bytes.push(...this.immExpr(stmt.op));
            } else {
              this.bytes.push(Opcodes.JGR);
              this.bytes.push(stmt.op.value);
            }
            break;
          case 'JgzInstr':
            if (stmt.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JGZ);
              this.bytes.push(...this.immExpr(stmt.op));
            } else {
              this.bytes.push(Opcodes.JGZR);
              this.bytes.push(stmt.op.value);
            }
            break;
          case 'JlInstr':
            if (stmt.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JL);
              this.bytes.push(...this.immExpr(stmt.op));
            } else {
              this.bytes.push(Opcodes.JLR);
              this.bytes.push(stmt.op.value);
            }
            break;
          case 'JlzInstr':
            if (stmt.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JLZ);
              this.bytes.push(...this.immExpr(stmt.op));
            } else {
              this.bytes.push(Opcodes.JLZR);
              this.bytes.push(stmt.op.value);
            }
            break;
          case 'JoInstr':
            if (stmt.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JO);
              this.bytes.push(...this.immExpr(stmt.op));
            } else {
              this.bytes.push(Opcodes.JOR);
              this.bytes.push(stmt.op.value);
            }
            break;
          case 'JdzInstr':
            if (stmt.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JDZ);
              this.bytes.push(...this.immExpr(stmt.op));
            } else {
              this.bytes.push(Opcodes.JDZR);
              this.bytes.push(stmt.op.value);
            }
            break;
          case 'PushInstr':
            if (stmt.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.PUSHI);
              this.bytes.push(...this.immExpr(stmt.op));
            } else {
              this.bytes.push(Opcodes.PUSHR);
              this.bytes.push(stmt.op.value);
            }
            break;
          case 'PushAllInstr':
            this.bytes.push(Opcodes.PUSHALLR);
            break;
          case 'PopInstr':
            this.bytes.push(Opcodes.POPR);
            this.bytes.push(stmt.op.value);
            break;
          case 'PopAllInstr':
            this.bytes.push(Opcodes.POPALLR);
            break;
          case 'Label':
            this.labelAddress(stmt.label);
            break;
          default:
            unreachable(`Unsupported statement: ${stmt}`);
        }
      } catch (e) {
        this.collectError({
          line: stmt.line,
          message: (e as Error).message,
        });
      }
    }
  }

  private immExpr(expr: AstImmExpr): number[] {
    this.program.codeExprs.set(this.bytes.length, expr);
    return FAKE_ADDR;
  }

  private labelAddress(lbl: string) {
    // FIXME: this check should go in the checker instead
    if (this.program.labels.has(lbl)) {
      throw new Error(`Label '${lbl}' already declared earlier`);
    }

    this.program.labels.set(lbl, this.bytes.length);
  }
}