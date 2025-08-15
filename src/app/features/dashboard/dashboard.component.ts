import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SchemaViewComponent } from '../../layout/schema-view/schema-view.component';
import { CommonModule } from '@angular/common';
import { Table } from '../../data/interface/table.interface';
import { TableBoxComponent } from '../../shared/components/table-box/table-box.component';
import { EventOption } from '../../data/interface/tool.interface';

@Component({
  selector: 'app-dashboard',
  imports: [SidebarComponent, SchemaViewComponent, CommonModule, TableBoxComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent{
  @ViewChild('schema', { read: SchemaViewComponent }) schemaView!: SchemaViewComponent;
  @ViewChild('schema', { read: ElementRef }) schemaElRef!: ElementRef<HTMLElement>;

  sidebarWidth = 475;
  private isResizing = false;
  ghost: {
    active: boolean;
    x: number;
    y: number;
    width: number;
    table: Table;
    overSchema: boolean;
  } = {
    active: false,
    x: 0,
    y: 0,
    width: 160,
    table: { id: crypto.randomUUID(), name: 'NuevaTabla', columns: [{ name: 'col1', type: 'str' }] },
    overSchema: false
  };

  startResizing(event: MouseEvent){
    this.isResizing = true;
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isResizing) return;
    const newWidth = event.clientX;
    if (newWidth >= 300 && newWidth <= 800) {
      this.sidebarWidth = newWidth;
    }
  }

  @HostListener('document:mouseup')
  stopResizing() {
    this.isResizing = false;
  }

  //tabla temporal

  onSidebarAction(evt: EventOption){
    if(evt.action === 'createTable'){
      if(this.ghost.active) return;
      this.startGhost(evt.evento.clientX, evt.evento.clientY);
    }
  }

  startGhost(x:number, y:number) {
    // posición relativa al dashboard
    this.ghost.active = true;
  }

  cancelGhost() {
    this.ghost.active = false;
  }

  onMouseMoveTable(ev: MouseEvent) {
    if (!this.ghost.active) return;

    // posición relativa al dashboard
    const dashRect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseX = ev.clientX - dashRect.left;
    const mouseY = ev.clientY - dashRect.top;

    this.ghost.x = mouseX - this.ghost.width / 2; // centrado bajo cursor
    this.ghost.y = mouseY - 40;                   // leve offset vertical

    // ¿está sobre el schema?
    const schemaRect = this.schemaElRef?.nativeElement.getBoundingClientRect();
    this.ghost.overSchema =
      ev.clientX >= schemaRect.left &&
      ev.clientX <= schemaRect.right &&
      ev.clientY >= schemaRect.top &&
      ev.clientY <= schemaRect.bottom;
  }

  onMouseDownTable(ev: MouseEvent) {
    if (!this.ghost.active) return;
    // IZQUIERDO: crear si está sobre el schema
    if (ev.button === 0) {
      if (this.ghost.overSchema) {
        // coords RELATIVAS al schema
        const schemaRect = this.schemaElRef.nativeElement.getBoundingClientRect();
        const xInSchema = ev.clientX - schemaRect.left - this.ghost.width / 2;
        const yInSchema = ev.clientY - schemaRect.top - 40;
        this.schemaView.placeNewTableAt({ x: xInSchema, y: yInSchema, width: this.ghost.width, name: this.ghost.table.name });
        this.cancelGhost();
      }
    }

    // DERECHO: cancelar creación
    if (ev.button === 2) {
      ev.preventDefault();
      ev.stopPropagation();
    }
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.ghost.active) this.cancelGhost();
  }

  onContextMenu(ev: MouseEvent) {
    if (this.ghost.active) {
      ev.preventDefault();
      ev.stopPropagation();
      this.cancelGhost();
      return false; // algunos navegadores requieren un booleano para evitar el comportamiento por defecto
    }
    return true;
  }
}
