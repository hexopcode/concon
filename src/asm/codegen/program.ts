export type AddressRef = {
  address?: number,
  references: number[],
};

export type Program = {
  stackAddress: number,
  startAddress: number,
  addressRefs: Map<string, AddressRef>,
  code: Uint8Array,
};