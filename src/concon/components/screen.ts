import {OutputDevice} from '../../core';

const SIZE = 128;
const SCALE = 3;
const PIXELS = SIZE * SCALE;

const PALETTE_COLOR_COUNT = 4;
const PALETTE_BYTES_PER_COLOR = 4;
const PALETTE_BYTES_COUNT = PALETTE_COLOR_COUNT * PALETTE_BYTES_PER_COLOR;

export class ConconScreen implements OutputDevice {
  private readonly dom: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly paletteBuffer: ArrayBuffer;
  private readonly palette: Uint8ClampedArray[];
  private paletteDirty: boolean;

  constructor() {
    this.dom = document.createElement('canvas') as HTMLCanvasElement;

    // FIXME: account devicePixelRatio
    this.dom.width = PIXELS;
    this.dom.height = PIXELS;
    this.dom.style.setProperty('width', `${PIXELS}px`);
    this.dom.style.setProperty('height', `${PIXELS}px`);
    // FIXME: replace with webgl
    this.ctx = this.dom.getContext('2d')!;

    this.paletteBuffer = new ArrayBuffer(PALETTE_BYTES_COUNT);
    this.palette = [
      new Uint8ClampedArray(this.paletteBuffer, 0 * PALETTE_BYTES_PER_COLOR, PALETTE_BYTES_PER_COLOR),
      new Uint8ClampedArray(this.paletteBuffer, 1 * PALETTE_BYTES_PER_COLOR, PALETTE_BYTES_PER_COLOR),
      new Uint8ClampedArray(this.paletteBuffer, 2 * PALETTE_BYTES_PER_COLOR, PALETTE_BYTES_PER_COLOR),
      new Uint8ClampedArray(this.paletteBuffer, 3 * PALETTE_BYTES_PER_COLOR, PALETTE_BYTES_PER_COLOR),
    ];
    this.paletteDirty = true;
  }

  out(data: number) {
    const index = data >> 8 & 0x0F;
    const rgb = data >> 12 & 0x0F;
    const value = data & 0xFF;
    this.palette[index].set([value], rgb);
    this.paletteDirty = true;
  }

  outb(data: number) {}

  attach(root: HTMLElement) {
    root.appendChild(this.dom);
  }

  render(framebuffer: Uint8Array) {
    if (this.paletteDirty) {
      const rgba = this.palette[0];
      const r = rgba[0];
      const g = rgba[1];
      const b = rgba[2];
      const a = rgba[3] / 255;
      this.dom.parentElement!.style.backgroundColor = `rgba(${r},${g},${b},${a})`;
      this.paletteDirty = false;
    }
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