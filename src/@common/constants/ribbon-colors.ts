export const RIBBON_COLORS_CYCLE = [
  'red', 'brown', 'black', 'green', 'blue', 'white', 'yellow', 'lilac',
] as const;

export const RIBBON_COLOR_SPECIAL = 'orange' as const;

export const RIBBON_COLORS = [...RIBBON_COLORS_CYCLE, RIBBON_COLOR_SPECIAL] as const;

export type RibbonColor = (typeof RIBBON_COLORS)[number];

export const RIBBON_COLOR_HEX: Record<RibbonColor, string> = {
  red: '#ef4444',
  brown: '#92400e',
  black: '#374151',
  green: '#22c55e',
  blue: '#3b82f6',
  white: '#f3f4f6',
  yellow: '#eab308',
  lilac: '#a78bfa',
  orange: '#f97316',
};

export const RIBBON_COLOR_LABELS: Record<RibbonColor, string> = {
  red: 'Roja',
  brown: 'Marrón',
  black: 'Negra',
  green: 'Verde',
  blue: 'Azul',
  white: 'Blanca',
  yellow: 'Amarilla',
  lilac: 'Lila',
  orange: 'Naranja',
};
