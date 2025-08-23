export const SIMPLE_TYPES = [
  'INT', 'INTEGER', 'BIGINT', 'TEXT', 'BOOLEAN', 'DATE', 'TIMESTAMP', 'SERIAL', 'UUID'
];

export const PARAM_TYPES = [
  'VARCHAR', 'CHAR', 'DECIMAL', 'NUMERIC', 'FLOAT'
];

export interface PgType {
  base: string;   // nombre del tipo
  param?: number | string;  // parámetro opcional
}

export interface TypeRule {
  min: number;
  max: number;
  default: number;
}

export const TYPE_RULES: Record<string, TypeRule> = {
  varchar: { min: 1, max: 65535, default: 255 },
  char:    { min: 1, max: 255,   default: 1 },
  decimal: { min: 1, max: 38,    default: 10 },
  numeric: { min: 1, max: 38,    default: 10 },
  float:   { min: 1, max: 53,    default: 24 },
};
