import { Palette } from '../../src/color';
import { Sharp } from 'sharp';

export interface Sample {
  name: string;
  sharp: Sharp;
  filePath: string;
  palettes: {
    [env: string]: Palette;
  };
}

export interface SampleContext {
  current: Sample[]
  snapshot: Sample[] | null
}