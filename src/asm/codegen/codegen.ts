import {MEMORY_PROGRAM_OFFSET, Opcodes, Registers} from '../../core';
import {unreachable} from '../../lib';
import {AsmErrorCollector} from '../base';
import {Address, AstRegExpr, Stmt} from '../parser';

const FAKE_ADDR: number[] = [0xFF, 0xFF];

type AddressRef = {
  address?: number,
  references: number[],
};

export function codegen(ast: Stmt[], collectError: AsmErrorCollector) {
  return new Codegen(ast, collectError).codegen();
}

class Codegen {
  private readonly ast: Stmt[];
  private readonly collectError: AsmErrorCollector;
  private readonly bytes: number[];
  private readonly addressRefs: Map<string, AddressRef>; 

  constructor(ast: Stmt[], collectError: AsmErrorCollector) {
    this.ast = ast;
    this.collectError = collectError;
    this.bytes = [];
    this.addressRefs = new Map();
  }

  codegen(): Uint8Array {
    this.emitOpcodes();
    this.patchAddresses();

    return new Uint8Array(this.bytes);
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
              this.bytes.push(...this.address(stmt.op2.value));
            } else {
              this.bytes.push(Opcodes.MOVR);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(stmt.op2.value);
            }
            break;
          case 'StoiInstr':
            this.bytes.push(Opcodes.STOI);
            this.bytes.push(...this.address(stmt.address));
            this.bytes.push(...this.word(stmt.immediate));
            break;
          case 'StoibInstr':
            this.bytes.push(Opcodes.STOIB);
            this.bytes.push(...this.address(stmt.address));
            this.bytes.push(...this.word(stmt.immediate));
            break;
          case 'StoriInstr':
            this.bytes.push(Opcodes.STORI);
            this.bytes.push(stmt.register);
            this.bytes.push(...this.word(stmt.immediate));
            break;
          case 'StoribInstr':
            this.bytes.push(Opcodes.STORIB);
            this.bytes.push(stmt.register);
            this.bytes.push(...this.word(stmt.immediate));
            break;
          case 'StorInstr':
            this.bytes.push(Opcodes.STOR);
            this.bytes.push(...this.address(stmt.address));
            this.bytes.push(stmt.register);
            break;
          case 'StorbInstr':
            this.bytes.push(Opcodes.STORB);
            this.bytes.push(...this.address(stmt.address));
            this.bytes.push(stmt.register);
            break;
          case 'StorrInstr':
            this.bytes.push(Opcodes.STORR);
            this.bytes.push(stmt.register1);
            this.bytes.push(stmt.register2);
            break;
          case 'StorrbInstr':
            this.bytes.push(Opcodes.STORRB);
            this.bytes.push(stmt.register1);
            this.bytes.push(stmt.register2);
            break;
          case 'LodrInstr':
            this.bytes.push(Opcodes.LODR);
            this.bytes.push(stmt.register);
            this.bytes.push(...this.address(stmt.address));
            break;
          case 'LodrbInstr':
            this.bytes.push(Opcodes.LODRB);
            this.bytes.push(stmt.register);
            this.bytes.push(...this.address(stmt.address));
            break;
          case 'LodrrInstr':
            this.bytes.push(Opcodes.LODRR);
            this.bytes.push(stmt.register1);
            this.bytes.push(stmt.register2);
            break;
          case 'LodrrbInstr':
            this.bytes.push(Opcodes.LODRRB);
            this.bytes.push(stmt.register1);
            this.bytes.push(stmt.register2);
            break;
          case 'AddInstr':
            if (stmt.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.ADDI);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(...this.address(stmt.op2.value));
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
              this.bytes.push(...this.address(stmt.op2.value));
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
              this.bytes.push(...this.address(stmt.op2.value));
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
              this.bytes.push(...this.address(stmt.op2.value));
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
              this.bytes.push(...this.address(stmt.op2.value));
            } else {
              this.bytes.push(Opcodes.MODR);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(stmt.op2.value);
            }
            break;
          case 'IncInstr':
            this.bytes.push(Opcodes.INC);
            this.bytes.push(stmt.register);
            break;
          case 'DecInstr':
            this.bytes.push(Opcodes.DEC);
            this.bytes.push(stmt.register);
            break;
          case 'ShlInstr':
            if (stmt.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.SHLI);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(...this.address(stmt.op2.value));
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
              this.bytes.push(...this.address(stmt.op2.value));
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
              this.bytes.push(...this.address(stmt.op2.value));
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
              this.bytes.push(...this.address(stmt.op2.value));
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
              this.bytes.push(...this.address(stmt.op2.value));
            } else {
              this.bytes.push(Opcodes.XORR);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(stmt.op2.value);
            }
            break;
          case 'NotInstr':
            this.bytes.push(Opcodes.NOT);
            this.bytes.push(stmt.register);
            break;
          case 'CmpInstr':
            if (stmt.op2.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.CMPI);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(...this.address(stmt.op2.value));
            } else {
              this.bytes.push(Opcodes.CMPR);
              this.bytes.push(stmt.op1.value);
              this.bytes.push(stmt.op2.value);
            }
            break;
          case 'JmpInstr':
            if (stmt.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JMP);
              this.bytes.push(...this.address(stmt.op.value));
            } else {
              this.bytes.push(Opcodes.JMPR);
              this.bytes.push(stmt.op.value);  
            }
            break;
          case 'JzInstr':
            if (stmt.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JZ);
              this.bytes.push(...this.address(stmt.op.value));
            } else {
              this.bytes.push(Opcodes.JZR);
              this.bytes.push(stmt.op.value);  
            }
            break;
          case 'JnzInstr':
            if (stmt.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JNZ);
              this.bytes.push(...this.address(stmt.op.value));
            } else {
              this.bytes.push(Opcodes.JNZR);
              this.bytes.push(stmt.op.value);  
            }
            break;
          case 'JgInstr':
            if (stmt.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JG);
              this.bytes.push(...this.address(stmt.op.value));
            } else {
              this.bytes.push(Opcodes.JGR);
              this.bytes.push(stmt.op.value);  
            }
            break;
          case 'JgzInstr':
            if (stmt.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JGZ);
              this.bytes.push(...this.address(stmt.op.value));
            } else {
              this.bytes.push(Opcodes.JGZR);
              this.bytes.push(stmt.op.value);  
            }
            break;
          case 'JlInstr':
            if (stmt.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JL);
              this.bytes.push(...this.address(stmt.op.value));
            } else {
              this.bytes.push(Opcodes.JLR);
              this.bytes.push(stmt.op.value);  
            }
            break;
          case 'JlzInstr':
            if (stmt.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JLZ);
              this.bytes.push(...this.address(stmt.op.value));
            } else {
              this.bytes.push(Opcodes.JLZR);
              this.bytes.push(stmt.op.value);  
            }
            break;
          case 'JoInstr':
            if (stmt.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JO);
              this.bytes.push(...this.address(stmt.op.value));
            } else {
              this.bytes.push(Opcodes.JOR);
              this.bytes.push(stmt.op.value);  
            }
            break;
          case 'JdzInstr':
            if (stmt.op.type == 'AstImmExpr') {
              this.bytes.push(Opcodes.JDZ);
              this.bytes.push(...this.address(stmt.op.value));
            } else {
              this.bytes.push(Opcodes.JDZR);
              this.bytes.push(stmt.op.value);  
            }
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

  private word(n: number): number[] {
    return [n >> 8, n & 0xff];
  }

  // FIXME: make this work with expressions instead
  private address(addr: Address): number[] {
    if (typeof addr == 'number') {
      return this.word(addr);
    }

    if (!this.addressRefs.has(addr)) {
      this.createAddressRef(addr);
    }
    this.addressRefs.get(addr)!.references.push(this.bytes.length);

    return FAKE_ADDR;
  }

  private labelAddress(lbl: string) {
    if (!this.addressRefs.has(lbl)) {
      this.createAddressRef(lbl);
    }

    // FIXME: this check should go in the checker instead
    if (this.addressRefs.get(lbl)?.address != undefined) {
      throw new Error(`Label '${lbl}' already declared earlier`);
    }

    this.addressRefs.get(lbl)!.address = this.bytes.length;
  }

  private createAddressRef(lbl: string) {
    this.addressRefs.set(lbl, {
      references: [],
    });
  }

  private patchAddresses() {
    for (const [lbl, addr] of this.addressRefs.entries()) {
      if (addr.address == undefined) {
        throw new Error(`Cannot resolve label '${lbl}'`);
      }

      const absolute = MEMORY_PROGRAM_OFFSET + addr.address;
      const hi = absolute >> 8;
      const lo = absolute & 0xFF;

      for (const ref of addr.references) {
        this.bytes[ref] = hi;
        this.bytes[ref + 1] = lo;
      }
    }
  }
}