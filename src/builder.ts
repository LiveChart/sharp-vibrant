import type {
  Callback,
  ImageClass,
  ImageSource,
  Options,
  Filter,
  Quantizer,
  Generator,
  PaletteResult,
} from './typing';

// eslint-disable-next-line import/no-cycle
import Vibrant from './vibrant';

export default class Builder {
  #src: ImageSource;

  #opts: Partial<Options>;

  constructor(src: ImageSource, opts: Partial<Options> = {}) {
    this.#src = src;
    this.#opts = opts;

    if (Vibrant.DefaultOpts.filters) {
      this.#opts.filters = [...Vibrant.DefaultOpts.filters];
    } else {
      this.#opts.filters = [];
    }
  }

  maxColorCount(n: number): Builder {
    this.#opts.colorCount = n;
    return this;
  }

  maxDimension(d: number): Builder {
    this.#opts.maxDimension = d;
    return this;
  }

  addFilter(f: Filter): Builder {
    this.#opts.filters!.push(f);
    return this;
  }

  removeFilter(f: Filter): Builder {
    const i = this.#opts.filters!.indexOf(f);
    if (i > 0) this.#opts.filters!.splice(i);
    return this;
  }

  clearFilters(): Builder {
    this.#opts.filters = [];
    return this;
  }

  quality(q: number): Builder {
    this.#opts.quality = q;
    return this;
  }

  useImageClass(imageClass: ImageClass): Builder {
    this.#opts.ImageClass = imageClass;
    return this;
  }

  useGenerator(generator: Generator<any>): Builder {
    this.#opts.generator = generator;
    return this;
  }

  useQuantizer(quantizer: Quantizer): Builder {
    this.#opts.quantizer = quantizer;
    return this;
  }

  build(): Vibrant {
    return new Vibrant(this.#src, this.#opts);
  }

  getPalette(cb?: Callback<PaletteResult>): Promise<PaletteResult> {
    return this.build().getPalette(cb);
  }
}
