# sharp-vibrant

Extract prominent colors from an image in nodejs using [sharp](https://sharp.pixelplumbing.com/) for image loading/processing.

This is a fork of [node-vibrant](https://github.com/Vibrant-Colors/node-vibrant) that reduces dependencies/complexity at the cost of absolutely no browser support. This fork was created for internal use and is not published to any package manager.

## Usage
### node.js

```js
// ES5
var Vibrant = require('sharp-vibrant')
// ES6
import * as Vibrant from '@livechart/sharp-vibrant'
// TypeScript
import Vibrant = require('@livechart/sharp-vibrant')

// Using builder
Vibrant.from('path/to/image').getPalette((err, palette) => console.log(palette))
// Promise
Vibrant.from('path/to/image').getPalette()
  .then((palette) => console.log(palette))

// Using constructor
let v = new Vibrant('path/to/image', opts)
v.getPalette((err, palette) => console.log(palette))
// Promise
v.getPalette().then((palette) => console.log(palette))
```

## Contribution Guidelines
1. Make changes
2. Write test specs if necessary
3. Pass tests
4. Commit **source files only** (without compiled files)

## References

### `Vibrant`
Main class of `sharp-vibrant`.

#### `Vibrant.from(src: ImageSource): Builder`
Make a `Builder` for an image. Returns a `Builder` instance.

#### `constructor(src: ImageSource, opts: Partial<Options>)`

Name    |  Description
------- |  ---------------------------------------
`image` |  Path to image file (support HTTP/HTTPs)
`opts`  |  Options (optional)

##### `ImageSource`

```ts
export type ImageSource = string | Buffer
```

##### `Options`

```ts
export interface Options {
    colorCount: number
    quality: number
    maxDimension: number
    filters: Array<Filter>
    ImageClass: ImageClass
    quantizer: Quantizer
    generator?: Generator
}
```

Field          | Default                         | Description
-------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------
`colorCount`   | 64                              | amount of colors in initial palette from which the swatches will be generated
`quality`      | 5                               | Scale down factor used in downsampling stage. `1` means no downsampling. If `maxDimension` is set, this value will not be used.
`maxDimension` | `undefined`                     | The max size of the image's longer side used in downsampling stage. This field will override `quality`.
`filters`      | `[]`                            | An array of filters
`ImageClass`   | `Image.Node`                    | An `Image` implementation class
`quantizer`    | `Vibrant.Quantizer.MMCQ`        | A `Quantizer` implementation class
`generator`    | `Vibrant.Generator.Default`     | An `Generator` instance

##### `Resolvable<T>`

```ts
export type Resolvable<T> = T | Promise<T>
```

##### `Quantizer`

```ts
export interface Quantizer {
    (pixels: Pixels, opts: Options): Resolvable<Array<Swatch>>
}
```

##### `Generator`

```ts
export interface Generator {
    (swatches: Array<Swatch>, opts?: Object): Resolvable<Palette>
}
```

##### `Filter`

Returns `true` if the color is to be kept.

```ts
export interface Filter {
    (red: number, green: number, blue: number, alpha: number): boolean
}
```

##### `getPalette(cb?: Callback<PaletteResult>): Promise<PaletteResult>`

Name | Description
---- | -----------------
`cb` | (Optional) callback function. Can be omitted when using `Promise`.

##### `Callback<T>`

```ts
export interface Callback<T> {
    (err?: Error, result?: T): void
}
```

##### `ImageDimensions`

```ts
interface ImageDimensions {
    readonly width: number
    readonly height: number
}
```

##### `PaletteResult`

```ts
interface PaletteResult {
    readonly pixelCount: number
    readonly imageDimensions: ImageDimensions
    readonly palette: Palette
}
```

#### `Vibrant.Builder`
Helper class for change configurations and create a `Vibrant` instance. Methods of a `Builder` instance can be chained like:

```ts
Vibrant.from(src)
  .quality(1)
  .clearFilters()
  // ...
  .getPalette()
  .then((paletteResult) => {})
```

#### `constructor(src: ImageSource, opts: Partial<Options>)`
Arguments are the same as `Vibrant.constructor`.

#### `quality(q: number): Builder`
Sets `opts.quality` to `q`. Returns this `Builder` instance.

#### `maxColorCount(n: number): Builder`
Sets `opts.colorCount` to `n`. Returns this `Builder` instance.

#### `maxDimension(d: number): Builder`
Sets `opts.maxDimension` to `d`. Returns this `Builder` instance.

#### `addFilter(f: Filter): Builder`
Adds a filter function. Returns this `Builder` instance.

#### `removeFilter(f: Filter): Builder`
Removes a filter function. Returns this `Builder` instance.

#### `clearFilters(): Builder`
Clear all filters. Returns this `Builder` instance.

#### `useImageClass(imageClass: ImageClass): Builder`
Specifies which `Image` implementation class to use. Returns this `Builder` instance.

#### `useQuantizer(quantizer: Quantizer): Builder`
Specifies which `Quantizer` implementation class to use. Returns this `Builder` instance.

#### `useGenerator(generator: Generator): Builder`
Sets `opts.generator` to `generator`. Returns this `Builder` instance.

#### `build(): Vibrant`
Builds and returns a `Vibrant` instance as configured.

#### `getPalette(cb?: Callback<PaletteResult>): Promise<PaletteResult>`
Builds a `Vibrant` instance as configured and calls its `getPalette` method.

### `Vibrant.Swatch`
Represents a color swatch generated from an image's palette.

#### `Vec3`

```ts
export interface Vec3 extends Array<number> {
    0: number,
    1: number,
    2: number
}
```

#### `constructor(rgb: Vec3, population: number)`
Internal use.

Name         | Description
------------ | -----------------------------------
`rgb`        | `[r, g, b]`
`population` | Population of the color in an image

#### `getHsl(): Vec3`
#### `getPopulation(): number`
#### `getRgb(): Vec3`
#### `getHex(): string`
#### `getTitleTextColor(): string`
Returns an appropriate color to use for any 'title' text which is displayed over this `Swatch`'s color.

#### `getBodyTextColor(): string`
Returns an appropriate color to use for any 'body' text which is displayed over this `Swatch`'s color.

### `Vibrant.Util`
Utility methods. Internal usage.

#### `hexToRgb(hex: string): Vec3`
#### `rgbToHex(r: number, g: number, b: number): string`
#### `hslToRgb(h: number, s: number, l: number): Vec3`
#### `rgbToHsl(r: number, g: number, b: number): Vec3`
#### `xyzToRgb(x: number, y: number, z: number): Vec3`
#### `rgbToXyz(r: number, g: number, b: number): Vec3`
#### `xyzToCIELab(x: number, y: number, z: number): Vec3`
#### `rgbToCIELab(l: number, a: number, b: number): Vec3`
#### `deltaE94(lab1: number, lab2: number): number`
Computes CIE delta E 1994 diff between `lab1` and `lab2`. The 2 colors are in CIE-Lab color space. Used in tests to compare 2 colors' perceptual similarity.

#### `rgbDiff(rgb1: Vec3, rgb2: Vec3): number`
Compute CIE delta E 1994 diff between `rgb1` and `rgb2`.

#### `hexDiff(hex1: string, hex2: string): number`
Compute CIE delta E 1994 diff between `hex1` and `hex2`.

#### `getColorDiffStatus(d: number): string`
Gets a string to describe the meaning of the color diff. Used in tests.

Delta E  | Perception                             | Returns
-------- | -------------------------------------- | -----------
<= 1.0   | Not perceptible by human eyes.         | `"Perfect"`
1 - 2    | Perceptible through close observation. | `"Close"`
2 - 10   | Perceptible at a glance.               | `"Good"`
11 - 49  | Colors are more similar than opposite  | `"Similar"`
50 - 100 | Colors are exact opposite              | `Wrong`

## NPM Tasks

Task            | Description
--------------- | --------------------------------------
`build:node`    | Build node.js target
`build`         | Build all targets
`clean:node`    | Clean node.js build
`clean`         | Clean all builds
`test:node`     | Run node.js specs (mocha)
`test`          | Run all specs
