/**
 * Типы для стилей
 * Интерфейсы и типы для работы со стилями блоков
 */

import { Breakpoint, ResponsiveStyles } from '@/utils/responsiveUtils';

export type StyleUnit = 'px' | 'em' | 'rem' | '%' | 'vh' | 'vw' | 'pt' | 'pc' | 'in' | 'cm' | 'mm' | 'ex' | 'ch' | 'vmin' | 'vmax';

export type DisplayType = 'block' | 'flex' | 'grid' | 'inline' | 'inline-block' | 'inline-flex' | 'none';

export type PositionType = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';

export type OverflowType = 'visible' | 'hidden' | 'scroll' | 'auto';

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';

export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

export type JustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';

export type AlignItems = 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';

export type AlignContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'stretch';

export type TextAlign = 'left' | 'right' | 'center' | 'justify';

export type FontWeight = '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';

export type FontStyle = 'normal' | 'italic' | 'oblique';

export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';

export type TextDecoration = 'none' | 'underline' | 'overline' | 'line-through';

export interface StyleValue {
  value: string | number;
  unit?: StyleUnit;
}

export interface BaseStyles {
  display?: DisplayType;
  position?: PositionType;
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  minHeight?: string | number;
  maxWidth?: string | number;
  maxHeight?: string | number;
  margin?: string | number;
  marginTop?: string | number;
  marginRight?: string | number;
  marginBottom?: string | number;
  marginLeft?: string | number;
  padding?: string | number;
  paddingTop?: string | number;
  paddingRight?: string | number;
  paddingBottom?: string | number;
  paddingLeft?: string | number;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  color?: string;
  fontSize?: string | number;
  fontFamily?: string;
  fontWeight?: FontWeight;
  fontStyle?: FontStyle;
  lineHeight?: string | number;
  letterSpacing?: string | number;
  textAlign?: TextAlign;
  textTransform?: TextTransform;
  textDecoration?: TextDecoration;
  border?: string;
  borderWidth?: string | number;
  borderStyle?: string;
  borderColor?: string;
  borderRadius?: string | number;
  boxShadow?: string;
  opacity?: number;
  zIndex?: number;
  overflow?: OverflowType;
  overflowX?: OverflowType;
  overflowY?: OverflowType;
  cursor?: string;
  transition?: string;
  transform?: string;
}

export interface FlexStyles {
  display?: 'flex' | 'inline-flex';
  flexDirection?: FlexDirection;
  flexWrap?: FlexWrap;
  justifyContent?: JustifyContent;
  alignItems?: AlignItems;
  alignContent?: AlignContent;
  gap?: string | number;
  rowGap?: string | number;
  columnGap?: string | number;
  flex?: string | number;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: string | number;
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  order?: number;
}

export interface GridStyles {
  display?: 'grid' | 'inline-grid';
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridTemplateAreas?: string;
  gridColumn?: string;
  gridRow?: string;
  gridArea?: string;
  gap?: string | number;
  rowGap?: string | number;
  columnGap?: string | number;
  justifyItems?: 'start' | 'end' | 'center' | 'stretch';
  alignItems?: 'start' | 'end' | 'center' | 'stretch';
  justifyContent?: JustifyContent;
  alignContent?: AlignContent;
  placeItems?: string;
  placeContent?: string;
}

export interface TypographyStyles {
  fontFamily?: string;
  fontSize?: string | number;
  fontWeight?: FontWeight;
  fontStyle?: FontStyle;
  lineHeight?: string | number;
  letterSpacing?: string | number;
  textAlign?: TextAlign;
  textTransform?: TextTransform;
  textDecoration?: TextDecoration;
  color?: string;
}

export interface BorderStyles {
  border?: string;
  borderWidth?: string | number;
  borderStyle?: string;
  borderColor?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRadius?: string | number;
  borderTopLeftRadius?: string | number;
  borderTopRightRadius?: string | number;
  borderBottomLeftRadius?: string | number;
  borderBottomRightRadius?: string | number;
}

export interface ShadowStyles {
  boxShadow?: string;
  textShadow?: string;
}

export interface BackgroundStyles {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  backgroundAttachment?: string;
  backgroundClip?: string;
  backgroundOrigin?: string;
}

export interface EffectStyles {
  opacity?: number;
  filter?: string;
  backdropFilter?: string;
  transform?: string;
  transition?: string;
  animation?: string;
}

export interface BlockStyles extends BaseStyles, Partial<FlexStyles>, Partial<GridStyles>, Partial<TypographyStyles>, Partial<BorderStyles>, Partial<ShadowStyles>, Partial<BackgroundStyles>, Partial<EffectStyles> {
  [key: string]: unknown;
}

export interface ResponsiveBlockStyles {
  base?: BlockStyles;
  responsive?: ResponsiveStyles;
}

export interface StylePreset {
  id: string;
  name: string;
  category: string;
  styles: BlockStyles;
  description?: string;
}

export interface StyleTheme {
  id: string;
  name: string;
  colors: Record<string, string>;
  typography: TypographyStyles;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}

