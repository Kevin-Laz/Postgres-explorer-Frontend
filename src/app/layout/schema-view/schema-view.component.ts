import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { TableBoxComponent } from '../../shared/components/table-box/table-box.component';
import { Pos, Size, Table, TableElement } from '../../data/interface/table.interface';
import { clamp, clampToCanvas, isOutOfCanvas } from '../../core/utils/schema.utils';
import { TableService } from '../../core/services/table.service';

@Component({
  selector: 'app-schema-view',
  imports: [TableBoxComponent],
  templateUrl: './schema-view.component.html',
  styleUrl: './schema-view.component.scss'
})
export class SchemaViewComponent implements AfterViewInit{

  constructor(private tablesSvc : TableService){}

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLDivElement>;

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
  // Dimensiones del canvas y de cada TableBox
  // ———————————————————————————————————————————————————————————

  private canvasW = 0;
  private canvasH = 0;

  // Medidas reales por tabla (offsetWidth/offsetHeight)
  private boxSizes: Record<number, Size> = {};

  // Última posición válida por tabla (para snap back)
  private lastValidPos: Record<number, Pos> = {};

  // Flags de "fuera del canvas" por tabla (para opacidad)
  outsideFlags: Record<number, boolean> = {};

  // Observers/listeners
  private ro?: ResizeObserver;
  private onWindowResize = () => this.updateCanvasSize();

  // ———————————————————————————————————————————————————————————
  // Ciclo de vida
  // ———————————————————————————————————————————————————————————

  ngAfterViewInit() {
    this.updateCanvasSize();

    // sidebar cambia de ancho asi que se sigue el tamaño del squema
    const ro = new ResizeObserver(() => this.updateCanvasSize());
    ro.observe(this.canvasRef.nativeElement);
    // por si cambia el viewport
    window.addEventListener('resize', this.updateCanvasSize);

    // Inicializa lastValidPos para las tablas existentes
    this.tables.forEach((t, i) => {
      this.lastValidPos[i] = { x: t.x ?? 0, y: t.y ?? 0 };
    });
  }

  ngOnDestroy() {
    this.ro?.disconnect();
    window.removeEventListener('resize', this.onWindowResize);
  }


  // ———————————————————————————————————————————————————————————
  // Canvas sizing helpers
  // ———————————————————————————————————————————————————————————

  updateCanvasSize = () => {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.canvasW = rect.width;
    this.canvasH = rect.height;
  };


  // ———————————————————————————————————————————————————————————
  // API PÚBLICA (llamada desde Dashboard): crear tabla en coords del schema
  // ———————————————————————————————————————————————————————————

  //crea tabla en (x,y) relativos al schema
  placeNewTableAt(pos: { x: number; y: number; width?: number; name?: string }) {
    const width = clamp(pos.width ?? 180, 120, Math.max(200, this.canvasW - 16));
    const heightEstimate = 100;
    const clamped = clampToCanvas({ x: pos.x, y: pos.y }, { width, height: heightEstimate }, { w: this.canvasW, h: this.canvasH});

    this.createTableAt({
      x:clamped.x, y: clamped.y, width: width, name: pos.name ?? `Tabla-${this.tables.length.toString()}`
    })
  }

  createTableAt({x,y,width,name}:{x:number;y:number;width?:number;name?:string}) {
    return this.tablesSvc.create(this.tables, name ?? `Tabla-${this.tables.length.toString()}`, {x,y}, width ?? 180, {w:this.canvasW,h:this.canvasH});
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
    const size = this.boxSizes[index] ?? { width: this.tables[index].width ?? 180, height: 100 };
    this.outsideFlags[index] = isOutOfCanvas(proposed, size, { w: this.canvasW, h: this.canvasH});

    // Mueve libremente
    this.tables[index].x = proposed.x;
    this.tables[index].y = proposed.y;

    // Si está dentro, actualiza la última posición válida
    if (!this.outsideFlags[index]) {
      this.lastValidPos[index] = { x: proposed.x, y: proposed.y };
    }
  }

  // Resize horizontal con límites del canvas
  onResizeTable(index: number, newWidth: number) {
    const minW = 100;
    const maxW = Math.max(200, this.canvasW - 16);
    const width = Math.min(Math.max(newWidth, minW), maxW);

    this.tables[index].width = width;
  }

  // Al soltar el mouse: si estaba fuera, vuelve a su última posición válida
  onDragEnd(index: number) {
    if (this.outsideFlags[index]) {
      const last = this.lastValidPos[index] ?? { x: 0, y: 0 };
      this.tables[index].x = last.x;
      this.tables[index].y = last.y;
      this.outsideFlags[index] = false;
    }
  }


















}
