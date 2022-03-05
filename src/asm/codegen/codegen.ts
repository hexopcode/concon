import {Opcodes} from '../../core';
import {unreachable} from '../../lib';
import {AsmErrorCollector} from '../base';
import {AstImmExpr, AstLblExpr, BlockStmt, ProgramAst} from '../parser';
import {Program} from './program';
import {word} from './utilities';

const FAKE_ADDR: number[] = [0xFF, 0xFF];

export function codegen(ast: ProgramAst, collectError: AsmErrorCollector) {
  return new Codegen(ast, collectError).codegen();
}

class Codegen {
  private readonly ast: ProgramAst;
  private readonly collectError: AsmErrorCollector;
  private readonly program: Program;
  private readonly bytes: number[];

  constructor(ast: ProgramAst, collectError: AsmErrorCollector) {
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
    this.emitProcs();
    this.program.startAddr = this.bytes.length;

    this.emitOpcodes(this.ast.main);
    this.program.code = new Uint8Array(this.bytes);

    return this.program as Program;
  }

  private emitProcs() {
    for (const proc of this.ast.procs) {
      this.labelAddress(proc.name);
      this.emitOpcodes(proc.impl);
    }
  }

  private emitOpcodes(blk: BlockStmt) {
    for (const instr of blk.instrs) {
      if (instr.label) {
        this.labelAddress(instr.label!.label);
      }

      try {
        switch (instr.type) {
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
            if (instr.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.MOVI);
              this.bytes.push(instr.op1.value);
              this.bytes.push(...this.immExpr(instr.op2));
            } else {
              this.bytes.push(Opcodes.MOVR);
              this.bytes.push(instr.op1.value);
              this.bytes.push(instr.op2.value);
            }
            break;
          case 'StoInstr':
            if (instr.op1.type == 'AstImmExpr' && instr.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.STOI);
              this.bytes.push(...this.immExpr(instr.op1));
              this.bytes.push(...this.immExpr(instr.op2));
            } else if (instr.op1.type == 'AstRegExpr' && instr.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.STORI);
              this.bytes.push(instr.op1.value);
              this.bytes.push(...this.immExpr(instr.op2));
            } else if (instr.op1.type == 'AstImmExpr' && instr.op2.type == 'AstRegExpr') {
              this.bytes.push(Opcodes.STOR);
              this.bytes.push(...this.immExpr(instr.op1));
              this.bytes.push(instr.op2.value);
            } else if (instr.op1.type == 'AstRegExpr' && instr.op2.type == 'AstRegExpr') {
              this.bytes.push(Opcodes.STORR);
              this.bytes.push(instr.op1.value);
              this.bytes.push(instr.op2.value);
            }
            break;
          case 'StobInstr':
            if (instr.op1.type == 'AstImmExpr' && instr.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.STOIB);
              this.bytes.push(...this.immExpr(instr.op1));
              this.bytes.push(...this.immExpr(instr.op2));
            } else if (instr.op1.type == 'AstRegExpr' && instr.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.STORIB);
              this.bytes.push(instr.op1.value);
              this.bytes.push(...this.immExpr(instr.op2));
            } else if (instr.op1.type == 'AstImmExpr' && instr.op2.type == 'AstRegExpr') {
              this.bytes.push(Opcodes.STORB);
              this.bytes.push(...this.immExpr(instr.op1));
              this.bytes.push(instr.op2.value);
            } else if (instr.op1.type == 'AstRegExpr' && instr.op2.type == 'AstRegExpr') {
              this.bytes.push(Opcodes.STORRB);
              this.bytes.push(instr.op1.value);
              this.bytes.push(instr.op2.value);
            }
            break;
          case 'LodInstr':
            if (instr.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.LODR);
              this.bytes.push(instr.op1.value);
              this.bytes.push(...this.immExpr(instr.op2));
            } else {
              this.bytes.push(Opcodes.LODRR);
              this.bytes.push(instr.op1.value);
              this.bytes.push(instr.op2.value);
            }
            break;
          case 'LodbInstr':
            if (instr.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.LODRB);
              this.bytes.push(instr.op1.value);
              this.bytes.push(...this.immExpr(instr.op2));
            } else {
              this.bytes.push(Opcodes.LODRRB);
              this.bytes.push(instr.op1.value);
              this.bytes.push(instr.op2.value);
            }
            break;
          case 'AddInstr':
            if (instr.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.ADDI);
              this.bytes.push(instr.op1.value);
              this.bytes.push(...this.immExpr(instr.op2));
            } else {
              this.bytes.push(Opcodes.ADDR);
              this.bytes.push(instr.op1.value);
              this.bytes.push(instr.op2.value);
            }
            break;
          case 'SubInstr':
            if (instr.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.SUBI);
              this.bytes.push(instr.op1.value);
              this.bytes.push(...this.immExpr(instr.op2));
            } else {
              this.bytes.push(Opcodes.SUBR);
              this.bytes.push(instr.op1.value);
              this.bytes.push(instr.op2.value);
            }
            break;
          case 'MulInstr':
            if (instr.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.MULI);
              this.bytes.push(instr.op1.value);
              this.bytes.push(...this.immExpr(instr.op2));
            } else {
              this.bytes.push(Opcodes.MULR);
              this.bytes.push(instr.op1.value);
              this.bytes.push(instr.op2.value);
            }
            break;
          case 'DivInstr':
            if (instr.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.DIVI);
              this.bytes.push(instr.op1.value);
              this.bytes.push(...this.immExpr(instr.op2));
            } else {
              this.bytes.push(Opcodes.DIVR);
              this.bytes.push(instr.op1.value);
              this.bytes.push(instr.op2.value);
            }
            break;
          case 'ModInstr':
            if (instr.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.MODI);
              this.bytes.push(instr.op1.value);
              this.bytes.push(...this.immExpr(instr.op2));
            } else {
              this.bytes.push(Opcodes.MODR);
              this.bytes.push(instr.op1.value);
              this.bytes.push(instr.op2.value);
            }
            break;
          case 'IncInstr':
            this.bytes.push(Opcodes.INC);
            this.bytes.push(instr.op.value);
            break;
          case 'DecInstr':
            this.bytes.push(Opcodes.DEC);
            this.bytes.push(instr.op.value);
            break;
          case 'ShlInstr':
            if (instr.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.SHLI);
              this.bytes.push(instr.op1.value);
              this.bytes.push(...this.immExpr(instr.op2));
            } else {
              this.bytes.push(Opcodes.SHLR);
              this.bytes.push(instr.op1.value);
              this.bytes.push(instr.op2.value);
            }
            break;
          case 'ShrInstr':
            if (instr.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.SHRI);
              this.bytes.push(instr.op1.value);
              this.bytes.push(...this.immExpr(instr.op2));
            } else {
              this.bytes.push(Opcodes.SHRR);
              this.bytes.push(instr.op1.value);
              this.bytes.push(instr.op2.value);
            }
            break;
          case 'OrInstr':
            if (instr.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.ORI);
              this.bytes.push(instr.op1.value);
              this.bytes.push(...this.immExpr(instr.op2));
            } else {
              this.bytes.push(Opcodes.ORR);
              this.bytes.push(instr.op1.value);
              this.bytes.push(instr.op2.value);
            }
            break;
          case 'AndInstr':
            if (instr.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.ANDI);
              this.bytes.push(instr.op1.value);
              this.bytes.push(...this.immExpr(instr.op2));
            } else {
              this.bytes.push(Opcodes.ANDR);
              this.bytes.push(instr.op1.value);
              this.bytes.push(instr.op2.value);
            }
            break;
          case 'XorInstr':
            if (instr.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.XORI);
              this.bytes.push(instr.op1.value);
              this.bytes.push(...this.immExpr(instr.op2));
            } else {
              this.bytes.push(Opcodes.XORR);
              this.bytes.push(instr.op1.value);
              this.bytes.push(instr.op2.value);
            }
            break;
          case 'NotInstr':
            this.bytes.push(Opcodes.NOT);
            this.bytes.push(instr.op.value);
            break;
          case 'CmpInstr':
            if (instr.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.CMPI);
              this.bytes.push(instr.op1.value);
              this.bytes.push(...this.immExpr(instr.op2));
            } else {
              this.bytes.push(Opcodes.CMPR);
              this.bytes.push(instr.op1.value);
              this.bytes.push(instr.op2.value);
            }
            break;
          case 'JmpInstr':
            if (instr.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JMP);
              this.bytes.push(...this.immExpr(instr.op));
            } else {
              this.bytes.push(Opcodes.JMPR);
              this.bytes.push(instr.op.value);
            }
            break;
          case 'JzInstr':
            if (instr.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JZ);
              this.bytes.push(...this.immExpr(instr.op));
            } else {
              this.bytes.push(Opcodes.JZR);
              this.bytes.push(instr.op.value);
            }
            break;
          case 'JnzInstr':
            if (instr.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JNZ);
              this.bytes.push(...this.immExpr(instr.op));
            } else {
              this.bytes.push(Opcodes.JNZR);
              this.bytes.push(instr.op.value);
            }
            break;
          case 'JgInstr':
            if (instr.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JG);
              this.bytes.push(...this.immExpr(instr.op));
            } else {
              this.bytes.push(Opcodes.JGR);
              this.bytes.push(instr.op.value);
            }
            break;
          case 'JgzInstr':
            if (instr.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JGZ);
              this.bytes.push(...this.immExpr(instr.op));
            } else {
              this.bytes.push(Opcodes.JGZR);
              this.bytes.push(instr.op.value);
            }
            break;
          case 'JlInstr':
            if (instr.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JL);
              this.bytes.push(...this.immExpr(instr.op));
            } else {
              this.bytes.push(Opcodes.JLR);
              this.bytes.push(instr.op.value);
            }
            break;
          case 'JlzInstr':
            if (instr.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JLZ);
              this.bytes.push(...this.immExpr(instr.op));
            } else {
              this.bytes.push(Opcodes.JLZR);
              this.bytes.push(instr.op.value);
            }
            break;
          case 'JoInstr':
            if (instr.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JO);
              this.bytes.push(...this.immExpr(instr.op));
            } else {
              this.bytes.push(Opcodes.JOR);
              this.bytes.push(instr.op.value);
            }
            break;
          case 'JdzInstr':
            if (instr.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JDZ);
              this.bytes.push(...this.immExpr(instr.op));
            } else {
              this.bytes.push(Opcodes.JDZR);
              this.bytes.push(instr.op.value);
            }
            break;
          case 'PushInstr':
            if (instr.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.PUSHI);
              this.bytes.push(...this.immExpr(instr.op));
            } else {
              this.bytes.push(Opcodes.PUSHR);
              this.bytes.push(instr.op.value);
            }
            break;
          case 'PushAllInstr':
            this.bytes.push(Opcodes.PUSHALLR);
            break;
          case 'PopInstr':
            this.bytes.push(Opcodes.POPR);
            this.bytes.push(instr.op.value);
            break;
          case 'PopAllInstr':
            this.bytes.push(Opcodes.POPALLR);
            break;
          case 'CallInstr':
            this.bytes.push(Opcodes.CALL);
            this.bytes.push(...this.lblExpr(instr.op));
            break;
          case 'RetInstr':
            this.bytes.push(Opcodes.RET);
            break;
          case 'OutInstr':
            if (instr.op1.type == 'AstImmExpr' && instr.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.OUTII);
              this.bytes.push(...this.immExpr(instr.op1));
              this.bytes.push(...this.immExpr(instr.op2));
            } else if (instr.op1.type == 'AstImmExpr' && instr.op2.type == 'AstRegExpr') {
              this.bytes.push(Opcodes.OUTIR);
              this.bytes.push(...this.immExpr(instr.op1));
              this.bytes.push(instr.op2.value);
            } else if (instr.op1.type == 'AstRegExpr' && instr.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.OUTRI);
              this.bytes.push(instr.op1.value);
              this.bytes.push(...this.immExpr(instr.op2));
            } else if (instr.op1.type == 'AstRegExpr' && instr.op2.type == 'AstRegExpr') {
              this.bytes.push(Opcodes.OUTRR);
              this.bytes.push(instr.op1.value);
              this.bytes.push(instr.op2.value);
            }
            break;
          case 'OutbInstr':
            if (instr.op1.type == 'AstImmExpr' && instr.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.OUTIIB);
              this.bytes.push(...this.immExpr(instr.op1));
              this.bytes.push(...this.immExpr(instr.op2));
            } else if (instr.op1.type == 'AstImmExpr' && instr.op2.type == 'AstRegExpr') {
              this.bytes.push(Opcodes.OUTIRB);
              this.bytes.push(...this.immExpr(instr.op1));
              this.bytes.push(instr.op2.value);
            } else if (instr.op1.type == 'AstRegExpr' && instr.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.OUTRIB);
              this.bytes.push(instr.op1.value);
              this.bytes.push(...this.immExpr(instr.op2));
            } else if (instr.op1.type == 'AstRegExpr' && instr.op2.type == 'AstRegExpr') {
              this.bytes.push(Opcodes.OUTRRB);
              this.bytes.push(instr.op1.value);
              this.bytes.push(instr.op2.value);
            }
            break;
          case 'DataByte':
            for (const b of instr.bytes) {
              // FIXME: validate that the expressions reference actual bytes
              this.bytes.push(this.immExpr(b)[0]);
            }
            break;
          case 'DataWord':
            for (const w of instr.words) {
              this.bytes.push(...this.immExpr(w));
            }
            break;
          case 'DataStr':
            const joint = instr.strs.map(s => s.str).join(''); 
            const chars = joint.split('');
            const codes = chars.map(c => c.charCodeAt(0) & 0xFF);  // no time for Unicode
            const len = codes.length;
            this.bytes.push(...word(len));
            this.bytes.push(...codes);
            break;
          default:
            unreachable(`Unsupported instruction: ${JSON.stringify(instr)}`);
        }
      } catch (e) {
        this.collectError({
          line: instr.line,
          message: (e as Error).message,
        });
      }
    }
  }

  private immExpr(expr: AstImmExpr): number[] {
    this.program.codeExprs.set(this.bytes.length, expr);
    return FAKE_ADDR;
  }

  // FIXME: this should go into a transform/optimization pass before codegen
  private lblExpr(expr: AstLblExpr): number[] {
    const immExpr: AstImmExpr = {
      type: 'AstImmExpr',
      line: expr.line,
      value: expr.label,
    };
    return this.immExpr(immExpr);
  }

  private labelAddress(lbl: string) {
    // FIXME: this check should go in the checker instead
    if (this.program.labels.has(lbl)) {
      throw new Error(`Label '${lbl}' already declared earlier`);
    }

    this.program.labels.set(lbl, this.bytes.length);
  }
}