import { Table } from '../../data/interface/table.interface';
import { SIMPLE_TYPES, PARAM_TYPES } from '../../data/interface/pg-types';

export function validateColumnTypes(
  tables: Table[],
  errors: Record<string, string[]>
) {
  const validSimple = new Set(SIMPLE_TYPES.map(t => t.toLowerCase()));
  const validParam  = new Set(PARAM_TYPES.map(t => t.toLowerCase()));

  for (const table of tables) {
    table.columns.forEach((col) => {
      const type = col.type?.trim().toLowerCase();
      if (!type) {
        errors[table.id] = [...(errors[table.id] ?? []), `Columna "${col.name}" no tiene tipo asignado.`];
        return;
      }

      const base = type.split('(')[0].trim();

      if (validSimple.has(base)) return;

      if (validParam.has(base)) {
        const paramMatch = type.match(/\((\d+)\)/);
        if (!paramMatch) {
          errors[table.id] = [...(errors[table.id] ?? []), `Columna "${col.name}" requiere un parámetro para el tipo ${base}.`];
        } else {
          const paramVal = parseInt(paramMatch[1], 10);
          if (isNaN(paramVal) || paramVal <= 0) {
            errors[table.id] = [...(errors[table.id] ?? []), `Columna "${col.name}" tiene un parámetro inválido (${paramMatch[1]}).`];
          }
        }
        return;
      }

      errors[table.id] = [...(errors[table.id] ?? []), `Columna "${col.name}" tiene un tipo inválido: ${col.type}.`];
    });
  }
}
