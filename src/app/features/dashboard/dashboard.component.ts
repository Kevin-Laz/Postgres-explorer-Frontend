import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SchemaViewComponent } from '../../layout/schema-view/schema-view.component';
import { CommonModule } from '@angular/common';
import { Table, TableGhost } from '../../data/interface/table.interface';
import { TableBoxComponent } from '../../shared/components/table-box/table-box.component';
import { EventOption, EventOptionWithTool } from '../../data/interface/tool.interface';
import { isTableCreate, isTableDelete, isTableDuplicate, mapSidebarToCommand, ToolCommand } from '../../core/actions/tool.actions';
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
  sidebarWidth = 495;
  isResizing = false;

  private resizeStartX = 0;
  private resizeStartW = 0;
  private pendingWidth: number | null = null;
  private rafId: number | null = null;
  private minSidebar = 300;


  // ———————————————————————————————————————————————————————————
  // Estado de selección en squema
  // ———————————————————————————————————————————————————————————

  selectionMode = false;
  pendingCmd: ToolCommand | null = null;
  // ———————————————————————————————————————————————————————————
  // Estado del “ghost” (tabla temporal mientras se crea)
  // ———————————————————————————————————————————————————————————
  ghost: TableGhost = {
    active: false,
    x: 0,
    y: 0,
    width: 180,
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
      this.selectionMode = false;
      // Inicia el ghost justo donde se clickeó:
      this.pendingCmd = cmd;
      this.startGhost(evt.evento.clientX, evt.evento.clientY);
      return;
    }
    if(isTableDelete(cmd)){
      this.selectionMode = !this.selectionMode;
      this.pendingCmd = cmd;
      return;
    }

    if(isTableDuplicate(cmd)){
      this.selectionMode = !this.selectionMode;
      this.pendingCmd = cmd;
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
    const p = centerUnderCursor(clientX, clientY, dashEl, 180, { offsetY: -40 });
    this.ghost.active = true;
    this.ghost.x = p.x ?? clientX;
    this.ghost.y = p.y ?? clientY;
    this.ghost.overSchema = false;
  }

  duplicateGhost(clientX:number, clientY:number, table: Table) {
    const dashEl = this.rootRef.nativeElement;
    const p = centerUnderCursor(clientX, clientY, dashEl, 180, { offsetY: -40 });
    this.ghost.active = true;
    this.ghost.x = p.x ?? clientX;
    this.ghost.y = p.y ?? clientY;
    this.ghost.overSchema = false;
    this.ghost.table = {...table};
    this.ghost.table.name +='_dlp';
    this.ghost.width = table.width || 180;
  }

  cancelGhost() {
    this.ghost = {
      active: false,
      x: 0,
      y: 0,
      width: 180,
      table: { id: crypto.randomUUID(), name: 'NuevaTabla', columns: [{ name: 'col1', type: 'varchar(32)' }] },
      overSchema: false
    };
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
    if(!this.pendingCmd) return;
    if (this.isResizing) return;
    if (isTableCreate(this.pendingCmd) && ev.button === 0 && this.ghost.overSchema) {
      // conversión del esquema (corrige scroll y padding)
      const p = this.schemaView.screenToCanvas(ev.clientX, ev.clientY);

      const xInSchema = p.x - this.ghost.width / 2;
      const yInSchema = p.y - 40;

      this.schemaView.placeNewTableAt({
        x: xInSchema,
        y: yInSchema,
        width: this.ghost.width
      });
      this.cancelGhost();
    }

    else if(isTableDuplicate(this.pendingCmd) && ev.button === 0 && this.ghost.overSchema){
      const p = this.schemaView.screenToCanvas(ev.clientX, ev.clientY);
      const xInSchema = p.x - this.ghost.width / 2;
      const yInSchema = p.y - 40;

      let newTable: Table = this.ghost.table;
      newTable.x = xInSchema;
      newTable.y = yInSchema;
      newTable.width = this.ghost.width;

      this.schemaView.duplicateTableAt(newTable);
      this.cancelGhost();
    }

  }

  // ESC: cancela creación del ghost
  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.ghost.active) this.cancelGhost();
    this.selectionFinish(false);
  }

  // Click derecho: cancela y bloquea menú contextual del navegador
  onContextMenu(ev: MouseEvent) {
    if (this.ghost.active) {
      ev.preventDefault();
      ev.stopPropagation();
      this.cancelGhost();
      this.selectionFinish(false);
      return false; // algunos navegadores requieren un booleano para evitar el comportamiento por defecto
    }
    return true;
  }

  // ———————————————————————————————————————————————————————————
  // LÓGICA DE RESIZE DEL SIDEBAR (arrastre del separador)
  // ———————————————————————————————————————————————————————————

  private clamp(n: number, min: number, max: number) {
    return Math.min(max, Math.max(min, n));
  }
  private maxSidebar() {
    // deja siempre espacio mínimo para el schema
    const MIN_SCHEMA = 500;
    return Math.max(320, window.innerWidth - MIN_SCHEMA);
  }

  // Inicia el arrastre del separador del sidebar
  startResizing(ev: PointerEvent) {
    // evitar que “perfore” al schema
    ev.preventDefault();
    ev.stopPropagation();

    const resizerEl = ev.currentTarget as HTMLElement;
    resizerEl.setPointerCapture?.(ev.pointerId);

    this.isResizing = true;
    this.resizeStartX = ev.clientX;
    this.resizeStartW = this.sidebarWidth;

    // listeners (en el propio elemento capturado o window)
    window.addEventListener('pointermove', this.onResizeMove, { passive: true });
    window.addEventListener('pointerup', this.onResizeEnd, { passive: true });
    window.addEventListener('pointercancel', this.onResizeEnd, { passive: true });
  }

  private onResizeMove = (ev: PointerEvent) => {
    if (!this.isResizing) return;
    const dx = ev.clientX - this.resizeStartX;

    const target = this.clamp(
      this.resizeStartW + dx,
      this.minSidebar,
      this.maxSidebar()
    );

    // batch en RAF para evitar reflows en exceso
    this.pendingWidth = target;
    if (this.rafId == null) {
      this.rafId = requestAnimationFrame(() => {
        if (this.pendingWidth != null) {
          this.sidebarWidth = this.pendingWidth;
        }
        this.rafId = null;
      });
    }
  };

  private onResizeEnd = (_ev: PointerEvent) => {
    if (!this.isResizing) return;

    this.isResizing = false;
    this.pendingWidth = null;
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    window.removeEventListener('pointermove', this.onResizeMove as any);
    window.removeEventListener('pointerup', this.onResizeEnd as any);
    window.removeEventListener('pointercancel', this.onResizeEnd as any);
  };

  // ———————————————————————————————————————————————————————————
  // LÓGICA DE SELECCION
  // ———————————————————————————————————————————————————————————

  selectionFinish(bol: boolean){
    this.selectionMode = bol;
    this.pendingCmd = null;
  }

  // Handler de acciones que vienen del esquema
  selectionStart(infoSelect: [ToolCommand, Table, MouseEvent]){
    const cmd = infoSelect[0];
    const table = infoSelect[1];
    const event = infoSelect[2];
    if(!cmd) return;
    if(isTableDuplicate(cmd)){
      if(!event.clientX || !event.clientY) return;
      this.duplicateGhost(event.clientX, event.clientY,table);
    }
  }
}
