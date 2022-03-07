type Source = {
  path: string,
  code: string,
  library: boolean,
};

declare module '*.con' {
  export const source: Source;
  export default source;
}