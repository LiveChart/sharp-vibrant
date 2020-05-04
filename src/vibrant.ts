import type {
  Image,
  ImageSource,
  Options,
  ComputedOptions,
  Callback,
  PaletteResult,
} from './typing';

import { Palette, Swatch } from './color';

// eslint-disable-next-line import/no-cycle
import Builder from './builder';

import * as Util from './util';

import QuantizerMMCQ from './quantizer';
import { Default as DefaultGenerator } from './generator';
// eslint-disable-next-line import/no-cycle
import * as Filters from './filter';

class Vibrant {
  static Builder = Builder;

  static Quantizer = QuantizerMMCQ;

  static Generator = DefaultGenerator;

  static Filter = Filters;

  static Util = Util;

  static Swatch = Swatch;

  static DefaultOpts: Partial<Options> = {
    colorCount: 64,
    quality: 5,
    generator: DefaultGenerator,
    ImageClass: null!,
    quantizer: QuantizerMMCQ,
    filters: [Filters.Default],
  };

  static from(src: ImageSource): Builder {
    return new Builder(src);
  }

  opts: ComputedOptions;

  #src: ImageSource;

  constructor(src: ImageSource, opts?: Partial<Options>) {
    this.#src = src;
    this.opts = <ComputedOptions>({ ...Vibrant.DefaultOpts, ...opts });
    this.opts.combinedFilter = Filters.combineFilters(this.opts.filters)!;
  }

  private process(image: Image): Promise<Palette> {
    const { quantizer, generator } = this.opts;

    return image.applyFilter(this.opts.combinedFilter)
      .then((imageData) => quantizer(imageData.data, this.opts))
      .then((colors) => Swatch.applyFilter(colors, this.opts.combinedFilter))
      .then((colors) => Promise.resolve(generator!(colors)));
  }

  getPalette(cb?: Callback<PaletteResult>): Promise<PaletteResult> {
    const image = new this.opts.ImageClass();
    const result = image.load(this.#src, this.opts)
      .then((loadedImage) => this.process(loadedImage))
      .then((palette) => {
        const paletteResult: PaletteResult = {
          pixelCount: image.pixelCount,
          imageDimensions: {
            width: image.width,
            height: image.height,
          },
          palette,
        };
        image.cleanup();
        return paletteResult;
      }, (err) => {
        image.cleanup();
        throw err;
      });

    if (cb) {
      result.then((palette) => cb(null!, palette), (err) => cb(err));
    }

    return result;
  }
}

export default Vibrant;
