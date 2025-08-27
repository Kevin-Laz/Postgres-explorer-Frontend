import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { TableBoxComponent } from '../../shared/components/table-box/table-box.component';
import { Pos, Size, Table, TableElement } from '../../data/interface/table.interface';
import { clamp, clampToCanvas, isOutOfCanvas } from '../../core/utils/schema.utils';
import { TableService } from '../../core/services/table.service';
import { isTableDelete, isTableDuplicate, isTableEdit, ToolCommand } from '../../core/actions/tool.actions';

@Component({
  selector: 'app-schema-view',
  imports: [TableBoxComponent],
  templateUrl: './schema-view.component.html',
  styleUrl: './schema-view.component.scss'
})
export class SchemaViewComponent implements AfterViewInit{

  constructor(private tablesSvc : TableService){}

  @ViewChild('viewport') viewportRef!: ElementRef<HTMLDivElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLDivElement>;

  // ———————————————————————————————————————————————————————————
  // Config: lienzo fijo muy grande
  // ———————————————————————————————————————————————————————————

  private readonly CANVAS_W = 40000;
  private readonly CANVAS_H = 20000;

  // ———————————————————————————————————————————————————————————
  // Estado principal (modelo)
  // ———————————————————————————————————————————————————————————

  tables: Table[] = [];

  // ———————————————————————————————————————————————————————————
  // Estado de edición (tabla/columna)
  // ———————————————————————————————————————————————————————————

  editingTableIndex: number | null = null;
  editingTarget: TableElement | null = null;
  editingValue = '';

  // ———————————————————————————————————————————————————————————
  // Estado de selección (tabla)
  // ———————————————————————————————————————————————————————————

  @Input() selectionMode = false;
  @Input() pendingCmd : ToolCommand | null = null;

  @Output() selectionFinish = new EventEmitter<boolean>();
  @Output() selectionStart = new EventEmitter<[ToolCommand, Table, MouseEvent]>();

  // ———————————————————————————————————————————————————————————
  // Dimensiones viewport (para centrar al inicio / focus)
  // ———————————————————————————————————————————————————————————

  private viewportW = 0;
  private viewportH = 0;

  // ———————————————————————————————————————————————————————————
  // Dimensiones TableBox
  // ———————————————————————————————————————————————————————————

  // Medidas reales por tabla (offsetWidth/offsetHeight)
  private boxSizes: Record<number, Size> = {};

  // Última posición válida por tabla (para snap back)
  private lastValidPos: Record<number, Pos> = {};

  // Flags de "fuera del canvas" por tabla (para opacidad)
  outsideFlags: Record<number, boolean> = {};

  // Observers/listeners
  private ro?: ResizeObserver;

  private isPanning = false;
  private panStart = { x: 0, y: 0, scrollLeft: 0, scrollTop: 0 };

  // ———————————————————————————————————————————————————————————
  // Ciclo de vida
  // ———————————————————————————————————————————————————————————

  ngAfterViewInit() {
    // aplica tamaño fijo al canvas
    const canvasEl = this.canvasRef.nativeElement;
    canvasEl.style.setProperty('--schema-width',  `${this.CANVAS_W}px`);
    canvasEl.style.setProperty('--schema-height', `${this.CANVAS_H}px`);

    // mide viewport y centra la vista al medio del lienzo
    this.measureViewport();
    this.centerViewport();

    // re-medición en resize del contenedor
    const roViewport = new ResizeObserver(() => {
      this.measureViewport();
      // no re-centramos para no molestar al usuario; solo actualizamos medidas
    });
    roViewport.observe(this.viewportRef.nativeElement);
    this.ro = roViewport;

    // inicializa última posición válida
    this.tables.forEach((t, i) => {
      this.lastValidPos[i] = { x: t.x ?? 0, y: t.y ?? 0 };
    });
  }

  ngOnDestroy() {
    this.ro?.disconnect();
  }


  // ———————————————————————————————————————————————————————————
  // Helpers viewport
  // ———————————————————————————————————————————————————————————

  private measureViewport() {
    const vp = this.viewportRef.nativeElement.getBoundingClientRect();
    this.viewportW = vp.width;
    this.viewportH = vp.height;
  }

  private centerViewport() {
    const vp = this.viewportRef.nativeElement;
    vp.scrollLeft = Math.max(0, (this.CANVAS_W - this.viewportW) / 2);
    vp.scrollTop  = Math.max(0, (this.CANVAS_H - this.viewportH) / 2);
  }

  // Convierte coordenadas de pantalla a coords de contenido
  public screenToCanvas(clientX: number, clientY: number) {
    const vp = this.viewportRef.nativeElement;
    const rect = vp.getBoundingClientRect();
    const x = clientX - rect.left + vp.scrollLeft;
    const y = clientY - rect.top  + vp.scrollTop;
    return { x, y };
  }

  // Asegura que (x,y,w,h) quede visible con un margen
  private ensureVisibleRect(x: number, y: number, w: number, h: number, margin = 80) {
    const vp = this.viewportRef.nativeElement;

    const left   = x - margin;
    const top    = y - margin;
    const right  = x + w + margin;
    const bottom = y + h + margin;

    if (left < vp.scrollLeft) vp.scrollLeft = Math.max(0, left);
    if (right > vp.scrollLeft + vp.clientWidth)
      vp.scrollLeft = Math.max(0, right - vp.clientWidth);

    if (top < vp.scrollTop) vp.scrollTop = Math.max(0, top);
    if (bottom > vp.scrollTop + vp.clientHeight)
      vp.scrollTop = Math.max(0, bottom - vp.clientHeight);
  }


  // ———————————————————————————————————————————————————————————
  // API PÚBLICA (llamada desde Dashboard): CRUD de tabla en coords del schema
  // ———————————————————————————————————————————————————————————

  //crea tabla en (x,y) relativos al schema
  placeNewTableAt(pos: { x: number; y: number; width?: number; name?: string }) {
    const width = clamp(pos.width ?? 180, 120, 600);
    const heightEstimate = 100;
    const clamped = clampToCanvas(
          { x: pos.x, y: pos.y },
          { width, height: heightEstimate },
          { w: this.CANVAS_W, h: this.CANVAS_H }
        );
    this.createTableAt({
      x:clamped.x, y: clamped.y, width: width, name: pos.name ?? `Tabla_${this.tables.length.toString()}`
    })
  }

  createTableAt({x,y,width,name}:{x:number;y:number;width?:number;name?:string}) {
    this.tablesSvc.create(
          this.tables,
          name ?? `Tabla_${this.tables.length}`,
          { x, y },
          width ?? 180,
          { w: this.CANVAS_W, h: this.CANVAS_H }
        );
    this.ensureVisibleRect(x, y, width ?? 180, 120);
    this.selectionFinish.emit(false);
  }

  duplicateTableAt(table: Table){
    const cloned: Table = {
      ...table,
      id: crypto.randomUUID(),
      columns: table.columns.map(c => ({ ...c })) // clona cada columna
    };
    this.tablesSvc.duplicate(this.tables, cloned, {w:this.CANVAS_W,h:this.CANVAS_H});
    this.selectionFinish.emit(false);
  }

  deleteTableAt(id: string){
    this.tablesSvc.remove(this.tables, id);
  }


  // ———————————————————————————————————————————————————————————
  // Métricas de cada TableBox (ancho/alto real)
  // ———————————————————————————————————————————————————————————

  // Actualiza el tamaño real de cada Tabla
  onBoxMetrics(index: number, m: Size) {
    this.boxSizes[index] = m;
    // Si no tenías lastValidPos para este índice, inicialízalo
    if (!this.lastValidPos[index]) {
      const t = this.tables[index];
      this.lastValidPos[index] = { x: t.x ?? 0, y: t.y ?? 0 };
    }
  }

  // ———————————————————————————————————————————————————————————
  // Edición (doble click en nombre de tabla/columna)
  // ———————————————————————————————————————————————————————————

  // Comienza la edición
  startEditing(tableIndex: number, data: TableElement) {
    this.editingTableIndex = tableIndex;
    this.editingTarget = data;
    const table = this.tables[tableIndex];

    if (data.type === 'table') {
      this.editingValue = table.name;
    } else if (data.type === 'column' && data.index !== undefined) {
      this.editingValue = table.columns[data.index].name;
    }
  }

  onEditChange(value: string) {
    if (this.editingTableIndex === null || !this.editingTarget) return;

    const table = this.tables[this.editingTableIndex];
    this.editingValue = value;

    if (this.editingTarget.type === 'table') {
      table.name = value;
    } else if (this.editingTarget.index !== undefined) {
      table.columns[this.editingTarget.index].name = value;
    }
  }

  // Actualiza el tipo de dato
  onColumnTypeChange(tableIndex: number, evt: { index: number; type: string }) {
    this.tables[tableIndex].columns[evt.index].type = evt.type;
  }


  onFinishEditing() {
    this.editingTableIndex = null;
    this.editingTarget = null;
    this.editingValue = '';
  }

  onCancelEditing() {
    this.editingTableIndex = null;
    this.editingTarget = null;
    this.editingValue = '';
  }

  // ———————————————————————————————————————————————————————————
  // Drag & Resize de cada TableBox
  // ———————————————————————————————————————————————————————————

  // Drag: permite salir, marca "outside" y guarda última posición válida por tabla
  onMoveTable(index: number, proposed: Pos) {
    const t = this.tables[index];
    const size = this.boxSizes[index] ?? { width: t.width ?? 180, height: 100 };

    // clamp a los límites del lienzo fijo
    const maxX = this.CANVAS_W - (size.width ?? 180);
    const maxY = this.CANVAS_H - (size.height ?? 100);

    t.x = clamp(proposed.x, 0, Math.max(0, maxX));
    t.y = clamp(proposed.y, 0, Math.max(0, maxY));

    // recalcula outside
    this.outsideFlags[index] = isOutOfCanvas(
      { x: t.x ?? 0, y: t.y ?? 0 },
      size,
      { w: this.CANVAS_W, h: this.CANVAS_H }
    );

    if (!this.outsideFlags[index]) {
      this.lastValidPos[index] = { x: t.x ?? 0, y: t.y ?? 0 };
    }
  }

  // Resize horizontal se permite expandir el canvas
  onResizeTable(index: number, newWidth: number) {
    const minW = 100;
    const width = Math.max(newWidth, minW);
    const t = this.tables[index];
    t.width = width;

    const size = this.boxSizes[index] ?? { width, height: 100 };
    const maxX = this.CANVAS_W - (size.width ?? width);
    if ((t.x ?? 0) > maxX) t.x = maxX;
  }

  // Al soltar el mouse: si estaba fuera, vuelve a su última posición válida
  onDragEnd(index: number) {
    if (this.outsideFlags[index]) {
      const last = this.lastValidPos[index] ?? { x: 0, y: 0 };
      const t = this.tables[index];
      t.x = last.x; t.y = last.y;
      this.outsideFlags[index] = false;
    }
  }

  // ———————————————————————————————————————————————————————————
  // Panning del lienzo (solo mueve scroll, no cambia tamaño)
  // ———————————————————————————————————————————————————————————

  onPanStart(ev: PointerEvent) {
    const target = ev.target as HTMLElement;
    if (ev.button !== 0) return;
    if (target.closest('.table-box')) return;

    const viewport = this.viewportRef.nativeElement;
    this.isPanning = true;
    viewport.classList.add('panning');

    this.panStart = {
      x: ev.clientX,
      y: ev.clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop
    };

    (ev.currentTarget as HTMLElement).setPointerCapture?.(ev.pointerId);
    viewport.addEventListener('pointermove', this.onPanMove, { passive: true });
    viewport.addEventListener('pointerup', this.onPanEnd, { passive: true });
    viewport.addEventListener('pointercancel', this.onPanEnd, { passive: true });
  }

  onPanMove = (ev: PointerEvent) => {
    if (!this.isPanning) return;
    const viewport = this.viewportRef.nativeElement;
    const dx = ev.clientX - this.panStart.x;
    const dy = ev.clientY - this.panStart.y;
    viewport.scrollLeft = this.panStart.scrollLeft - dx;
    viewport.scrollTop  = this.panStart.scrollTop  - dy;
  };

  onPanEnd = () => {
    if (!this.isPanning) return;
    this.isPanning = false;
    const viewport = this.viewportRef.nativeElement;
    viewport.classList.remove('panning');
    viewport.removeEventListener('pointermove', this.onPanMove as any);
    viewport.removeEventListener('pointerup', this.onPanEnd as any);
    viewport.removeEventListener('pointercancel', this.onPanEnd as any);
  };



  // ———————————————————————————————————————————————————————————
  // Logica de herramientas/opciones que requieran modo selección
  // ———————————————————————————————————————————————————————————

  onTableSelected(selection: [Table, MouseEvent]){
    const table = selection[0];
    const event = selection[1];
    if(this.pendingCmd && this.selectionMode){
      if(isTableDelete(this.pendingCmd)){
        this.deleteTableAt(table.id);
        this.selectionFinish.emit(false);
      }

      if(isTableDuplicate(this.pendingCmd)){
        this.selectionStart.emit([this.pendingCmd, table, event]);
      }

      if (isTableEdit(this.pendingCmd)) {
        const idx = this.tables.findIndex(t => t.id === table.id);
        if (idx >= 0) this.startEditing(idx, { type: 'table' });
        this.selectionFinish.emit(false);
      }
    }
  }



}
