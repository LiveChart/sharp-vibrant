import { Filter, Image, ImageData, ImageSource, ComputedOptions } from '../typing'

export abstract class ImageBase implements Image {
  abstract load(image: ImageSource, opts: ComputedOptions): Promise<ImageBase>
  abstract update(imageData: ImageData): void
  abstract getPixelCount(): number
  abstract getImageData(): ImageData
  abstract cleanup(): void

  applyFilter (filter: Filter): Promise<ImageData> {
    let imageData = this.getImageData()

    if (typeof filter === 'function') {
      let pixels = imageData.data
      let n = pixels.length / 4
      let offset, r, g, b, a
      for (let i = 0; i < n; i++) {
        offset = i * 4
        r = pixels[offset + 0]
        g = pixels[offset + 1]
        b = pixels[offset + 2]
        a = pixels[offset + 3]
        // Mark ignored color
        if (!filter(r, g, b, a)) pixels[offset + 3] = 0
      }
    }

    return Promise.resolve(imageData)
  }
}
