import { ImageData, ImageSource, ComputedOptions } from '../typing'
import { ImageBase } from './base'
import sharp from 'sharp'

export default class SharpImage extends ImageBase {
  private _imageData: ImageData

  async load (image: ImageSource, opts: ComputedOptions): Promise<ImageBase> {
    if (typeof image !== 'string' && !(image instanceof Buffer)) {
      return Promise.reject(new Error(`Cannot load image of type ${typeof image}`))
    }

    let sharpInstance = sharp(image)

    if (opts.maxDimension > 0) {
      sharpInstance = sharpInstance.resize(opts.maxDimension, opts.maxDimension, {
        fit: 'inside',
        withoutEnlargement: true
      })
    }

    const buffer = await sharpInstance.ensureAlpha().raw().toBuffer({ resolveWithObject: true })

    this._imageData = {
      data: buffer.data,
      width: buffer.info.width,
      height: buffer.info.height
    }

    return this;
  }

  update (imageData: ImageData): void {

  }

  getPixelCount (): number {
    return this._imageData.width * this._imageData.height
  }

  getImageData (): ImageData {
    return this._imageData
  }

  cleanup (): void {

  }
}
