/* eslint-env mocha */
import {
  SAMPLES
} from './common/data'
import {
  testVibrant,
  testVibrantAsPromised
} from './common/helper'

import Vibrant = require('../')

describe('Palette Extraction', () => {
  describe('process samples', () =>
    SAMPLES.forEach((sample) => {
      it(`${sample.name} via sharp (callback)`, testVibrant(Vibrant, sample, 'sharp', 'node'))
      it(`${sample.name} via sharp (Promise)`, testVibrantAsPromised(Vibrant, sample, 'sharp', 'node'))
      it(`${sample.name} via file path (callback)`, testVibrant(Vibrant, sample, 'filePath', 'node'))
      it(`${sample.name} via file path (Promise)`, testVibrantAsPromised(Vibrant, sample, 'filePath', 'node'))
    })
  )
})
