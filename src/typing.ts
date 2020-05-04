import type { Sharp } from 'sharp';
import type { Palette, Swatch } from './color';
import type Builder from './builder';

export interface VibrantStatic {
  from(src: ImageSource): Builder
}

export interface Callback<T> {
  (err?: Error, result?: T): void
}

export type ImageCallback = Callback<Image>;

export type ImageSource = string | Buffer | Sharp;

export interface ImageDimensions {
  readonly width: number
  readonly height: number
}

export interface ImagePixelInfo {
  readonly pixelCount: number
}

export type Pixels = Uint8ClampedArray | Buffer;
export interface ImageData extends ImageDimensions {
  data: Pixels
}

export interface PaletteResult extends ImagePixelInfo {
  readonly imageDimensions: ImageDimensions
  readonly palette: Palette
}

export interface Image extends ImageDimensions, ImagePixelInfo {
  readonly imageData: ImageData

  load(image: ImageSource, opts: ComputedOptions): Promise<Image>
  applyFilter(filter: Filter): Promise<ImageData>
  cleanup(): void
}

export type Resolvable<T> = T | Promise<T>;

export interface ImageClass {
  new(): Image
}

export interface Filter {
  (red: number, green: number, blue: number, alpha: number): boolean
}

export interface Quantizer {
  (pixels: Pixels, opts: ComputedOptions): Resolvable<Array<Swatch>>
}

export interface Generator<T> {
  (swatches: Array<Swatch>, opts?: T): Resolvable<Palette>
}

export interface Options {
  colorCount: number
  quality: number
  maxDimension: number
  filters: Array<Filter>
  ImageClass: ImageClass
  quantizer: Quantizer
  generator?: Generator<any>
}

export interface ComputedOptions extends Options {
  combinedFilter: Filter
}
