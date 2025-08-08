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

