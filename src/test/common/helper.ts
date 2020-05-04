/* eslint-env mocha */
import { expect } from 'chai'
import type { PaletteResult, VibrantStatic, ImageDimensions } from '../../typing'
import Builder from '../../builder'
import { Palette, Swatch } from '../../color'
import util = require('../../util')
import type {
  TestSample, SamplePathKey
} from './data'

import { table, getBorderCharacters } from 'table'

type Env = 'node'

const TABLE_OPTS = {
  border: getBorderCharacters('void')
}

const displayColorDiffTable = (diff: string[][]) => {
  console.log(table(diff, TABLE_OPTS))
}

const assertDimensions = (reference: ImageDimensions, dimensions: ImageDimensions) => {
  expect(dimensions, 'dimensions should be returned').not.to.be.null

  expect(dimensions.width, `width is not correct`).to.eq(reference.width)
  expect(dimensions.height, `height is not correct`).to.eq(reference.height)
}

const assertPalette = (reference: Palette, palette: Palette) => {
  expect(palette, 'palette should be returned').not.to.be.null

  let failCount = 0
  const compare = (name: string, expected: Swatch, actual: Swatch) => {
    let result = {
      status: 'N/A',
      diff: -1
    }

    if (expected === null) {
      if (actual !== null) {
        console.warn(`WARN: ${name} color was not expected. Got ${actual.hex}`)
      }
    } else {
      expect(actual, `${name} color was expected`).not.to.be.null
      let diff = util.rgbDiff(actual.rgb, expected.rgb)
      result.diff = diff
      result.status = util.getColorDiffStatus(diff)
      if (diff > util.DELTAE94_DIFF_STATUS.SIMILAR) { failCount++ }
    }

    return result
  }

  const names = Object.keys(palette)
  const nameRow = [''].concat(names)
  const actualRow = ['Actual']
  const expectedRow = ['Expected']
  const scoreRow = ['Score']
  for (const name of names) {
    const actual = palette[name]
    const expected = reference[name]
    actualRow.push(actual ? actual.hex : null!)
    expectedRow.push(expected ? util.rgbToHex(...expected.rgb) : null!)
    const r = compare(name, expected!, actual!)
    scoreRow.push(`${r.status}(${r.diff.toPrecision(2)})`)
  }

  // Display diff table only when necessary
  if (failCount > 0) {
    displayColorDiffTable([nameRow, actualRow, expectedRow, scoreRow])
  }

  expect(failCount, `${failCount} colors are too diffrent from reference palettes`)
    .to.equal(0)
}

function assertResult(env: Env, sample: TestSample, result: PaletteResult) {
  assertDimensions(sample.dimensions, result.imageDimensions)
  assertPalette(sample.palettes[env], result.palette)
}

const paletteCallback = (env: Env, sample: TestSample, done: Mocha.Done) =>
  (err?: Error, result?: PaletteResult) => {
    setTimeout(() => {

      expect(err, `should not throw error '${err}'`).to.be.null
      assertResult(env, sample, result!)

      done()
    }, 0)
  }

export const testVibrant = (
  Vibrant: VibrantStatic,
  sample: TestSample,
  pathKey: SamplePathKey,
  env: Env,
  builderCallback: (b: Builder) => Builder = null!
) => (done: Mocha.Done) => {
  let builder = Vibrant.from(sample[pathKey]).quality(1)

  if (typeof builderCallback === 'function') {
    builder = builderCallback(builder)
  }

  builder.getPalette(paletteCallback(env, sample, done))
}

export const testVibrantAsPromised = (
  Vibrant: VibrantStatic,
  sample: TestSample,
  pathKey: SamplePathKey,
  env: Env,
  builderCallback: (b: Builder) => Builder = null!
) => {
  return () => {
    let builder = Vibrant.from(sample[pathKey]).quality(1)

    if (typeof builderCallback === 'function') builder = builderCallback(builder)

    return builder.getPalette().then(result => assertResult(env, sample, result))
  }
}
