import type {
  Image,
  ImageSource,
  Options,
  ComputedOptions,
  Callback,
} from './typing';

import { Palette, Swatch } from './color';

import Builder from './builder';

import * as Util from './util';

import * as Quantizer from './quantizer';
import * as Generator from './generator';
import * as Filters from './filter';

class Vibrant {
  static Builder = Builder;

  static Quantizer = Quantizer;

  static Generator = Generator;

  static Filter = Filters;

  static Util = Util;

  static Swatch = Swatch;

  static DefaultOpts: Partial<Options> = {
    colorCount: 64,
    quality: 5,
    generator: Generator.Default,
    ImageClass: null!,
    quantizer: Quantizer.MMCQ,
    filters: [Filters.Default],
  };

  static from(src: ImageSource): Builder {
    return new Builder(src);
  }

  opts: ComputedOptions;

  #palette: Palette | null = null;

  constructor(private _src: ImageSource, opts?: Partial<Options>) {
    this.opts = <ComputedOptions>({ ...Vibrant.DefaultOpts, ...opts });
    this.opts.combinedFilter = Filters.combineFilters(this.opts.filters)!;
  }

  private process(image: Image, opts: ComputedOptions): Promise<Palette> {
    const { quantizer, generator } = opts;

    return image.applyFilter(opts.combinedFilter)
      .then((imageData) => quantizer(imageData.data, opts))
      .then((colors) => Swatch.applyFilter(colors, opts.combinedFilter))
      .then((colors) => Promise.resolve(generator!(colors)));
  }

  palette(): Palette | null {
    return this.#palette;
  }

  getPalette(cb?: Callback<Palette>): Promise<Palette> {
    const image = new this.opts.ImageClass();
    const result = image.load(this._src, this.opts)
      .then((image) => this.process(image, this.opts))
      .then((palette) => {
        this.#palette = palette;
        image.cleanup();
        return palette;
      }, (err) => {
        image.cleanup();
        throw err;
      });
    if (cb) result.then((palette) => cb(null!, palette), (err) => cb(err));
    return result;
  }
}

export default Vibrant;
