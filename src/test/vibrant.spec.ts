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
      it(`${sample.name} (callback)`, testVibrant(Vibrant, sample, 'filePath', 'node'))
      it(`${sample.name} (Promise)`, testVibrantAsPromised(Vibrant, sample, 'filePath', 'node'))
    })
  )
})
