import {Token, TokenType} from './tokenizer';
import {
  AstRegExpr,
  AstLblExpr,
  AstImmExpr,
  AstImmOrRegExpr,
  Stmt,
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
  Label,
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
    const stmts: Stmt[] = [];

    while (!this.isAtEnd()) {
      this.whitespace();

      try {
        while (this.match(TokenType.PROC)) {
          procs.push(this.proc());
          this.whitespace();
        }
        
        stmts.push(this.statement());
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
      line: stmts.length > 0 ? stmts[0].line : 1,
      stmts,
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

    const stmts: Stmt[] = [];

    do {
      this.whitespace();
      
      stmts.push(this.statement());
      if (!this.isAtEnd()) {
        this.consume(TokenType.EOL, 'Expected end of line');
      }
      if (stmts.length > 0 && stmts[stmts.length - 1].type == 'RetInstr') {
        break;
      }

    } while (!this.isAtEnd());

    if (stmts.length == 0 || stmts[stmts.length - 1].type != 'RetInstr') {
      throw new Error(`Proc '${name}' must be terminated with 'ret' instruction`);
    }

    return {
      type: 'ProcStmt',
      line: this.line,
      name: name.literal!,
      impl: {
        type: 'BlockStmt',
        // FIXME: compute the correct first line of the block
        // once labels are part of an instruction
        line: this.line,
        stmts,
      },
    };
  }

  private statement(): Stmt {
    this.line = this.peek()?.line || -1;
    if (this.match(TokenType.NOP)) {
      return {
        type: 'NopInstr',
        line: this.line,
      };
    } else if (this.match(TokenType.END)) {
      return {
        type: 'EndInstr',
        line: this.line,
      };
    } else if (this.match(TokenType.VSYNC)) {
      return {
        type: 'VsyncInstr',
        line: this.line,
      };
    } else if (this.match(TokenType.BRK)) {
      return {
        type: 'BrkInstr',
        line: this.line,
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
    } else if (this.peek()?.type == TokenType.IDENTIFIER) {
      if (this.peek(1)?.type == TokenType.COLON) {
        this.advance();
        return this.label();
      }
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

  private movInstr(): MovInstr {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    
    return {
      type: 'MovInstr',
      line: this.line,
      op1,
      op2,
    };
  }

  private stoInstr(): StoInstr {
    const op1 = this.immOrRegExpr();
    this.comma();
    const op2 = this.immOrRegExpr();

    return {
      type: 'StoInstr',
      line: this.line,
      op1,
      op2,
    };
  }

  private stobInstr(): StobInstr {
    const op1 = this.immOrRegExpr();
    this.comma();
    const op2 = this.immOrRegExpr();

    return {
      type: 'StobInstr',
      line: this.line,
      op1,
      op2,
    };
  }

  private lodInstr(): LodInstr {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();

    return {
      type: 'LodInstr',
      line: this.line,
      op1,
      op2,
    };
  }

  private lodbInstr(): LodbInstr {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();

    return {
      type: 'LodbInstr',
      line: this.line,
      op1,
      op2,
    };
  }

  private addInstr(): AddInstr {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    
    return {
      type: 'AddInstr',
      line: this.line,
      op1,
      op2,
    };
  }

  private subInstr(): SubInstr {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    
    return {
      type: 'SubInstr',
      line: this.line,
      op1,
      op2,
    };
  }

  private mulInstr(): MulInstr {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    
    return {
      type: 'MulInstr',
      line: this.line,
      op1,
      op2,
    };
  }

  private divInstr(): DivInstr {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    
    return {
      type: 'DivInstr',
      line: this.line,
      op1,
      op2,
    };
  }

  private modInstr(): ModInstr {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    
    return {
      type: 'ModInstr',
      line: this.line,
      op1,
      op2,
    };
  }

  private incInstr(): IncInstr {
    return {
      type: 'IncInstr',
      line: this.line,
      op: this.regExpr(),
    };
  }

  private decInstr(): DecInstr {
    return {
      type: 'DecInstr',
      line: this.line,
      op: this.regExpr(),
    };
  }

  private shlInstr(): ShlInstr {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    
    return {
      type: 'ShlInstr',
      line: this.line,
      op1,
      op2,
    };
  }

  private shrInstr(): ShrInstr {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    
    return {
      type: 'ShrInstr',
      line: this.line,
      op1,
      op2,
    };
  }

  private orInstr(): OrInstr {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    
    return {
      type: 'OrInstr',
      line: this.line,
      op1,
      op2,
    };
  }

  private andInstr(): AndInstr {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    
    return {
      type: 'AndInstr',
      line: this.line,
      op1,
      op2,
    };
  }

  private xorInstr(): XorInstr {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    
    return {
      type: 'XorInstr',
      line: this.line,
      op1,
      op2,
    };
  }

  private notInstr(): NotInstr {
    return {
      type: 'NotInstr',
      line: this.line,
      op: this.regExpr(),
    };
  }

  private cmpInstr(): CmpInstr {
    const op1 = this.regExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    
    return {
      type: 'CmpInstr',
      line: this.line,
      op1,
      op2,
    };
  }

  private jmpInstr(): JmpInstr {
    return {
      type: 'JmpInstr',
      line: this.line,
      op: this.immOrRegExpr(),
    };
  }
  
  private jzInstr(): JzInstr {
    return {
      type: 'JzInstr',
      line: this.line,
      op: this.immOrRegExpr(),
    };
  }

  private jnzInstr(): JnzInstr {
    return {
      type: 'JnzInstr',
      line: this.line,
      op: this.immOrRegExpr(),
    };
  }

  private jgInstr(): JgInstr {
    return {
      type: 'JgInstr',
      line: this.line,
      op: this.immOrRegExpr(),
    };
  }

  private jgzInstr(): JgzInstr {
    return {
      type: 'JgzInstr',
      line: this.line,
      op: this.immOrRegExpr(),
    };
  }

  private jlInstr(): JlInstr {
    return {
      type: 'JlInstr',
      line: this.line,
      op: this.immOrRegExpr(),
    };
  }

  private jlzInstr(): JlzInstr {
    return {
      type: 'JlzInstr',
      line: this.line,
      op: this.immOrRegExpr(),
    };
  }

  private joInstr(): JoInstr {
    return {
      type: 'JoInstr',
      line: this.line,
      op: this.immOrRegExpr(),
    };
  }

  private jdzInstr(): JdzInstr {
    return {
      type: 'JdzInstr',
      line: this.line,
      op: this.immOrRegExpr(),
    };
  }

  private pushInstr(): PushInstr {
    return {
      type: 'PushInstr',
      line: this.line,
      op: this.immOrRegExpr(),
    };
  }

  private pushAllInstr(): PushAllInstr {
    return {
      type: 'PushAllInstr',
      line: this.line,
    };
  }

  private popInstr(): PopInstr {
    return {
      type: 'PopInstr',
      line: this.line,
      op: this.regExpr(),
    };
  }

  private popAllInstr(): PopAllInstr {
    return {
      type: 'PopAllInstr',
      line: this.line,
    };
  }

  private callInstr(): CallInstr {
    return {
      type: 'CallInstr',
      line: this.line,
      op: this.lblExpr(),
    };
  }

  private retInstr(): RetInstr {
    return {
      type: 'RetInstr',
      line: this.line,
    };
  }

  private outInstr(): OutInstr {
    const op1 = this.immOrRegExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    return {
      type: 'OutInstr',
      line: this.line,
      op1,
      op2,
    };
  }

  private outbInstr(): OutbInstr {
    const op1 = this.immOrRegExpr();
    this.comma();
    const op2 = this.immOrRegExpr();
    return {
      type: 'OutbInstr',
      line: this.line,
      op1,
      op2,
    };
  }

  private label(): Label {
    const lbl = this.previous();
    this.colon();
    return {
      type: 'Label',
      line: this.line,
      label: (lbl.literal!) as string,
    };
  }
}