import {AsmErrorCollector} from '../base';

export enum TokenType {
  COMMA,
  COLON,

  IDENTIFIER,
  STRING,
  NUMBER,

  NOP,
  END,
  VSYNC,

  EOF,
}

const Keywords: Map<string, TokenType> = new Map(Object.entries({
  'NOP': TokenType.NOP,
  'END': TokenType.END,
  'VSYNC': TokenType.VSYNC,
}));

export type Token = {
  type: TokenType;
  lexeme: string;
  literal?: any;
  line: number;
};

export function tokenString(token: Token): string {
  return `${TokenType[token.type]} ${token.lexeme} ${token.literal}`;
}

export function tokenize(source: string, collectError: AsmErrorCollector): Token[] {
  return new Tokenizer(source, collectError).tokenize();
}

class Tokenizer {
  private readonly source: string;
  private readonly collectError: AsmErrorCollector;
  private readonly tokens: Token[];
  private start: number;
  private current: number;
  private line: number;

  constructor(source: string, collectError: AsmErrorCollector) {
    this.source = source;
    this.collectError = collectError;
    this.tokens = [];
    this.start = 0;
    this.current = 0;
    this.line = 1;
  }

  tokenize(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push({
      type: TokenType.EOF,
      lexeme: '',
      line: this.line,
    });

    return this.tokens;
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private scanToken() {
    const c = this.advance();
    switch (c) {
      case ',':
        this.addToken(TokenType.COMMA);
        break;
      case ':':
        this.addToken(TokenType.COLON);
        break;
      case '/':
        if (this.match('/')) {
          while (this.peek() != '\n' && !this.isAtEnd()) {
            this.advance();
          }
        } else if (this.match('*')) {
          const line = this.line;
          while (this.peek() != '*' && this.peek(1) != '/' && !this.isAtEnd()) {
            const cc = this.advance();
            if (cc == '\n') {
              this.line++;
            }
          }
          if (this.isAtEnd()) {
            this.collectError({
              line,
              message: `Could not find closing comment section`,
            })
          }
        } else {
          this.collectError({
            line: this.line,
            message: `Unexpected character: '${c}`,
          });
        }
        break;
      case ' ':
      case '\r':
      case '\t':
        break;
      case '\n':
        this.line++;
        break;
      case '"':
        this.string();
        break;
      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          this.collectError({
            line: this.line,
            message: `Unexpected character: '${c}'`,
          });
        }
        break;
    }
  }

  private advance(): string {
    return this.source.charAt(this.current++);
  }

  private addToken(type: TokenType, literal?: any) {
    const lexeme = this.source.substring(this.start, this.current);
    this.tokens.push({
      type,
      lexeme,
      literal,
      line: this.line,
    });
  }

  private match(c: string): boolean {
    if (this.isAtEnd()) {
      return false;
    }
    if (this.source.charAt(this.current) != c) {
      return false;
    }

    this.current++;
    return true;
  }

  private peek(ahead: number = 0): string {
    if (this.isAtEnd()) {
      return '\0';
    }
    return this.source.charAt(this.current + ahead);
  }

  private string() {
    while (this.peek() != '"' && !this.isAtEnd()) {
      if (this.peek() == '\n') {
        this.line++;
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      this.collectError({
        line: this.line,
        message: 'Unterminated string',
      });
    }

    this.advance();
    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }

  private isDigit(c: string): boolean {
    return c.charCodeAt(0) >= '0'.charCodeAt(0) && c.charCodeAt(0) <= '9'.charCodeAt(0);
  }

  private number() {
    let radix = 10;
    if (this.peek() == '0') {
      switch (this.peek(1)) {
        case 'b':
        case 'B':
          radix = 2;
          this.advance();
          this.advance();
          break;
        case 'o':
        case 'O':
          radix = 8;
          this.advance();
          this.advance();
          break;
        case 'x':
        case 'X':
          radix = 16;
          this.advance();
          this.advance();
          break;
        default:
          break;
      }
    }

    while (this.isDigit(this.peek())) {
      this.advance();
    }

    const value = Number.parseInt(this.source.substring(this.start, this.current), radix);
    this.addToken(TokenType.NUMBER, value);
  }

  private isAlpha(c: string): boolean {
    return (c.charCodeAt(0) >= 'a'.charCodeAt(0) && c.charCodeAt(0) <= 'z'.charCodeAt(0)) ||
    (c.charCodeAt(0) >= 'A'.charCodeAt(0) && c.charCodeAt(0) <= 'Z'.charCodeAt(0)) ||
    (c == '_');
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private identifier() {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }

    const text = this.source.substring(this.start, this.current);
    if (Keywords.has(text)) {
      this.addToken(Keywords.get(text)!);
    } else {
      this.addToken(TokenType.IDENTIFIER);
    }
  }
}

