import { Injectable } from '@angular/core';
import { Table } from '../../data/interface/table.interface';
import { clamp } from '../utils/schema.utils';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  create(tables: Table[], name: string, p:{x:number;y:number}, width:number, canvas:{w:number;h:number}) {
    const id = crypto.randomUUID?.() ?? String(Date.now());
    const w = Math.max(120, Math.min(width, Math.max(200, canvas.w-16)));
    const x = clamp(p.x, 0, Math.max(0, canvas.w - w));
    const y = clamp(p.y, 0, Math.max(0, canvas.h - 100));
    tables.push({ id, name, columns: [{ name: 'col1', type: 'str' }], x, y, width: w });
    return id;
  }
  duplicate(tables: Table[], id: string) { /* copia + offset */ }
  remove(tables: Table[], id: string) { /* splice */ }
}
