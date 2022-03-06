type Source = {
  path: string,
  code: string,
};

declare module '*.con' {
  export const source: Source;
  export default source;
}