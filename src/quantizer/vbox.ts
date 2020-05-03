import { Vec3 } from '../color';
import { Pixels, Filter } from '../typing';
import { getColorIndex, SIGBITS, RSHIFT } from '../util';

export interface Dimension {
  r1: number
  r2: number
  g1: number
  g2: number
  b1: number
  b2: number
  [d: string]: number
}

export default class VBox {
  static build(pixels: Pixels, shouldIgnore?: Filter): VBox {
    const hn = 1 << (3 * SIGBITS);
    const hist = new Uint32Array(hn);
    let rmax: number = 0;
    let rmin: number = Number.MAX_VALUE;
    let gmax: number = 0;
    let gmin: number = Number.MAX_VALUE;
    let bmax: number = 0;
    let bmin: number = Number.MAX_VALUE;
    let r: number;
    let g: number;
    let b: number;
    let a: number;
    const n = pixels.length / 4;
    let i = 0;

    while (i < n) {
      const offset = i * 4;
      i += 1;
      r = pixels[offset + 0];
      g = pixels[offset + 1];
      b = pixels[offset + 2];
      a = pixels[offset + 3];

      // Ignored pixels' alpha is marked as 0 in filtering stage
      if (a === 0) continue;

      r >>= RSHIFT;
      g >>= RSHIFT;
      b >>= RSHIFT;

      const index = getColorIndex(r, g, b);
      hist[index] += 1;

      if (r > rmax) rmax = r;
      if (r < rmin) rmin = r;
      if (g > gmax) gmax = g;
      if (g < gmin) gmin = g;
      if (b > bmax) bmax = b;
      if (b < bmin) bmin = b;
    }

    return new VBox(rmin, rmax, gmin, gmax, bmin, bmax, hist);
  }

  dimension: Dimension;

  hist: Uint32Array;

  #volume = -1;

  #avg: Vec3 | null = null;

  #count = -1;

  constructor(
    r1: number, r2: number,
    g1: number, g2: number,
    b1: number, b2: number,
    hist: Uint32Array,
  ) {
    this.dimension = {
      r1, r2, g1, g2, b1, b2,
    };

    this.hist = hist;
  }

  invalidate(): void {
    this.#volume = -1;
    this.#count = -1;
    this.#avg = null;
  }

  volume(): number {
    if (this.#volume < 0) {
      const {
        r1, r2, g1, g2, b1, b2,
      } = this.dimension;
      this.#volume = (r2 - r1 + 1) * (g2 - g1 + 1) * (b2 - b1 + 1);
    }
    return this.#volume;
  }

  count(): number {
    if (this.#count < 0) {
      const { hist } = this;
      const {
        r1, r2, g1, g2, b1, b2,
      } = this.dimension;
      let c = 0;

      for (let r = r1; r <= r2; r += 1) {
        for (let g = g1; g <= g2; g += 1) {
          for (let b = b1; b <= b2; b += 1) {
            const index = getColorIndex(r, g, b);
            c += hist[index];
          }
        }
      }
      this.#count = c;
    }
    return this.#count;
  }

  clone(): VBox {
    const { hist } = this;
    const {
      r1, r2, g1, g2, b1, b2,
    } = this.dimension;
    return new VBox(r1, r2, g1, g2, b1, b2, hist);
  }

  avg(): Vec3 {
    if (!this.#avg) {
      const { hist } = this;
      const {
        r1, r2, g1, g2, b1, b2,
      } = this.dimension;
      let ntot = 0;
      const mult = 1 << (8 - SIGBITS);
      let rsum: number = 0;
      let gsum: number = 0;
      let bsum: number = 0;

      for (let r = r1; r <= r2; r += 1) {
        for (let g = g1; g <= g2; g += 1) {
          for (let b = b1; b <= b2; b += 1) {
            const index = getColorIndex(r, g, b);
            const h = hist[index];
            ntot += h;
            rsum += (h * (r + 0.5) * mult);
            gsum += (h * (g + 0.5) * mult);
            bsum += (h * (b + 0.5) * mult);
          }
        }
      }
      if (ntot) {
        this.#avg = [
          ~~(rsum / ntot),
          ~~(gsum / ntot),
          ~~(bsum / ntot),
        ];
      } else {
        this.#avg = [
          ~~((mult * (r1 + r2 + 1)) / 2),
          ~~((mult * (g1 + g2 + 1)) / 2),
          ~~((mult * (b1 + b2 + 1)) / 2),
        ];
      }
    }
    return this.#avg;
  }

  contains(rgb: Vec3): boolean {
    let [r, g, b] = rgb;
    const {
      r1, r2, g1, g2, b1, b2,
    } = this.dimension;
    r >>= RSHIFT;
    g >>= RSHIFT;
    b >>= RSHIFT;

    return r >= r1 && r <= r2
      && g >= g1 && g <= g2
      && b >= b1 && b <= b2;
  }

  split(): VBox[] {
    const { hist } = this;
    const {
      r1, r2, g1, g2, b1, b2,
    } = this.dimension;
    const count = this.count();
    if (!count) return [];
    if (count === 1) return [this.clone()];
    const rw = r2 - r1 + 1;
    const gw = g2 - g1 + 1;
    const bw = b2 - b1 + 1;

    const maxw = Math.max(rw, gw, bw);
    let accSum: Uint32Array | null = null;
    let sum: number = 0;
    let total: number = 0;

    let maxd: 'r' | 'g' | 'b' | null = null;

    if (maxw === rw) {
      maxd = 'r';
      accSum = new Uint32Array(r2 + 1);
      for (let r = r1; r <= r2; r += 1) {
        sum = 0;
        for (let g = g1; g <= g2; g += 1) {
          for (let b = b1; b <= b2; b += 1) {
            const index = getColorIndex(r, g, b);
            sum += hist[index];
          }
        }
        total += sum;
        accSum[r] = total;
      }
    } else if (maxw === gw) {
      maxd = 'g';
      accSum = new Uint32Array(g2 + 1);
      for (let g = g1; g <= g2; g += 1) {
        sum = 0;
        for (let r = r1; r <= r2; r += 1) {
          for (let b = b1; b <= b2; b += 1) {
            const index = getColorIndex(r, g, b);
            sum += hist[index];
          }
        }
        total += sum;
        accSum[g] = total;
      }
    } else {
      maxd = 'b';
      accSum = new Uint32Array(b2 + 1);
      for (let b = b1; b <= b2; b += 1) {
        sum = 0;
        for (let r = r1; r <= r2; r += 1) {
          for (let g = g1; g <= g2; g += 1) {
            const index = getColorIndex(r, g, b);
            sum += hist[index];
          }
        }
        total += sum;
        accSum[b] = total;
      }
    }

    let splitPoint = -1;
    const reverseSum = new Uint32Array(accSum.length);
    for (let i = 0; i < accSum.length; i += 1) {
      const d = accSum[i];
      if (splitPoint < 0 && d > total / 2) splitPoint = i;
      reverseSum[i] = total - d;
    }

    const vbox = this;

    function doCut(d: string): VBox[] {
      const dim1 = `${d}1`;
      const dim2 = `${d}2`;
      const d1 = vbox.dimension[dim1];
      let d2 = vbox.dimension[dim2];
      const vbox1 = vbox.clone();
      const vbox2 = vbox.clone();
      const left = splitPoint - d1;
      const right = d2 - splitPoint;
      if (left <= right) {
        d2 = Math.min(d2 - 1, ~~(splitPoint + right / 2));
        d2 = Math.max(0, d2);
      } else {
        d2 = Math.max(d1, ~~(splitPoint - 1 - left / 2));
        d2 = Math.min(vbox.dimension[dim2], d2);
      }

      while (!accSum![d2]) d2 += 1;

      let c2 = reverseSum[d2];
      while (!c2 && accSum![d2 - 1]) c2 = reverseSum[d2 -= 1];

      vbox1.dimension[dim2] = d2;
      vbox2.dimension[dim1] = d2 + 1;

      return [vbox1, vbox2];
    }

    return doCut(maxd);
  }
}
