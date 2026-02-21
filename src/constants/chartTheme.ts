export const CHART_COLORS = [
  '#3B82F6',
  '#8B5CF6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#6366F1',
  '#14B8A6',
  '#F97316',
] as const;

export const CHART_SURFACE_COLORS = {
  grid: '#374151',
  axis: '#9CA3AF',
  tooltipBackground: '#1F2937',
  tooltipText: '#F9FAFB',
} as const;

export const DEFAULT_TOOLTIP_STYLE = {
  backgroundColor: CHART_SURFACE_COLORS.tooltipBackground,
  border: `1px solid ${CHART_SURFACE_COLORS.grid}`,
  borderRadius: '8px',
  color: CHART_SURFACE_COLORS.tooltipText,
};
