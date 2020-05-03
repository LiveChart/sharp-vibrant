import path from 'path';

import { Sample } from '../../../fixtures/sample/types'
export const SNAPSHOT: Sample[] = require('../../../fixtures/sample/images/palettes.json')

export interface TestSample extends Sample {
  relativeUrl: string
}

export type SamplePathKey = Exclude<keyof TestSample, 'palettes'>

export const SAMPLES: TestSample[] = SNAPSHOT.map((s) => Object.assign(s, {
  filePath: path.join(__dirname, '../../../fixtures/sample/images/', s.name),
  relativeUrl: `base/fixtures/sample/images/${s.name}`
}))
