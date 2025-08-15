export interface ToolOption{
  name: string;
  icon: string;
  action: string;
}

export interface Tool{
  name: string,
  label: string,
  icon: string,
  options: ToolOption[];
}

export interface EventOption{
  action: string;
  evento: MouseEvent;
}

export interface EventOptionWithTool extends EventOption { tool: string; }


export const TOOLS: Tool[] = [
    {
      name: 'tabla',
      label: 'Tabla',
      icon: 'icon-table',
      options: [
        { name: 'Crear', icon: 'create-icon', action: 'createTable' },
        { name: 'Editar', icon: 'edit-icon', action: 'editTable' },
        { name: 'Eliminar', icon: 'delete-icon', action: 'deleteTable'},
        { name: 'Duplicar', icon: 'duplicate-icon', action: 'duplicateTable'},
        { name: 'Detalles', icon: 'details-icon', action: 'viewTableDetails'}
      ]
    },

    {
      name: 'Columna',
      label: 'Columna',
      icon: 'icon-column',
      options: [
        { name: 'Crear', icon: 'create-icon', action: 'createColumn' },
        { name: 'Editar', icon: 'edit-icon', action: 'editColumn' },
        { name: 'Eliminar', icon: 'delete-icon', action: 'deleteColumn'},
        { name: 'Reordenar', icon: 'reorder-icon', action: 'reorderColumn'},
        { name: 'Detalles', icon: 'details-icon', action: 'viewColumnDetails'}
      ]
    },

    {
      name: 'relacion',
      label: 'Relación',
      icon: 'icon-relationship',
      options: [
        { name: 'Crear', icon: 'create-icon', action: 'createRelation' },
        { name: 'Editar', icon: 'edit-icon', action: 'editRelation' },
        { name: 'Eliminar', icon: 'delete-icon', action: 'deleteRelation'},
        { name: 'Detalles', icon: 'details-icon', action: 'viewColumnDetails'}
      ]
    },

    {
      name: 'clave',
      label: 'Clave',
      icon: 'icon-primary',
      options: [
        { name: 'Crear', icon: 'create-icon', action: 'createPrimaryKey' },
        { name: 'Editar', icon: 'edit-icon', action: 'editPrimaryKey' },
        { name: 'Eliminar', icon: 'delete-icon', action: 'deletePrimaryKey'},
        { name: 'Detalles', icon: 'details-icon', action: 'viewPrimaryKeyDetails'},
      ]
    },

    {
      name: 'restriccion',
      label: 'Restricción',
      icon: 'icon-constraint',
      options: [
        { name: 'Crear', icon: 'create-icon', action: 'createConstraint' },
        { name: 'Editar', icon: 'edit-icon', action: 'editConstraint' },
        { name: 'Eliminar', icon: 'delete-icon', action: 'deleteConstraint'},
        { name: 'Detalles', icon: 'details-icon', action: 'viewConstraintDetails'},
      ]
    },
  ]
