import { Injectable } from '@angular/core';
import { Table } from '../../data/interface/table.interface';
import { clamp } from '../utils/schema.utils';

@Injectable({
  providedIn: 'root'
})
export class TableService {

   // Crear tabla en solo en UI
  create(
    tables: Table[],
    name: string,
    p: { x: number; y: number },
    width: number,
    canvas: { w: number; h: number }
  ){
    const id = crypto.randomUUID?.() ?? String(Date.now());
    const w = Math.max(120, Math.min(width, Math.max(200, canvas.w - 16)));
    const x = clamp(p.x, 0, Math.max(0, canvas.w - w));
    const y = clamp(p.y, 0, Math.max(0, canvas.h - 100));

    const newTable: Table = {
      id,
      name,
      columns: [{ name: 'col1', type: 'varchar(32)', isPrimary: true }], // valor inicial mínimo
      x,
      y,
      width: w
    };

    tables.push(newTable);
  }




  duplicate(tables: Table[], table: Table, canvas: { w: number; h: number }) {
    const width = table.width || 180;
    const id = crypto.randomUUID?.() ?? String(Date.now());
    const w = Math.max(120, Math.min(width, Math.max(200, canvas.w - 16)));
    const x = clamp(table.x || 0 , 0, Math.max(0, canvas.w - w));
    const y = clamp(table.y || 0, 0, Math.max(0, canvas.h - 100));

    const newTable: Table = {
      id,
      name: table.name,
      columns: table.columns,
      x,
      y,
      width: w
    };
    tables.push(newTable);
  }



  remove(tables: Table[], id: string) {
    const idx = tables.findIndex(t => t.id === id);
    if (idx !== -1) {
      tables.splice(idx, 1);
    }
  }


}
