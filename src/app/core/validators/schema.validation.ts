import { Table } from '../../data/interface/table.interface';
import { validateTableNames } from './validateTableNames';
import { validateColumnTypes } from './validateColumnTypes';
import { validateTableColumns } from './validateTableColumns';

export function validateSchema(tables: Table[]): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  validateTableNames(tables, errors);
  validateTableColumns(tables, errors);
  validateColumnTypes(tables, errors);

  return errors;
}
