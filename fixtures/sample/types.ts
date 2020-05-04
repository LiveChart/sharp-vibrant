import type { Palette } from '../../src/color';
import type { Sharp } from 'sharp';
import type { ImageDimensions } from '../../src/typing';

export interface Sample {
  name: string
  sharp: Sharp
  filePath: string
  dimensions: ImageDimensions
  palettes: {
    [env: string]: Palette
  };
}

export interface SampleContext {
  current: Sample[]
  snapshot: Sample[] | null
}