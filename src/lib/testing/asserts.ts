export function assertInternal(cond: boolean, message: string) {
  if (!cond) {
    console.error(message);
    throw new Error(message);
  }
}