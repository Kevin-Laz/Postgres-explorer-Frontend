import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SchemaViewComponent } from '../../layout/schema-view/schema-view.component';
import { CommonModule } from '@angular/common';
import { Table, TableGhost } from '../../data/interface/table.interface';
import { TableBoxComponent } from '../../shared/components/table-box/table-box.component';
import { EventOption, EventOptionWithTool } from '../../data/interface/tool.interface';
import { isTableCreate, mapSidebarToCommand, ToolCommand } from '../../core/actions/tool.actions';
import { centerUnderCursor, isInsideElement, snapToGrid, toElementCoords } from '../../core/utils/schema.utils';

@Component({
  selector: 'app-dashboard',
  imports: [SidebarComponent, SchemaViewComponent, CommonModule, TableBoxComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent{
  @ViewChild('schema', { read: SchemaViewComponent }) schemaView!: SchemaViewComponent;
  @ViewChild('schema', { read: ElementRef }) schemaElRef!: ElementRef<HTMLElement>;
  @ViewChild('root',   { read: ElementRef }) rootRef!: ElementRef<HTMLElement>;

  // ———————————————————————————————————————————————————————————
  // Estado del layout (resizer del sidebar)
  // ———————————————————————————————————————————————————————————
  sidebarWidth = 475;
  private isResizing = false;

  // ———————————————————————————————————————————————————————————
  // Estado del “ghost” (tabla temporal mientras se crea)
  // ———————————————————————————————————————————————————————————
  ghost: TableGhost = {
    active: false,
    x: 0,
    y: 0,
    width: 160,
    table: { id: crypto.randomUUID(), name: 'NuevaTabla', columns: [{ name: 'col1', type: 'varchar(32)' }] },
    overSchema: false
  };

  // ———————————————————————————————————————————————————————————
  // LÓGICA DEL SIDEBAR  → recibe acciones del sidebar y actua en consecuencia
  // ———————————————————————————————————————————————————————————

  // Handler central de acciones que vienen del Sidebar
  onSidebarAction(evt: EventOptionWithTool){
    const cmd: ToolCommand | null = mapSidebarToCommand(evt.tool, evt.action, evt.evento);
    if(!cmd) return;
    if (isTableCreate(cmd) && !this.ghost.active) {
      // Inicia el ghost justo donde se clickeó:
      this.startGhost(evt.evento.clientX, evt.evento.clientY);
      return;
    }
    return;
  }

  // ———————————————————————————————————————————————————————————
  // LÓGICA DE CREACIÓN DE TABLAS (ghost): mover/confirmar/cancelar
  // ———————————————————————————————————————————————————————————

  // Inicia el ghost centrado bajo el cursor en el dashboard
  startGhost(clientX:number, clientY:number) {
    const dashEl = this.rootRef.nativeElement;
    const p = centerUnderCursor(clientX, clientY, dashEl, 160, { offsetY: -40 });
    this.ghost.active = true;
    this.ghost.x = p.x ?? clientX;
    this.ghost.y = p.y ?? clientY;
    this.ghost.overSchema = false;
  }

  cancelGhost() {
    this.ghost.active = false;
  }

  //Mueve el ghost con el mouse y detecta si está sobre el schema
  onMouseMoveTable(ev: MouseEvent) {
    if (!this.ghost.active) return;

    // pos relativa al dashboard + centrado del ghost
    const dashEl = ev.currentTarget as HTMLElement;
    const p = centerUnderCursor(ev.clientX, ev.clientY, dashEl, this.ghost.width, { offsetY: -40 });
    this.ghost.x = p.x;
    this.ghost.y = p.y;

    // ¿está sobre el schema?
    this.ghost.overSchema = isInsideElement(ev.clientX, ev.clientY, this.schemaElRef.nativeElement);
  }

  // Click dentro del canvas: crea la tabla real en SchemaView
  onMouseDownTable(ev: MouseEvent) {
    if (!this.ghost.active) return;
      // IZQUIERDO: crear si está sobre el schema
      if (ev.button === 0 && this.ghost.overSchema) {
        const schemaEl = this.schemaElRef.nativeElement;
        const p = toElementCoords(ev.clientX, ev.clientY, schemaEl);
        const xInSchema = p.x - this.ghost.width / 2;
        const yInSchema = p.y - 40;

        this.schemaView.placeNewTableAt({
          x: xInSchema,
          y: yInSchema,
          width: this.ghost.width,
          name: this.ghost.table.name
        });
        this.cancelGhost();
    }
  }

  // ESC: cancela creación del ghost
  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.ghost.active) this.cancelGhost();
  }

  // Click derecho: cancela y bloquea menú contextual del navegador
  onContextMenu(ev: MouseEvent) {
    if (this.ghost.active) {
      ev.preventDefault();
      ev.stopPropagation();
      this.cancelGhost();
      return false; // algunos navegadores requieren un booleano para evitar el comportamiento por defecto
    }
    return true;
  }

  // ———————————————————————————————————————————————————————————
  // LÓGICA DE RESIZE DEL SIDEBAR (arrastre del separador)
  // ———————————————————————————————————————————————————————————

  // Inicia el arrastre del separador del sidebar
  startResizing(event: MouseEvent){
    this.isResizing = true;
    event.preventDefault();
  }

  // Mientras se arrastra, cambia el ancho del sidebar
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isResizing) return;
    const newWidth = event.clientX;
    if (newWidth >= 300 && newWidth <= 800) {
      this.sidebarWidth = newWidth;
    }
  }

  // Termina el arrastre del separador
  @HostListener('document:mouseup')
  stopResizing() {
    this.isResizing = false;
  }

}
