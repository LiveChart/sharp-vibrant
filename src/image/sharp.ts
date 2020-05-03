import sharp from 'sharp';
import type { ImageData, ImageSource, ComputedOptions } from '../typing';
import ImageBase from './base';

export default class SharpImage extends ImageBase {
  #imageData?: ImageData;

  async load(image: ImageSource, opts: ComputedOptions): Promise<ImageBase> {
    if (typeof image !== 'string' && !(image instanceof Buffer)) {
      return Promise.reject(new Error(`Cannot load image of type ${typeof image}`));
    }

    let sharpInstance = sharp(image);

    if (opts.maxDimension > 0) {
      sharpInstance = sharpInstance.resize(opts.maxDimension, opts.maxDimension, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    const buffer = await sharpInstance.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

    this.#imageData = {
      data: buffer.data,
      width: buffer.info.width,
      height: buffer.info.height,
    };

    return this;
  }

  get pixelCount(): number {
    return this.imageData.width * this.imageData.height;
  }

  get imageData(): ImageData {
    return this.#imageData!;
  }

  // eslint-disable-next-line class-methods-use-this
  cleanup(): void {

  }
}
