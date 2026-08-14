import { StandardFonts } from 'pdf-lib';
import type { PdfFontFamily } from './types';

export const PDF_FONT_MAP: Record<PdfFontFamily, StandardFonts> = {
  Helvetica: StandardFonts.Helvetica,
  'Helvetica-Bold': StandardFonts.HelveticaBold,
  'Helvetica-Oblique': StandardFonts.HelveticaOblique,
  'Helvetica-BoldOblique': StandardFonts.HelveticaBoldOblique,
  'Times-Roman': StandardFonts.TimesRoman,
  'Times-Bold': StandardFonts.TimesRomanBold,
  'Times-Italic': StandardFonts.TimesRomanItalic,
  'Times-BoldItalic': StandardFonts.TimesRomanBoldItalic,
  Courier: StandardFonts.Courier,
  'Courier-Bold': StandardFonts.CourierBold,
  'Courier-Oblique': StandardFonts.CourierOblique,
  'Courier-BoldOblique': StandardFonts.CourierBoldOblique,
};

export const PDF_FONT_OPTIONS: {
  value: PdfFontFamily;
  label: string;
  css: string;
  weight?: string;
  style?: string;
}[] = [
  { value: 'Helvetica', label: 'Helvetica', css: 'Helvetica, Arial, sans-serif' },
  { value: 'Helvetica-Bold', label: 'Helvetica Bold', css: 'Helvetica, Arial, sans-serif', weight: '700' },
  { value: 'Helvetica-Oblique', label: 'Helvetica Italic', css: 'Helvetica, Arial, sans-serif', style: 'italic' },
  { value: 'Helvetica-BoldOblique', label: 'Helvetica Bold Italic', css: 'Helvetica, Arial, sans-serif', weight: '700', style: 'italic' },
  { value: 'Times-Roman', label: 'Times Roman', css: '"Times New Roman", Times, serif' },
  { value: 'Times-Bold', label: 'Times Bold', css: '"Times New Roman", Times, serif', weight: '700' },
  { value: 'Times-Italic', label: 'Times Italic', css: '"Times New Roman", Times, serif', style: 'italic' },
  { value: 'Times-BoldItalic', label: 'Times Bold Italic', css: '"Times New Roman", Times, serif', weight: '700', style: 'italic' },
  { value: 'Courier', label: 'Courier', css: 'Courier, monospace' },
  { value: 'Courier-Bold', label: 'Courier Bold', css: 'Courier, monospace', weight: '700' },
  { value: 'Courier-Oblique', label: 'Courier Italic', css: 'Courier, monospace', style: 'italic' },
  { value: 'Courier-BoldOblique', label: 'Courier Bold Italic', css: 'Courier, monospace', weight: '700', style: 'italic' },
];

export function cssFontForFamily(family: PdfFontFamily): {
  fontFamily: string;
  fontWeight?: string;
  fontStyle?: string;
} {
  const option = PDF_FONT_OPTIONS.find((item) => item.value === family) ?? PDF_FONT_OPTIONS[0];
  return {
    fontFamily: option.css,
    fontWeight: option.weight,
    fontStyle: option.style,
  };
}
