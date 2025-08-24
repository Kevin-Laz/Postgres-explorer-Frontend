//Falta desestructurar por archivo // Por ahora todo esta en un solo lugar

//Tipo de herramienta
export enum ToolKind{
  Table='table',
  Column='column',
  Relation='relation',
  PrimaryKey='primaryKey',
  Constraint='constraint'
}
export enum ToolAction {
  Create='create',
  Edit='edit',
  Delete='delete',
  Duplicate='duplicate',
  Reorder='reorder',
  Details='details'
}

// Coordenadas absolutas del cursor (pantalla)
export type ScreenPoint = { clientX: number; clientY: number };

// TABLE: payloads
export type CreateTablePayload = {
  at?: ScreenPoint;      // dónde se hizo click (para el ghost)
  name?: string;
  width?: number;
};
export type EditTablePayload      = { id: string };
export type DeleteTablePayload    = { id?: string };
export type DuplicateTablePayload = { id: string };
export type DetailsTablePayload   = { id: string };


// TABLE: comandos
export type TableCreateCmd   = { kind: ToolKind.Table; action: ToolAction.Create;   payload: CreateTablePayload };
export type TableEditCmd     = { kind: ToolKind.Table; action: ToolAction.Edit;     payload: EditTablePayload };
export type TableDeleteCmd   = { kind: ToolKind.Table; action: ToolAction.Delete;   payload: DeleteTablePayload };
export type TableDuplicateCmd= { kind: ToolKind.Table; action: ToolAction.Duplicate;payload: DuplicateTablePayload };
export type TableDetailsCmd  = { kind: ToolKind.Table; action: ToolAction.Details;  payload: DetailsTablePayload };


// Unión de todos (por ahora solo Table)
export type ToolCommand =
  | TableCreateCmd
  | TableEditCmd
  | TableDeleteCmd
  | TableDuplicateCmd
  | TableDetailsCmd;


// Action creators (helpers)
export const createTableCmd = (p: CreateTablePayload = {}): TableCreateCmd => ({
  kind: ToolKind.Table,
  action: ToolAction.Create,
  payload: p,
});

export const editTableCmd = (id: string): TableEditCmd => ({
  kind: ToolKind.Table, action: ToolAction.Edit, payload: { id }
});

export const deleteTableCmd = (id?: string): TableDeleteCmd => ({
  kind: ToolKind.Table, action: ToolAction.Delete, payload: { id }
});

export const duplicateTableCmd = (id: string): TableDuplicateCmd => ({
  kind: ToolKind.Table, action: ToolAction.Duplicate, payload: { id }
});

export const detailsTableCmd = (id: string): TableDetailsCmd    => ({
  kind: ToolKind.Table, action: ToolAction.Details, payload: { id }
});


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
        // Para despues, tambien falta crear los estilos para el “modo selección”
        return null;
      case 'deleteTable':
        return deleteTableCmd();
      case 'duplicateTable':
        return null;
      case 'viewTableDetails':
        return null;
      default:
        return null;
    }
  }

  // Falta adicionar para columna/relación/clave/restricción
  return null;
}
