import { Column } from "./column.interface";

export interface Table{
  name: string,
  columns: Column[]
}

export interface TableElement{
  type: 'table' | 'column'; index?: number
}
