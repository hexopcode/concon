import {create_boot} from './boot';

export function create_os_image(): Uint8Array {
  return create_boot();
}