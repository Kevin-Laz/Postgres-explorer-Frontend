import { Table } from '../../data/interface/table.interface';
import { RESERVED } from '../../data/types/reserved.type';

// Lista de palabras reservadas comunes en PostgreSQL
const reserved = RESERVED;

export function validateTableNames(
  tables: Table[],
  errors: Record<string, string[]>
) {
  const seen: Record<string, string[]> = {};

  tables.forEach(t => {
    const name = t.name.trim();
    const normalized = name.toLowerCase();

    if (!name) {
      errors[t.id] = [...(errors[t.id] ?? []), 'El nombre de la tabla no puede estar vacío.'];
      return;
    }

    if (name.length > 63) {
      errors[t.id] = [...(errors[t.id] ?? []), 'El nombre de la tabla no puede exceder 63 caracteres.'];
    }

    if (!/^[a-z_][a-z0-9_]*$/.test(normalized)) {
      errors[t.id] = [...(errors[t.id] ?? []), 'El nombre de la tabla solo puede contener letras, números y guiones bajos, y no puede empezar con un número.'];
    }

    if (reserved.has(normalized)) {
      errors[t.id] = [...(errors[t.id] ?? []), `El nombre "${name}" es una palabra reservada en PostgreSQL.`];
    }

    if (!seen[normalized]) seen[normalized] = [];
    seen[normalized].push(t.id);
  });

  // duplicados
  for (const ids of Object.values(seen)) {
    if (ids.length > 1) {
      ids.forEach(id => {
        errors[id] = [...(errors[id] ?? []), 'Nombre de tabla duplicado en el esquema.'];
      });
    }
  }
}
