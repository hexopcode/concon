import {Token, TokenType} from './tokenizer';
import {
  AstRegExpr,
  AstLblExpr,
  AstImmExpr,
  AstImmOrRegExpr,
  Instr,
  MovInstr,
  LodInstr,
  LodbInstr,
  StoInstr,
  StobInstr,
  AddInstr,
  SubInstr,
  MulInstr,
  DivInstr,
  ModInstr,
  IncInstr,
  DecInstr,
  ShlInstr,
  ShrInstr,
  OrInstr,
  AndInstr,
  XorInstr,
  NotInstr,
  CmpInstr,
  JmpInstr,
  JzInstr,
  JnzInstr,
  JgInstr,
  JgzInstr,
  JlInstr,
  JlzInstr,
  JoInstr,
  JdzInstr,
  PushInstr,
  PushAllInstr,
  PopInstr,
  PopAllInstr,
  CallInstr,
  RetInstr,
  ProgramAst,
  ProcStmt,
  BlockStmt,
  OutInstr,
  OutbInstr,
} from './ast';
import {Registers} from '../../core';
import {unreachable} from '../../lib';
import {AsmErrorCollector} from '../base';

export function parse(tokens: Token[], collectError: AsmErrorCollector): ProgramAst {
  return new Parser(tokens, collectError).parse();
}

class Parser {
  private readonly tokens: Token[];
  private readonly collectError: AsmErrorCollector;
  private current: number;
  private line: number;

  constructor(tokens: Token[], collectError: AsmErrorCollector) {
    this.tokens = tokens;
    this.collectError = collectError;
    this.current = 0;
    this.line = 1;
  }

  parse(): ProgramAst {
    const procs: ProcStmt[] = [];
    const instrs: Instr[] = [];

    while (!this.isAtEnd()) {
      this.whitespace();

      try {
        while (this.match(TokenType.PROC)) {
          procs.push(this.proc());
          this.whitespace();
        }
        
        instrs.push(this.instr());
        if (!this.isAtEnd()) {
          this.consume(TokenType.EOL, 'Expected end of line');
        }
      } catch (e) {
        this.collectError({
          line: 0,
          message: (e as Error).message,
        });
        this.synchronize();
      }
    }

    const main: BlockStmt = {
      type: 'BlockStmt',
      line: instrs.length > 0 ? instrs[0].line : 1,
      instrs,
    };

    return {
      type: 'ProgramAst',
      line: 1,
      procs,
      main,
    };
  }

  private isAtEnd(): boolean {
    return !this.peek() || this.peek()!.type == TokenType.EOF;
  }

  private peek(seek: number = 0): Token | undefined {
    return this.tokens[this.current + seek];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd() && type != TokenType.EOF) {
      return false;
    }
    return this.peek()!.type == type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.previous();
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }
    throw new Error(`Invalid token: ${TokenType[this.peek()!.type]}. ${message}`);
  }

  private synchronize() {
    while (!this.match(TokenType.EOL, TokenType.EOF)) {
      this.advance();
    }
  }

  private whitespace() {
    // skip non-significant EOL (e.g., empty lines)
    while (this.match(TokenType.EOL));
  }

  private proc(): ProcStmt {
    this.line = this.peek()?.line || -1;
    const name = this.consume(TokenType.IDENTIFIER, 'Expected identifier');
    this.consume(TokenType.COLON, `Expected ':'`);
    this.consume(TokenType.EOL, 'Expected end of line');

    const instrs: Instr[] = [];

    do {
      this.whitespace();
      
      instrs.push(this.instr());
      if (!this.isAtEnd()) {
        this.consume(TokenType.EOL, 'Expected end of line');
      }
      if (instrs.length > 0 && instrs[instrs.length - 1].type == 'RetInstr') {
        break;
      }

    } while (!this.isAtEnd());

    if (instrs.length == 0 || instrs[instrs.length - 1].type != 'RetInstr') {
      throw new Error(`Proc '${name}' must be terminated with 'ret' instruction`);
    }

    return {
      type: 'ProcStmt',
      line: this.line,
      name: name.literal!,
      impl: {
        type: 'BlockStmt',
        line: instrs[0].line,
        instrs,
      },
    };
  }

  private instr(): Instr {
    let lblExpr: AstLblExpr|undefined = undefined;
    if (this.peek()?.type == TokenType.IDENTIFIER && this.peek(1)?.type == TokenType.COLON) {
      const lbl = this.consume(TokenType.IDENTIFIER, 'Expected IDENTIFIER');
      this.colon();
      lblExpr = {
        type: 'AstLblExpr',
        line: this.line,
        label: (lbl.literal!) as string,
      }
      this.whitespace();
    }

    const line = this.line; 
    const instr = this.partialInstr() as Instr;
    instr.label = lblExpr;
    instr.line = line;
    return instr;
  }

  private partialInstr(): Omit<Instr, 'line'> {
    this.line = this.peek()?.line || -1;
    if (this.match(TokenType.NOP)) {
      return {
        type: 'NopInstr',
      };
    } else if (this.match(TokenType.END)) {
      return {
        type: 'EndInstr',
      };
    } else if (this.match(TokenType.VSYNC)) {
      return {
        type: 'VsyncInstr',
      };
    } else if (this.match(TokenType.BRK)) {
      return {
        type: 'BrkInstr',
      };
    } else if (this.match(TokenType.MOV)) {
      return this.movInstr();
    } else if (this.match(TokenType.STO)) {
      return this.stoInstr();
    } else if (this.match(TokenType.STOB)) {
      return this.stobInstr();
    } else if (this.match(TokenType.LOD)) {
      return this.lodInstr();
    } else if (this.match(TokenType.LODB)) {
      return this.lodbInstr();
    } else if (this.match(TokenType.ADD)) {
      return this.addInstr();
    } else if (this.match(TokenType.SUB)) {
      return this.subInstr();
    } else if (this.match(TokenType.MUL)) {
      return this.mulInstr();
    } else if (this.match(TokenType.DIV)) {
      return this.divInstr();
    } else if (this.match(TokenType.MOD)) {
      return this.modInstr();
    } else if (this.match(TokenType.INC)) {
      return this.incInstr();
    } else if (this.match(TokenType.DEC)) {
      return this.decInstr();
    } else if (this.match(TokenType.SHL)) {
      return this.shlInstr();
    } else if (this.match(TokenType.SHR)) {
      return this.shrInstr();
    } else if (this.match(TokenType.OR)) {
      return this.orInstr();
    } else if (this.match(TokenType.AND)) {
      return this.andInstr();
    } else if (this.match(TokenType.XOR)) {
      return this.xorInstr();
    } else if (this.match(TokenType.NOT)) {
      return this.notInstr();
    } else if (this.match(TokenType.CMP)) {
      return this.cmpInstr();
    } else if (this.match(TokenType.JMP)) {
      return this.jmpInstr();
    } else if (this.match(TokenType.JZ)) {
      return this.jzInstr();
    } else if (this.match(TokenType.JNZ)) {
      return this.jnzInstr();
    } else if (this.match(TokenType.JG)) {
      return this.jgInstr();
    } else if (this.match(TokenType.JGZ)) {
      return this.jgzInstr();
    } else if (this.match(TokenType.JL)) {
      return this.jlInstr();
    } else if (this.match(TokenType.JLZ)) {
      return this.jlzInstr();
    } else if (this.match(TokenType.JO)) {
      return this.joInstr();
    } else if (this.match(TokenType.JDZ)) {
      return this.jdzInstr();
    } else if (this.match(TokenType.PUSH)) {
      return this.pushInstr();
    } else if (this.match(TokenType.PUSHALL)) {
      return this.pushAllInstr();
    } else if (this.match(TokenType.POP)) {
      return this.popInstr();
    } else if (this.match(TokenType.POPALL)) {
      return this.popAllInstr();
    }else if (this.match(TokenType.CALL)) {
      return this.callInstr();
    } else if (this.match(TokenType.RET)) {
      return this.retInstr();
    } else if (this.match(TokenType.OUT)) {
      return this.outInstr();
    } else if (this.match(TokenType.OUTB)) {
      return this.outbInstr();
    }
    unreachable(`Invalid token: ${this.peek()?.lexeme}`);
  }

  private reg(): Token {
    return this.consume(TokenType.REGISTER, 'Expected register');
  }

  private regExpr(): AstRegExpr {
    const reg = this.reg();
    return {
      type: 'AstRegExpr',
      line: this.line,
      value: reg.literal! as Registers,
    };
  }

  private immExpr(): AstImmExpr {
    // FIXME: needs better checks for immediate expressions
    const value = this.check(TokenType.NUMBER) ?
        this.consume(TokenType.NUMBER, 'Expected NUMBER') :
        this.consume(TokenType.IDENTIFIER, 'Expected IDENTIFIER');

    return {
      type: 'AstImmExpr',
      line: this.line,
      value: value.literal!,
    };
  }

  private lblExpr(): AstLblExpr {
    const name = this.consume(TokenType.IDENTIFIER, 'expected identifier');
    return {
      type: 'AstLblExpr',
      line: this.line,
      label: (name.literal!) as string,
    };
  }

  private immOrRegExpr(): AstImmOrRegExpr {
    if (this.check(TokenType.REGISTER)) {
      return this.regExpr();
    }
    return this.immExpr();
  }

  private comma() {
    this.consume(TokenType.COMMA, `'Expected ','`);
  }

  private colon() {
    this.consume(TokenType.COLON, `Expected ':'`);
  }

  private movInstr(): Omit<MovInstr, 'line'> {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    
    return {
      type: 'MovInstr',
      op1,
      op2,
    };
  }

  private stoInstr(): Omit<StoInstr, 'line'> {
    const op1 = this.immOrRegExpr();
    this.comma();
    const op2 = this.immOrRegExpr();

    return {
      type: 'StoInstr',
      op1,
      op2,
    };
  }

  private stobInstr(): Omit<StobInstr, 'line'> {
    const op1 = this.immOrRegExpr();
    this.comma();
    const op2 = this.immOrRegExpr();

    return {
      type: 'StobInstr',
      op1,
      op2,
    };
  }

  private lodInstr(): Omit<LodInstr, 'line'> {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();

    return {
      type: 'LodInstr',
      op1,
      op2,
    };
  }

  private lodbInstr(): Omit<LodbInstr, 'line'> {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();

    return {
      type: 'LodbInstr',
      op1,
      op2,
    };
  }

  private addInstr(): Omit<AddInstr, 'line'> {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    
    return {
      type: 'AddInstr',
      op1,
      op2,
    };
  }

  private subInstr(): Omit<SubInstr, 'line'> {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    
    return {
      type: 'SubInstr',
      op1,
      op2,
    };
  }

  private mulInstr(): Omit<MulInstr, 'line'> {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    
    return {
      type: 'MulInstr',
      op1,
      op2,
    };
  }

  private divInstr(): Omit<DivInstr, 'line'> {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    
    return {
      type: 'DivInstr',
      op1,
      op2,
    };
  }

  private modInstr(): Omit<ModInstr, 'line'> {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    
    return {
      type: 'ModInstr',
      op1,
      op2,
    };
  }

  private incInstr(): Omit<IncInstr, 'line'> {
    return {
      type: 'IncInstr',
      op: this.regExpr(),
    };
  }

  private decInstr(): Omit<DecInstr, 'line'> {
    return {
      type: 'DecInstr',
      op: this.regExpr(),
    };
  }

  private shlInstr(): Omit<ShlInstr, 'line'> {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    
    return {
      type: 'ShlInstr',
      op1,
      op2,
    };
  }

  private shrInstr(): Omit<ShrInstr, 'line'> {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    
    return {
      type: 'ShrInstr',
      op1,
      op2,
    };
  }

  private orInstr(): Omit<OrInstr, 'line'> {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    
    return {
      type: 'OrInstr',
      op1,
      op2,
    };
  }

  private andInstr(): Omit<AndInstr, 'line'> {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    
    return {
      type: 'AndInstr',
      op1,
      op2,
    };
  }

  private xorInstr(): Omit<XorInstr, 'line'> {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    
    return {
      type: 'XorInstr',
      op1,
      op2,
    };
  }

  private notInstr(): Omit<NotInstr, 'line'> {
    return {
      type: 'NotInstr',
      op: this.regExpr(),
    };
  }

  private cmpInstr(): Omit<CmpInstr, 'line'> {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    
    return {
      type: 'CmpInstr',
      op1,
      op2,
    };
  }

  private jmpInstr(): Omit<JmpInstr, 'line'> {
    return {
      type: 'JmpInstr',
      op: this.immOrRegExpr(),
    };
  }
  
  private jzInstr(): Omit<JzInstr, 'line'> {
    return {
      type: 'JzInstr',
      op: this.immOrRegExpr(),
    };
  }

  private jnzInstr(): Omit<JnzInstr, 'line'> {
    return {
      type: 'JnzInstr',
      op: this.immOrRegExpr(),
    };
  }

  private jgInstr(): Omit<JgInstr, 'line'> {
    return {
      type: 'JgInstr',
      op: this.immOrRegExpr(),
    };
  }

  private jgzInstr(): Omit<JgzInstr, 'line'> {
    return {
      type: 'JgzInstr',
      op: this.immOrRegExpr(),
    };
  }

  private jlInstr(): Omit<JlInstr, 'line'> {
    return {
      type: 'JlInstr',
      op: this.immOrRegExpr(),
    };
  }

  private jlzInstr(): Omit<JlzInstr, 'line'> {
    return {
      type: 'JlzInstr',
      op: this.immOrRegExpr(),
    };
  }

  private joInstr(): Omit<JoInstr, 'line'> {
    return {
      type: 'JoInstr',
      op: this.immOrRegExpr(),
    };
  }

  private jdzInstr(): Omit<JdzInstr, 'line'> {
    return {
      type: 'JdzInstr',
      op: this.immOrRegExpr(),
    };
  }

  private pushInstr(): Omit<PushInstr, 'line'> {
    return {
      type: 'PushInstr',
      op: this.immOrRegExpr(),
    };
  }

  private pushAllInstr(): Omit<PushAllInstr, 'line'> {
    return {
      type: 'PushAllInstr',
      };
  }

  private popInstr(): Omit<PopInstr, 'line'> {
    return {
      type: 'PopInstr',
      op: this.regExpr(),
    };
  }

  private popAllInstr(): Omit<PopAllInstr, 'line'> {
    return {
      type: 'PopAllInstr',
      };
  }

  private callInstr(): Omit<CallInstr, 'line'> {
    return {
      type: 'CallInstr',
      op: this.lblExpr(),
    };
  }

  private retInstr(): Omit<RetInstr, 'line'> {
    return {
      type: 'RetInstr',
      };
  }

  private outInstr(): Omit<OutInstr, 'line'> {
    const op1 = this.immOrRegExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    return {
      type: 'OutInstr',
      op1,
      op2,
    };
  }

  private outbInstr(): Omit<OutbInstr, 'line'> {
    const op1 = this.immOrRegExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    return {
      type: 'OutbInstr',
      op1,
      op2,
    };
  }
}