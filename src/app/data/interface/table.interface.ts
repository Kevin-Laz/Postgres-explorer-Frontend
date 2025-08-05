import { Column } from "./column.interface";

export interface Table{
  name: string,
  columns: Column[]
}
