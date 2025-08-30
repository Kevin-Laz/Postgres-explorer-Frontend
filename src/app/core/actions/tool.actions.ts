//Falta desestructurar por archivo // Por ahora todo esta en un solo lugar

import { ToolAction, ToolKind } from "../../data/enums/tool.enum";



// Coordenadas absolutas del cursor (pantalla)
export type ScreenPoint = { clientX: number; clientY: number };

// TABLE: payloads
export type CreateTablePayload = {
  at?: ScreenPoint;      // dónde se hizo click (para el ghost)
  name?: string;
  width?: number;
};
export type EditTablePayload      = { id?: string };
export type DeleteTablePayload    = { id?: string };
export type DuplicateTablePayload = {
  id?: string;
  at?: ScreenPoint;
  name?: string;
  width?: number;
};
export type DetailsTablePayload   = { id?: string };

// COLUMN: payloads
export type CreateColumnPayload = {
  tableId?: string;
  name?: string;
  type?: string;
  index?: number;
}
export type EditColumnPayload = { id?: string}
export type DeleteColumnPayload = { id?: string}


// TABLE: comandos
export type TableCreateCmd   = { kind: ToolKind.Table; action: ToolAction.Create;   payload: CreateTablePayload };
export type TableEditCmd     = { kind: ToolKind.Table; action: ToolAction.Edit;     payload: EditTablePayload };
export type TableDeleteCmd   = { kind: ToolKind.Table; action: ToolAction.Delete;   payload: DeleteTablePayload };
export type TableDuplicateCmd= { kind: ToolKind.Table; action: ToolAction.Duplicate;payload: DuplicateTablePayload };
export type TableDetailsCmd  = { kind: ToolKind.Table; action: ToolAction.Details;  payload: DetailsTablePayload };

// COLUMN: comandos
export type ColumnCreateCmd = { kind: ToolKind.Column; action: ToolAction.Create; payload: CreateColumnPayload}
export type ColumnEditCmd = { kind: ToolKind.Column; action: ToolAction.Edit; payload: EditColumnPayload}
export type ColumnDeleteCmd = { kind: ToolKind.Column; action: ToolAction.Delete; payload: DeleteColumnPayload}

// Unión de todos (por ahora solo Table)
export type ToolCommand =
  | TableCreateCmd
  | TableEditCmd
  | TableDeleteCmd
  | TableDuplicateCmd
  | TableDetailsCmd
  | ColumnCreateCmd
  | ColumnEditCmd
  | ColumnDeleteCmd


// Action creators (helpers)
export const createTableCmd = (p: CreateTablePayload = {}): TableCreateCmd => ({
  kind: ToolKind.Table,
  action: ToolAction.Create,
  payload: p,
});

export const editTableCmd = (id?: string): TableEditCmd => ({
  kind: ToolKind.Table, action: ToolAction.Edit, payload: { id }
});

export const deleteTableCmd = (id?: string): TableDeleteCmd => ({
  kind: ToolKind.Table, action: ToolAction.Delete, payload: { id }
});

export const duplicateTableCmd = (id?: string, p: CreateTablePayload = {}): TableDuplicateCmd => ({
  kind: ToolKind.Table, action: ToolAction.Duplicate, payload: { id, ...p }
});

export const detailsTableCmd = (id?: string): TableDetailsCmd    => ({
  kind: ToolKind.Table, action: ToolAction.Details, payload: { id }
});

export const createColumnCmd = (p: CreateColumnPayload = {}) : ColumnCreateCmd =>({
  kind: ToolKind.Column,
  action: ToolAction.Create,
  payload: p
})

export const deleteColumnCmd = (id?: string): ColumnDeleteCmd =>({
  kind: ToolKind.Column,
  action: ToolAction.Delete,
  payload: { id }
})


//Verificadores de funciones
export const isTableCreate = (c: ToolCommand): c is TableCreateCmd =>
  c.kind===ToolKind.Table && c.action===ToolAction.Create;

export const isTableEdit = (c: ToolCommand): c is TableEditCmd =>
  c.kind===ToolKind.Table && c.action===ToolAction.Edit;

export const isTableDelete = (c: ToolCommand): c is TableDeleteCmd =>
  c.kind===ToolKind.Table && c.action===ToolAction.Delete;

export const isTableDuplicate= (c: ToolCommand): c is TableDuplicateCmd =>
  c.kind===ToolKind.Table && c.action===ToolAction.Duplicate;

export const isTableDetails  = (c: ToolCommand): c is TableDetailsCmd =>
  c.kind===ToolKind.Table && c.action===ToolAction.Details;

export const isColumnCreate = (c: ToolCommand): c is ColumnCreateCmd =>
  c.kind === ToolKind.Column && c.action === ToolAction.Create

export const isColumnDelete = (c: ToolCommand): c is ColumnDeleteCmd =>
  c.kind === ToolKind.Column && c.action === ToolAction.Delete

// Mapper desde el Sidebar actual
export function mapSidebarToCommand(
  toolName: string,
  optionAction: string,
  ev: MouseEvent
): ToolCommand | null {
  const tool = toolName.toLowerCase();

  // Herramienta tabla
  if (tool === 'tabla') {
    switch (optionAction) {
      case 'createTable':
        return createTableCmd({ at: { clientX: ev.clientX, clientY: ev.clientY }});
      case 'editTable':
        return editTableCmd();
      case 'deleteTable':
        return deleteTableCmd();
      case 'duplicateTable':
        return duplicateTableCmd(undefined, { at: { clientX: ev.clientX, clientY: ev.clientY }});
      case 'viewTableDetails':
        return detailsTableCmd();
      default:
        return null;
    }
  }

  // Herramienta columna

  else if ( tool === 'columna'){
    switch( optionAction){
      case 'createColumn':
        return createColumnCmd();
      case 'deleteColumn':
        return deleteColumnCmd();
      default:
        return null;
    }
  }

  // Falta adicionar para relación/clave/restricción
  return null;
}
