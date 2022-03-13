export type BaseError = {
  type: string,
  message: string,
};

export type ParserError = BaseError & {
  type: 'ParserError',
  line: number,
};

export type CodegenError = BaseError & {
  type: 'CodegenError',
};

export type AsmError = BaseError | ParserError | CodegenError;

export type AsmErrorCollector = (error: AsmError) => AsmError;