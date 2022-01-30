const SIZE = 128;
const SCALE = 3;
const PIXELS = SIZE * SCALE;

const GB_PALETTE: Uint8ClampedArray[] = [
  new Uint8ClampedArray([0x0f, 0x38, 0x0f, 0xff]),  // dark green
  new Uint8ClampedArray([0x30, 0x62, 0x30, 0xff]),  // medium dark green
  new Uint8ClampedArray([0x8b, 0xac, 0x0f, 0xff]),  // medium light green
  new Uint8ClampedArray([0x9b, 0xbc, 0x0f, 0xff]),  // light green
];

const DEBUG_PALETTE: Uint8ClampedArray[] = [
  new Uint8ClampedArray([0xff, 0x00, 0x00, 0xff]),  // red
  new Uint8ClampedArray([0x00, 0xff, 0x00, 0xff]),  // green
  new Uint8ClampedArray([0x00, 0x00, 0xff, 0xff]),  // blue
  new Uint8ClampedArray([0xff, 0xff, 0xff, 0xff]),  // white
];

export class ConconScreen {
  private readonly dom: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;

  constructor() {
    this.dom = document.createElement('canvas') as HTMLCanvasElement;

    // FIXME: account devicePixelRatio
    this.dom.width = PIXELS;
    this.dom.height = PIXELS;
    this.dom.style.setProperty('width', `${PIXELS}px`);
    this.dom.style.setProperty('height', `${PIXELS}px`);
    // FIXME: replace with webgl
    this.ctx = this.dom.getContext('2d')!;
  }

  attach(root: HTMLElement) {
    root.appendChild(this.dom);
  }

  render(screen: Uint8Array) {
    // FIXME: This should really be a pixel shader.
    // For now, let's keep it simple and just use the CPU,
    const imageData = this.ctx.getImageData(0, 0, PIXELS, PIXELS);
    const buffer: Uint8ClampedArray = imageData.data;

    for (let i = 0; i < screen.length; ++i) {
      const byte = screen[i];

      const p1 = (byte & 0b11000000) >> 6;
      const p2 = (byte & 0b00110000) >> 4;
      const p3 = (byte & 0b00001100) >> 2;
      const p4 = (byte & 0b00000011);
      
      const screenBufferPixelOffset = i << 2;  // 4 pixels per byte
      const xx = screenBufferPixelOffset % SIZE;
      const yy = screenBufferPixelOffset / SIZE | 0;

      const bufferOffset = (yy * SIZE * SCALE * SCALE + xx * SCALE) * 4; // 4 bytes per pixel (rgba)

      for (let y = 0; y < SCALE; ++y) {
        for (let x = 0; x < SCALE; ++x) {    
          buffer.set(GB_PALETTE[p1], (bufferOffset) + (y * PIXELS * 4) + x * 4);
          buffer.set(GB_PALETTE[p2], (bufferOffset + 4 * SCALE) + (y * PIXELS * 4) + x * 4);
          buffer.set(GB_PALETTE[p3], (bufferOffset + 8 * SCALE) + (y * PIXELS * 4) + x * 4);
          buffer.set(GB_PALETTE[p4], (bufferOffset + 12 * SCALE) + (y * PIXELS * 4) + x * 4);
        }
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }
}