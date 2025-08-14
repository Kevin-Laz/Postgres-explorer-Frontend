import { Column } from "./column.interface";

export interface Table{
  name: string,
  columns: Column[],
  x?: number;
  y?: number;
  width?: number;
  height?: number;
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
