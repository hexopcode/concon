function conToJavaScript(source) {
  const escaped = `\`${source.replace('`', '\\\`')}\``;
  const body = `export const source = ${escaped};
export default source;
`;
  return {body};
}

export function conPlugin() {
  return {
    name: 'con',
    transform(context) {
      if (context.path.endsWith('.con')) {
        return conToJavaScript(context.body);
      }
    },
  };
}