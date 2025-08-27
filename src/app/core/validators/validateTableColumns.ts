import { Table } from '../../data/interface/table.interface';
import { RESERVED } from '../../data/types/reserved.type';

const reserved = RESERVED;

export function validateTableColumns(
  tables: Table[],
  errors: Record<string, string[]>
) {
  for (const table of tables) {
    if (table.columns.length === 0) {
      errors[table.id] = [...(errors[table.id] ?? []), 'La tabla debe tener al menos una columna.'];
      continue;
    }

    const seenCols: Set<string> = new Set();

    table.columns.forEach((col, idx) => {
      const name = col.name.trim();
      const normalized = name.toLowerCase();

      if (!name) {
        errors[table.id] = [...(errors[table.id] ?? []), `Columna #${idx + 1} no puede estar vacía.`];
        return;
      }

      if (name.length > 63) {
        errors[table.id] = [...(errors[table.id] ?? []), `Columna "${col.name}" no puede exceder 63 caracteres.`];
      }

      if (!/^[a-z_][a-z0-9_]*$/.test(normalized)) {
        errors[table.id] = [...(errors[table.id] ?? []), `Columna "${col.name}" tiene un nombre inválido (solo letras, números y guiones bajos, no puede empezar con número).`];
      }

      if (reserved.has(normalized)) {
        errors[table.id] = [...(errors[table.id] ?? []), `Columna "${col.name}" es una palabra reservada en PostgreSQL.`];
      }

      if (seenCols.has(normalized)) {
        errors[table.id] = [...(errors[table.id] ?? []), `Columna duplicada: "${col.name}".`];
      } else {
        seenCols.add(normalized);
      }
    });
  }
}
