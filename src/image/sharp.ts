import sharp from 'sharp';
import type { Sharp } from 'sharp';
import type { ImageData, ImageSource, ComputedOptions } from '../typing';
import ImageBase from './base';

export default class SharpImage extends ImageBase {
  #imageData?: ImageData;

  async load(image: ImageSource, opts: ComputedOptions): Promise<ImageBase> {
    let sharpInstance: Sharp;

    // Check to see if image is a sharp instance.
    // Because sharp doesn't return a class, there's not much else we can do to verify type.
    if (typeof image === 'object' && 'resize' in image) {
      sharpInstance = <Sharp><unknown>image;
    } else if (typeof image === 'string' || image instanceof Buffer) {
      sharpInstance = sharp(image);
    } else {
      return Promise.reject(new Error(`Cannot load image of type ${typeof image}`));
    }

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
