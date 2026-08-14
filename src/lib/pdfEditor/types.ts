export type PdfFontFamily =
  | 'Helvetica'
  | 'Helvetica-Bold'
  | 'Helvetica-Oblique'
  | 'Helvetica-BoldOblique'
  | 'Times-Roman'
  | 'Times-Bold'
  | 'Times-Italic'
  | 'Times-BoldItalic'
  | 'Courier'
  | 'Courier-Bold'
  | 'Courier-Oblique'
  | 'Courier-BoldOblique';

export interface PdfTextAnnotation {
  id: string;
  pageIndex: number;
  text: string;
  /** Normalized horizontal position (0–1), left edge of text */
  x: number;
  /** Normalized vertical position (0–1), distance from top of page */
  y: number;
  fontSize: number;
  fontFamily: PdfFontFamily;
  color: string;
  /** Draw a white rectangle behind text to cover underlying content */
  coverBackground: boolean;
}

export interface PdfPageMeta {
  index: number;
  widthPt: number;
  heightPt: number;
  previewUrl: string;
  aspect: number;
}

export interface PdfTextDefaults {
  fontSize: number;
  fontFamily: PdfFontFamily;
  color: string;
  coverBackground: boolean;
}

export const DEFAULT_TEXT_STYLE: PdfTextDefaults = {
  fontSize: 14,
  fontFamily: 'Helvetica',
  color: '#000000',
  coverBackground: false,
};
