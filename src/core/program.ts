export const MAGIC_OFFSET = 0;
export const VERSION_OFFSET = 2;
export const STACK_ADDRESS_OFFSET = 4;
export const ENTRYPOINT_ADDRESS_OFFSET = 6;
export const CODE_SIZE_OFFSET = 8;

export const HEADER_LENGTH = 10;
export const HEADER_OFFSET = 0;
export const CODE_OFFSET = HEADER_LENGTH;

export const MAGIC_SIGNATURE: Uint8Array = new Uint8Array([0xC0, 0xC0]);
export const VERSION_0_1: Uint8Array = new Uint8Array([0x00, 0x01]);