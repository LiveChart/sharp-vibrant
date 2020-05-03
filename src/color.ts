import type { Filter } from './typing';
import { rgbToHsl, rgbToHex } from './util';

export type Vec3 = [number, number, number];

export interface Palette {
  Vibrant?: Swatch,
  Muted?: Swatch,
  DarkVibrant?: Swatch,
  DarkMuted?: Swatch,
  LightVibrant?: Swatch,
  LightMuted?: Swatch
  [name: string]: Swatch | undefined
}

export class Swatch {
  static applyFilter(colors: Swatch[], f: Filter): Swatch[] {
    return typeof f === 'function'
      ? [].filter.call(colors, ({ r, g, b }: { r: number, g: number, b: number }) => f(r, g, b, 255))
      : colors;
  }

  #rgb: Vec3;

  #population: number;

  #hsl?: Vec3;

  #yiq?: number;

  #hex?: string;

  constructor(rgb: Vec3, population: number) {
    this.#rgb = rgb;
    this.#population = population;
  }

  get r() { return this.#rgb[0]; }

  get g() { return this.#rgb[1]; }

  get b() { return this.#rgb[2]; }

  get rgb() { return this.#rgb; }

  get hsl() {
    if (!this.#hsl) {
      const [r, g, b] = this.#rgb;
      this.#hsl = rgbToHsl(r, g, b);
    }
    return this.#hsl;
  }

  get hex() {
    if (!this.#hex) {
      const [r, g, b] = this.#rgb;
      this.#hex = rgbToHex(r, g, b);
    }
    return this.#hex;
  }

  get population() { return this.#population; }

  toJSON() {
    return {
      rgb: this.rgb,
      population: this.population,
    };
  }

  // TODO: deprecate internally, use property instead
  getRgb(): Vec3 { return this.#rgb; }

  // TODO: deprecate internally, use property instead
  getHsl(): Vec3 { return this.hsl; }

  // TODO: deprecate internally, use property instead
  getPopulation(): number { return this.#population; }

  // TODO: deprecate internally, use property instead
  getHex(): string { return this.hex; }

  private getYiq(): number {
    if (!this.#yiq) {
      const rgb = this.#rgb;
      this.#yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    }
    return this.#yiq;
  }

  #titleTextColor?: string;

  #bodyTextColor?: string;

  get titleTextColor() {
    if (!this.#titleTextColor) {
      this.#titleTextColor = this.getYiq() < 200 ? '#fff' : '#000';
    }
    return this.#titleTextColor;
  }

  get bodyTextColor() {
    if (!this.#bodyTextColor) {
      this.#bodyTextColor = this.getYiq() < 150 ? '#fff' : '#000';
    }
    return this.#bodyTextColor;
  }

  getTitleTextColor(): string {
    return this.titleTextColor;
  }

  getBodyTextColor(): string {
    return this.bodyTextColor;
  }
}
