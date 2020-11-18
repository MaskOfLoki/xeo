export interface IGradientStep {
  color: string;
  position: number;
}

export enum GradientType {
  Linear,
  Circular,
  Ellipse,
}

export enum GradientDirection {
  ToBottom = 'to bottom',
  ToTop = 'to top',
  ToRight = 'to right',
  ToLeft = 'to left',
  ToBottomRight = 'to bottom right',
  ToBottomLeft = 'to bottom left',
  ToTopRight = 'to top right',
  ToTopLeft = 'to top left',
  FromCenter = '',
}

export interface IGradientData {
  type: GradientType;
  direction: GradientDirection;
  steps: IGradientStep[];
  generatedStyle?: string;
}
