import {Token, TokenType} from './tokenizer';
import {
  AstRegExpr,
  AstLblExpr,
  AstImmExpr,
  AstImmOrRegExpr,
  AstInstrStmt,
  AstOneOpStmt,
  AstTwoOpStmt,
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
      return {type: 'NopInstr'};
    } else if (this.match(TokenType.END)) {
      return {type: 'EndInstr'};
    } else if (this.match(TokenType.VSYNC)) {
      return {type: 'VsyncInstr'};
    } else if (this.match(TokenType.BRK)) {
      return {type: 'BrkInstr'};
    } else if (this.match(TokenType.MOV)) {
      return this.regAndImmOrRegInstr<MovInstr>('MovInstr');
    } else if (this.match(TokenType.STO)) {
      return this.immOrRegAndImmOrRegInstr<StoInstr>('StoInstr');
    } else if (this.match(TokenType.STOB)) {
      return this.immOrRegAndImmOrRegInstr<StobInstr>('StobInstr');
    } else if (this.match(TokenType.LOD)) {
      return this.regAndImmOrRegInstr<LodInstr>('LodInstr');
    } else if (this.match(TokenType.LODB)) {
      return this.regAndImmOrRegInstr<LodbInstr>('LodbInstr');
    } else if (this.match(TokenType.ADD)) {
      return this.regAndImmOrRegInstr<AddInstr>('AddInstr');
    } else if (this.match(TokenType.SUB)) {
      return this.regAndImmOrRegInstr<SubInstr>('SubInstr');
    } else if (this.match(TokenType.MUL)) {
      return this.regAndImmOrRegInstr<MulInstr>('MulInstr');
    } else if (this.match(TokenType.DIV)) {
      return this.regAndImmOrRegInstr<DivInstr>('DivInstr');
    } else if (this.match(TokenType.MOD)) {
      return this.regAndImmOrRegInstr<ModInstr>('ModInstr');
    } else if (this.match(TokenType.INC)) {
      return this.regInstr<IncInstr>('IncInstr');
    } else if (this.match(TokenType.DEC)) {
      return this.regInstr<DecInstr>('DecInstr');
    } else if (this.match(TokenType.SHL)) {
      return this.regAndImmOrRegInstr<ShlInstr>('ShlInstr');
    } else if (this.match(TokenType.SHR)) {
      return this.regAndImmOrRegInstr<ShrInstr>('ShrInstr');
    } else if (this.match(TokenType.OR)) {
      return this.regAndImmOrRegInstr<OrInstr>('OrInstr');
    } else if (this.match(TokenType.AND)) {
      return this.regAndImmOrRegInstr<AndInstr>('AndInstr');
    } else if (this.match(TokenType.XOR)) {
      return this.regAndImmOrRegInstr<XorInstr>('XorInstr');
    } else if (this.match(TokenType.NOT)) {
      return this.regInstr<NotInstr>('NotInstr');
    } else if (this.match(TokenType.CMP)) {
      return this.regAndImmOrRegInstr<CmpInstr>('CmpInstr');
    } else if (this.match(TokenType.JMP)) {
      return this.immOrRegInstr<JmpInstr>('JmpInstr');
    } else if (this.match(TokenType.JZ)) {
      return this.immOrRegInstr<JzInstr>('JzInstr');
    } else if (this.match(TokenType.JNZ)) {
      return this.immOrRegInstr<JnzInstr>('JnzInstr');
    } else if (this.match(TokenType.JG)) {
      return this.immOrRegInstr<JgInstr>('JgInstr');
    } else if (this.match(TokenType.JGZ)) {
      return this.immOrRegInstr<JgzInstr>('JgzInstr');
    } else if (this.match(TokenType.JL)) {
      return this.immOrRegInstr<JlInstr>('JlInstr');
    } else if (this.match(TokenType.JLZ)) {
      return this.immOrRegInstr<JlzInstr>('JlzInstr');
    } else if (this.match(TokenType.JO)) {
      return this.immOrRegInstr<JoInstr>('JoInstr');
    } else if (this.match(TokenType.JDZ)) {
      return this.immOrRegInstr<JdzInstr>('JdzInstr');
    } else if (this.match(TokenType.PUSH)) {
      return this.immOrRegInstr<PushInstr>('PushInstr');
    } else if (this.match(TokenType.PUSHALL)) {
      return {type: 'PushAllInstr'};
    } else if (this.match(TokenType.POP)) {
      return this.immOrRegInstr<PopInstr>('PopInstr');
    } else if (this.match(TokenType.POPALL)) {
      return {type: 'PopAllInstr'};
    }else if (this.match(TokenType.CALL)) {
      return {
        type: 'CallInstr',
        op: this.lblExpr(),
      } as Omit<CallInstr, 'line'>;
    } else if (this.match(TokenType.RET)) {
      return {type: 'RetInstr'};
    } else if (this.match(TokenType.OUT)) {
      return this.immOrRegAndImmOrRegInstr<OutInstr>('OutInstr');
    } else if (this.match(TokenType.OUTB)) {
      return this.immOrRegAndImmOrRegInstr<OutbInstr>('OutbInstr');
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

  private regAndImmOrRegInstr<Type extends AstTwoOpStmt<any,any,any>>(tstr: Type['type']): Omit<Type, 'line'> {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    return {
      type: tstr,
      op1,
      op2,
    } as Type;
  }

  private immOrRegAndImmOrRegInstr<Type extends AstTwoOpStmt<any,any,any>>(tstr: Type['type']): Omit<Type, 'line'> {
    const op1 = this.immOrRegExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    return {
      type: tstr,
      op1,
      op2,
    } as Type;
  }

  private immOrRegInstr<Type extends AstOneOpStmt<any,any>>(tstr: Type['type']): Omit<Type, 'line'> {
    return {
      type: tstr,
      op: this.immOrRegExpr(),
    } as Type;
  }

  private regInstr<Type extends AstOneOpStmt<any,any>>(tstr: Type['type']): Omit<Type, 'line'> {
    return {
      type: tstr,
      op: this.regExpr(),
    } as Type;
  }
}