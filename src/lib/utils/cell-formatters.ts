import type { Config, BadgeVariant, LinkType } from '../../types/config.types.ts';
import type { InferredColumnSchema } from '../../types/core.types.ts';
import { parseDateStringToDateObject, formatDateObjectToString } from './date-utils.ts';
import { splitStringBySeparator } from './string-utils.ts';

export type FormattedCellValue =
  | { type: 'text'; value: string }
  | { type: 'badge'; value: string; color: string; variant: BadgeVariant }
  | { type: 'chips'; values: string[] }
  | { type: 'link'; value: string; linkType: LinkType; href: string }
  | { type: 'date'; value: string; originalValue: string };

function buildLinkHref(value: string, linkType: LinkType): string {
  switch (linkType) {
    case 'mailto':
      return `mailto:${value}`;
    case 'tel':
      return `tel:${value}`;
    case 'url':
      return value;
  }
}

export function formatCellValueForDisplay(
  value: string,
  columnName: string,
  config: Config,
  schema: InferredColumnSchema[],
): FormattedCellValue {
  const formatConfig = config.columns?.formats?.[columnName];
  const colSchema = schema.find((s) => s.columnName === columnName);

  // Appliquer le format configuré
  if (formatConfig) {
    switch (formatConfig.type) {
      case 'date': {
        const inputFormat = formatConfig.inputFormat;
        const outputFormat = formatConfig.outputFormat ?? 'DD/MM/YYYY';
        const dateObj = parseDateStringToDateObject(value, inputFormat);
        if (dateObj) {
          return {
            type: 'date',
            value: formatDateObjectToString(dateObj, outputFormat),
            originalValue: value,
          };
        }
        return { type: 'text', value };
      }
      case 'badge': {
        const badgeConfig = formatConfig.map[value];
        if (badgeConfig) {
          return {
            type: 'badge',
            value,
            color: badgeConfig.color,
            variant: badgeConfig.variant,
          };
        }
        return { type: 'text', value };
      }
      case 'splitBadges': {
        const parts = splitStringBySeparator(value, formatConfig.separator);
        return { type: 'chips', values: parts };
      }
      case 'link': {
        return {
          type: 'link',
          value,
          linkType: formatConfig.linkType,
          href: buildLinkHref(value, formatConfig.linkType),
        };
      }
    }
  }

  // Fallback auto selon le type inféré
  if (colSchema) {
    if (colSchema.detectedType === 'date') {
      const dateObj = parseDateStringToDateObject(value);
      if (dateObj) {
        return {
          type: 'date',
          value: formatDateObjectToString(dateObj, 'DD/MM/YYYY'),
          originalValue: value,
        };
      }
    }

    if (colSchema.detectedType === 'multi' && colSchema.separatorCharacter) {
      const parts = splitStringBySeparator(value, colSchema.separatorCharacter);
      return { type: 'chips', values: parts };
    }
  }

  return { type: 'text', value };
}
