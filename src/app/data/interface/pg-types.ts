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
