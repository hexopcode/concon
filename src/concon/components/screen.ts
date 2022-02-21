import {OutputDevice} from '../../core';

const SIZE = 128;
const SCALE = 3;
const PIXELS = SIZE * SCALE;

const GB_PALETTE: Uint8ClampedArray[] = [
  new Uint8ClampedArray([0x9b, 0xbc, 0x0f, 0xff]),  // light green
  new Uint8ClampedArray([0x8b, 0xac, 0x0f, 0xff]),  // medium light green
  new Uint8ClampedArray([0x30, 0x62, 0x30, 0xff]),  // medium dark green
  new Uint8ClampedArray([0x0f, 0x38, 0x0f, 0xff]),  // dark green
];

export class ConconScreen implements OutputDevice {
  private readonly dom: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly palette: Uint8ClampedArray[];

  constructor() {
    this.dom = document.createElement('canvas') as HTMLCanvasElement;

    // FIXME: account devicePixelRatio
    this.dom.width = PIXELS;
    this.dom.height = PIXELS;
    this.dom.style.setProperty('width', `${PIXELS}px`);
    this.dom.style.setProperty('height', `${PIXELS}px`);
    // FIXME: replace with webgl
    this.ctx = this.dom.getContext('2d')!;

    this.palette = [
      new Uint8ClampedArray(GB_PALETTE[0]),
      new Uint8ClampedArray(GB_PALETTE[1]),
      new Uint8ClampedArray(GB_PALETTE[2]),
      new Uint8ClampedArray(GB_PALETTE[3]),
    ];
  }

  out(data: number) {
    const index = data >> 8 & 0x0F;
    const rgb = data >> 12 & 0x0F;
    const value = data & 0xFF;
    this.palette[index].set([value], rgb);
  }

  outb(data: number) {}

  attach(root: HTMLElement) {
    root.appendChild(this.dom);
    root.style.backgroundColor = '#9bbc0f';
  }

  render(framebuffer: Uint8Array) {
    // FIXME: This should really be a pixel shader.
    // For now, let's keep it simple and just use the CPU,
    const imageData = this.ctx.getImageData(0, 0, PIXELS, PIXELS);
    const buffer: Uint8ClampedArray = imageData.data;

    for (let i = 0; i < framebuffer.length; ++i) {
      const byte = framebuffer[i];

      const p1 = (byte & 0b11000000) >> 6;
      const p2 = (byte & 0b00110000) >> 4;
      const p3 = (byte & 0b00001100) >> 2;
      const p4 = (byte & 0b00000011);
      
      const framebufferBufferPixelOffset = i << 2;  // 4 pixels per byte
      const xx = framebufferBufferPixelOffset % SIZE;
      const yy = framebufferBufferPixelOffset / SIZE | 0;

      const bufferOffset = (yy * SIZE * SCALE * SCALE + xx * SCALE) * 4; // 4 bytes per pixel (rgba)

      for (let y = 0; y < SCALE; ++y) {
        for (let x = 0; x < SCALE; ++x) {    
          buffer.set(this.palette[p1], (bufferOffset) + (y * PIXELS * 4) + x * 4);
          buffer.set(this.palette[p2], (bufferOffset + 4 * SCALE) + (y * PIXELS * 4) + x * 4);
          buffer.set(this.palette[p3], (bufferOffset + 8 * SCALE) + (y * PIXELS * 4) + x * 4);
          buffer.set(this.palette[p4], (bufferOffset + 12 * SCALE) + (y * PIXELS * 4) + x * 4);
        }
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }
}