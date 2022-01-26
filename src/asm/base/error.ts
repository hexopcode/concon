export type AsmError = {
  line: number,
  message: string,
};

export type AsmErrorCollector = (error: AsmError) => void;