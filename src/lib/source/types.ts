export type Source = {
  path: string,
  code: string,
  library: boolean,
};

export type SourceError = {
  path: string,
  message: string,
};