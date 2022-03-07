function conToJavaScript(source) {
  const escaped = `\`${source.code.replace('`', '\\\`')}\``;
  const body = `/** @generated */
export const source = {
  path: '${source.path}',
  code: ${escaped},
  library: ${source.library},
};
export default source;`;
  return {body};
}

export function conPlugin() {
  return {
    name: 'con',
    transform(context) {
      if (context.path.endsWith('.con')) {
        const library = context.path.endsWith('.lib.con');
        return conToJavaScript({path: context.path, code: context.body, library});
      }
    },
  };
}