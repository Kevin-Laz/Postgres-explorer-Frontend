import { Column } from "./column.interface";

export interface Table{
  id: string,
  name: string,
  columns: Column[],
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface TableGhost{
  active: boolean;
  x: number;
  y: number;
  width: number;
  table: Table;
  overSchema: boolean;
}

export interface TableElement{
  type: 'table' | 'column'; index?: number
}

export interface Pos{
  x: number;
  y: number;
}

export interface Size{
  width: number;
  height: number;
}

