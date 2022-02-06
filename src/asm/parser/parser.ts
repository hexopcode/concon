import {Token, TokenType} from './tokenizer';
import {
  Ast,
  Address,
  Stmt,
  MoviInstr,
  MovrInstr,
  LodrInstr,
  LodrbInstr,
  LodrrInstr,
  LodrrbInstr,
  StoiInstr,
  StoibInstr,
  StoriInstr,
  StoribInstr,
  StorInstr,
  StorbInstr,
  StorrInstr,
  StorrbInstr,
  AddiInstr,
  AddrInstr,
  SubiInstr,
  SubrInstr,
  MuliInstr,
  MulrInstr,
  DiviInstr,
  DivrInstr,
  ModiInstr,
  ModrInstr,
  IncInstr,
  DecInstr,
  ShliInstr,
  ShlrInstr,
  ShriInstr,
  ShrrInstr,
  OriInstr,
  OrrInstr,
  AndiInstr,
  AndrInstr,
  XoriInstr,
  XorrInstr,
  NotInstr,
  CmpiInstr,
  CmprInstr,
  JmpInstr,
  JmprInstr,
  JzInstr,
  JzrInstr,
  JnzInstr,
  JnzrInstr,
  JgInstr,
  JgrInstr,
  JgzInstr,
  JgzrInstr,
  JlInstr,
  JlrInstr,
  JlzInstr,
  JlzrInstr,
  JoInstr,
  JorInstr,
  JdzInstr,
  JdzrInstr,
  Label,
} from './ast';
import {Registers} from '../../core';
import {unreachable} from '../../lib';
import {AsmErrorCollector} from '../base';

export function parse(tokens: Token[], collectError: AsmErrorCollector): Ast {
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

  parse(): Ast {
    const statements: Stmt[] = [];
    while (!this.isAtEnd()) {
      // skip non-significant EOL (e.g., empty lines)
      while (this.match(TokenType.EOL));

      try {
        statements.push(this.statement());
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
    return statements;
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
    } else if (this.match(TokenType.MOVI)) {
      return this.moviInstr();
    } else if (this.match(TokenType.MOVR)) {
      return this.movrInstr();
    } else if (this.match(TokenType.STOI)) {
      return this.stoiInstr();
    } else if (this.match(TokenType.STOIB)) {
      return this.stoibInstr();
    } else if (this.match(TokenType.STORI)) {
      return this.storiInstr();
    } else if (this.match(TokenType.STORIB)) {
      return this.storibInstr();
    } else if (this.match(TokenType.STOR)) {
      return this.storInstr();
    } else if (this.match(TokenType.STORB)) {
      return this.storbInstr();
    } else if (this.match(TokenType.STORR)) {
      return this.storrInstr();
    } else if (this.match(TokenType.STORRB)) {
      return this.storrbInstr();
    } else if (this.match(TokenType.LODR)) {
      return this.lodrInstr();
    } else if (this.match(TokenType.LODRB)) {
      return this.lodrbInstr();
    } else if (this.match(TokenType.LODRR)) {
      return this.lodrrInstr();
    } else if (this.match(TokenType.LODRRB)) {
      return this.lodrrbInstr();
    } else if (this.match(TokenType.ADDI)) {
      return this.addiInstr();
    } else if (this.match(TokenType.ADDR)) {
      return this.addrInstr();
    } else if (this.match(TokenType.SUBI)) {
      return this.subiInstr();
    } else if (this.match(TokenType.SUBR)) {
      return this.subrInstr();
    } else if (this.match(TokenType.MULI)) {
      return this.muliInstr();
    } else if (this.match(TokenType.MULR)) {
      return this.mulrInstr();
    } else if (this.match(TokenType.DIVI)) {
      return this.diviInstr();
    } else if (this.match(TokenType.DIVR)) {
      return this.divrInstr();
    } else if (this.match(TokenType.MODI)) {
      return this.modiInstr();
    } else if (this.match(TokenType.MODR)) {
      return this.modrInstr();
    } else if (this.match(TokenType.INC)) {
      return this.incInstr();
    } else if (this.match(TokenType.DEC)) {
      return this.decInstr();
    } else if (this.match(TokenType.SHLI)) {
      return this.shliInstr();
    } else if (this.match(TokenType.SHLR)) {
      return this.shlrInstr();
    } else if (this.match(TokenType.SHRI)) {
      return this.shriInstr();
    } else if (this.match(TokenType.SHRR)) {
      return this.shrrInstr();
    } else if (this.match(TokenType.ORI)) {
      return this.oriInstr();
    } else if (this.match(TokenType.ORR)) {
      return this.orrInstr();
    } else if (this.match(TokenType.ANDI)) {
      return this.andiInstr();
    } else if (this.match(TokenType.ANDR)) {
      return this.andrInstr();
    } else if (this.match(TokenType.XORI)) {
      return this.xoriInstr();
    } else if (this.match(TokenType.XORR)) {
      return this.xorrInstr();
    } else if (this.match(TokenType.NOT)) {
      return this.notInstr();
    } else if (this.match(TokenType.CMPI)) {
      return this.cmpiInstr();
    } else if (this.match(TokenType.CMPR)) {
      return this.cmprInstr();
    } else if (this.match(TokenType.JMP)) {
      return this.jmpInstr();
    } else if (this.match(TokenType.JMPR)) {
      return this.jmprInstr();
    } else if (this.match(TokenType.JZ)) {
      return this.jzInstr();
    } else if (this.match(TokenType.JZR)) {
      return this.jzrInstr();
    } else if (this.match(TokenType.JNZ)) {
      return this.jnzInstr();
    } else if (this.match(TokenType.JNZR)) {
      return this.jnzrInstr();
    } else if (this.match(TokenType.JG)) {
      return this.jgInstr();
    } else if (this.match(TokenType.JGR)) {
      return this.jgrInstr();
    } else if (this.match(TokenType.JGZ)) {
      return this.jgzInstr();
    } else if (this.match(TokenType.JGZR)) {
      return this.jgzrInstr();
    } else if (this.match(TokenType.JL)) {
      return this.jlInstr();
    } else if (this.match(TokenType.JLR)) {
      return this.jlrInstr();
    } else if (this.match(TokenType.JLZ)) {
      return this.jlzInstr();
    } else if (this.match(TokenType.JLZR)) {
      return this.jlzrInstr();
    } else if (this.match(TokenType.JO)) {
      return this.joInstr();
    } else if (this.match(TokenType.JOR)) {
      return this.jorInstr();
    } else if (this.match(TokenType.JDZ)) {
      return this.jdzInstr();
    } else if (this.match(TokenType.JDZR,)) {
      return this.jdzrInstr();
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

  private imm(): Token {
    return this.consume(TokenType.NUMBER, 'Expected immediate');
  }

  private addr(): Token {
    if (this.check(TokenType.NUMBER)) {
      return this.consume(TokenType.NUMBER, 'Expected address');
    }
    return this.consume(TokenType.IDENTIFIER, 'Expected label');
  }

  private comma() {
    this.consume(TokenType.COMMA, `'Expected ','`);
  }

  private colon() {
    this.consume(TokenType.COLON, `Expected ':'`);
  }

  private moviInstr(): MoviInstr {
    const reg = this.reg();
    this.comma();
    const imm = this.imm();
    return {
      type: 'MoviInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
      immediate: (imm.literal!) as number,
    };
  }

  private movrInstr(): MovrInstr {
    const reg1 = this.reg();
    this.comma();
    const reg2 = this.reg();
    return {
      type: 'MovrInstr',
      line: this.line,
      register1: (reg1.literal!) as Registers,
      register2: (reg2.literal!) as Registers,
    };
  }

  private stoiInstr(): StoiInstr {
    const addr = this.addr();
    this.comma();
    const imm = this.imm();
    return {
      type: 'StoiInstr',
      line: this.line,
      address: (addr.literal!) as Address,
      immediate: (imm.literal!) as number,
    };
  }

  private stoibInstr(): StoibInstr {
    const addr = this.addr();
    this.comma();
    const imm = this.imm();
    return {
      type: 'StoibInstr',
      line: this.line,
      address: (addr.literal!) as Address,
      immediate: (imm.literal!) as number,
    };
  }

  private storiInstr(): StoriInstr {
    const reg = this.reg();
    this.comma();
    const imm = this.imm();
    return {
      type: 'StoriInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
      immediate: (imm.literal!) as number,
    };
  }

  private storibInstr(): StoribInstr {
    const reg = this.reg();
    this.comma();
    const imm = this.imm();
    return {
      type: 'StoribInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
      immediate: (imm.literal!) as number,
    };
  }

  private storInstr(): StorInstr {
    const addr = this.addr();
    this.comma();
    const reg = this.reg();
    return {
      type: 'StorInstr',
      line: this.line,
      address: (addr.literal!) as Address,
      register: (reg.literal!) as Registers,
    };
  }

  private storbInstr(): StorbInstr {
    const addr = this.addr();
    this.comma();
    const reg = this.reg();
    return {
      type: 'StorbInstr',
      line: this.line,
      address: (addr.literal!) as Address,
      register: (reg.literal!) as Registers,
    };
  }

  private storrInstr(): StorrInstr {
    const reg1 = this.reg();
    this.comma();
    const reg2 = this.reg();
    return {
      type: 'StorrInstr',
      line: this.line,
      register1: (reg1.literal!) as Registers,
      register2: (reg2.literal!) as Registers,
    };
  }

  private storrbInstr(): StorrbInstr {
    const reg1 = this.reg();
    this.comma();
    const reg2 = this.reg();
    return {
      type: 'StorrbInstr',
      line: this.line,
      register1: (reg1.literal!) as Registers,
      register2: (reg2.literal!) as Registers,
    };
  }

  private lodrInstr(): LodrInstr {
    const reg = this.reg();
    this.comma();
    const addr = this.addr();
    return {
      type: 'LodrInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
      address: (addr.literal!) as Address,
    };
  }

  private lodrbInstr(): LodrbInstr {
    const reg = this.reg();
    this.comma();
    const addr = this.addr();
    return {
      type: 'LodrbInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
      address: (addr.literal!) as Address,
    };
  }

  private lodrrInstr(): LodrrInstr {
    const reg1 = this.reg();
    this.comma();
    const reg2 = this.reg();
    return {
      type: 'LodrrInstr',
      line: this.line,
      register1: (reg1.literal!) as Registers,
      register2: (reg2.literal!) as Registers,
    };
  }

  private lodrrbInstr(): LodrrbInstr {
    const reg1 = this.reg();
    this.comma();
    const reg2 = this.reg();
    return {
      type: 'LodrrbInstr',
      line: this.line,
      register1: (reg1.literal!) as Registers,
      register2: (reg2.literal!) as Registers,
    };
  }

  private addiInstr(): AddiInstr {
    const reg = this.reg();
    this.comma();
    const imm = this.imm();
    return {
      type: 'AddiInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
      immediate: (imm.literal!) as number,
    };
  }

  private addrInstr(): AddrInstr {
    const reg1 = this.reg();
    this.comma();
    const reg2 = this.reg();
    return {
      type: 'AddrInstr',
      line: this.line,
      register1: (reg1.literal!) as Registers,
      register2: (reg2.literal!) as Registers,
    };
  }

  private subiInstr(): SubiInstr {
    const reg = this.reg();
    this.comma();
    const imm = this.imm();
    return {
      type: 'SubiInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
      immediate: (imm.literal!) as number,
    };
  }

  private subrInstr(): SubrInstr {
    const reg1 = this.reg();
    this.comma();
    const reg2 = this.reg();
    return {
      type: 'SubrInstr',
      line: this.line,
      register1: (reg1.literal!) as Registers,
      register2: (reg2.literal!) as Registers,
    };
  }

  private muliInstr(): MuliInstr {
    const reg = this.reg();
    this.comma();
    const imm = this.imm();
    return {
      type: 'MuliInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
      immediate: (imm.literal!) as number,
    };
  }

  private mulrInstr(): MulrInstr {
    const reg1 = this.reg();
    this.comma();
    const reg2 = this.reg();
    return {
      type: 'MulrInstr',
      line: this.line,
      register1: (reg1.literal!) as Registers,
      register2: (reg2.literal!) as Registers,
    };
  }

  private diviInstr(): DiviInstr {
    const reg = this.reg();
    this.comma();
    const imm = this.imm();
    return {
      type: 'DiviInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
      immediate: (imm.literal!) as number,
    };
  }

  private divrInstr(): DivrInstr {
    const reg1 = this.reg();
    this.comma();
    const reg2 = this.reg();
    return {
      type: 'DivrInstr',
      line: this.line,
      register1: (reg1.literal!) as Registers,
      register2: (reg2.literal!) as Registers,
    };
  }

  private modiInstr(): ModiInstr {
    const reg = this.reg();
    this.comma();
    const imm = this.imm();
    return {
      type: 'ModiInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
      immediate: (imm.literal!) as number,
    };
  }

  private modrInstr(): ModrInstr {
    const reg1 = this.reg();
    this.comma();
    const reg2 = this.reg();
    return {
      type: 'ModrInstr',
      line: this.line,
      register1: (reg1.literal!) as Registers,
      register2: (reg2.literal!) as Registers,
    };
  }

  private incInstr(): IncInstr {
    const reg = this.reg();
    return {
      type: 'IncInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
    };
  }

  private decInstr(): DecInstr {
    const reg = this.reg();
    return {
      type: 'DecInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
    };
  }

  private shliInstr(): ShliInstr {
    const reg = this.reg();
    this.comma();
    const imm = this.imm();
    return {
      type: 'ShliInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
      immediate: (imm.literal!) as number,
    };
  }

  private shlrInstr(): ShlrInstr {
    const reg1 = this.reg();
    this.comma();
    const reg2 = this.reg();
    return {
      type: 'ShlrInstr',
      line: this.line,
      register1: (reg1.literal!) as Registers,
      register2: (reg2.literal!) as Registers,
    };
  }

  private shriInstr(): ShriInstr {
    const reg = this.reg();
    this.comma();
    const imm = this.imm();
    return {
      type: 'ShriInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
      immediate: (imm.literal!) as number,
    };
  }

  private shrrInstr(): ShrrInstr {
    const reg1 = this.reg();
    this.comma();
    const reg2 = this.reg();
    return {
      type: 'ShrrInstr',
      line: this.line,
      register1: (reg1.literal!) as Registers,
      register2: (reg2.literal!) as Registers,
    };
  }

  private oriInstr(): OriInstr {
    const reg = this.reg();
    this.comma();
    const imm = this.imm();
    return {
      type: 'OriInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
      immediate: (imm.literal!) as number,
    };
  }

  private orrInstr(): OrrInstr {
    const reg1 = this.reg();
    this.comma();
    const reg2 = this.reg();
    return {
      type: 'OrrInstr',
      line: this.line,
      register1: (reg1.literal!) as Registers,
      register2: (reg2.literal!) as Registers,
    };
  }

  private andiInstr(): AndiInstr {
    const reg = this.reg();
    this.comma();
    const imm = this.imm();
    return {
      type: 'AndiInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
      immediate: (imm.literal!) as number,
    };
  }

  private andrInstr(): AndrInstr {
    const reg1 = this.reg();
    this.comma();
    const reg2 = this.reg();
    return {
      type: 'AndrInstr',
      line: this.line,
      register1: (reg1.literal!) as Registers,
      register2: (reg2.literal!) as Registers,
    };
  }

  private xoriInstr(): XoriInstr {
    const reg = this.reg();
    this.comma();
    const imm = this.imm();
    return {
      type: 'XoriInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
      immediate: (imm.literal!) as number,
    };
  }

  private xorrInstr(): XorrInstr {
    const reg1 = this.reg();
    this.comma();
    const reg2 = this.reg();
    return {
      type: 'XorrInstr',
      line: this.line,
      register1: (reg1.literal!) as Registers,
      register2: (reg2.literal!) as Registers,
    };
  }

  private notInstr(): NotInstr {
    const reg = this.reg();
    return {
      type: 'NotInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
    };
  }

  private cmpiInstr(): CmpiInstr {
    const reg = this.reg();
    this.comma();
    const imm = this.imm();
    return {
      type: 'CmpiInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
      immediate: (imm.literal!) as number,
    };
  }

  private cmprInstr(): CmprInstr {
    const reg1 = this.reg();
    this.comma();
    const reg2 = this.reg();
    return {
      type: 'CmprInstr',
      line: this.line,
      register1: (reg1.literal!) as Registers,
      register2: (reg2.literal!) as Registers,
    };
  }

  private jmpInstr(): JmpInstr {
    const addr = this.addr();
    return {
      type: 'JmpInstr',
      line: this.line,
      address: (addr.literal!) as Address,
    };
  }

  private jmprInstr(): JmprInstr {
    const reg = this.reg();
    return {
      type: 'JmprInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
    };
  }
  
  private jzInstr(): JzInstr {
    const addr = this.addr();
    return {
      type: 'JzInstr',
      line: this.line,
      address: (addr.literal!) as Address,
    };
  }

  private jzrInstr(): JzrInstr {
    const reg = this.reg();
    return {
      type: 'JzrInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
    };
  }

  private jnzInstr(): JnzInstr {
    const addr = this.addr();
    return {
      type: 'JnzInstr',
      line: this.line,
      address: (addr.literal!) as Address,
    };
  }

  private jnzrInstr(): JnzrInstr {
    const reg = this.reg();
    return {
      type: 'JnzrInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
    };
  }

  private jgInstr(): JgInstr {
    const addr = this.addr();
    return {
      type: 'JgInstr',
      line: this.line,
      address: (addr.literal!) as Address,
    };
  }

  private jgrInstr(): JgrInstr {
    const reg = this.reg();
    return {
      type: 'JgrInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
    };
  }

  private jgzInstr(): JgzInstr {
    const addr = this.addr();
    return {
      type: 'JgzInstr',
      line: this.line,
      address: (addr.literal!) as Address,
    };
  }

  private jgzrInstr(): JgzrInstr {
    const reg = this.reg();
    return {
      type: 'JgzrInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
    };
  }

  private jlInstr(): JlInstr {
    const addr = this.addr();
    return {
      type: 'JlInstr',
      line: this.line,
      address: (addr.literal!) as Address,
    };
  }

  private jlrInstr(): JlrInstr {
    const reg = this.reg();
    return {
      type: 'JlrInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
    };
  }

  private jlzInstr(): JlzInstr {
    const addr = this.addr();
    return {
      type: 'JlzInstr',
      line: this.line,
      address: (addr.literal!) as Address,
    };
  }

  private jlzrInstr(): JlzrInstr {
    const reg = this.reg();
    return {
      type: 'JlzrInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
    };
  }

  private joInstr(): JoInstr {
    const addr = this.addr();
    return {
      type: 'JoInstr',
      line: this.line,
      address: (addr.literal!) as Address,
    };
  }

  private jorInstr(): JorInstr {
    const reg = this.reg();
    return {
      type: 'JorInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
    };
  }

  private jdzInstr(): JdzInstr {
    const addr = this.addr();
    return {
      type: 'JdzInstr',
      line: this.line,
      address: (addr.literal!) as Address,
    };
  }

  private jdzrInstr(): JdzrInstr {
    const reg = this.reg();
    return {
      type: 'JdzrInstr',
      line: this.line,
      register: (reg.literal!) as Registers,
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