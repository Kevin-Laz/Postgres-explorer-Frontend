import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Table, TableElement } from '../../../data/interface/table.interface';
import { CommonModule } from '@angular/common';
import { PgTypeSelectComponent } from '../pg-type-select/pg-type-select.component';
import { PgType } from '../../../data/interface/pg-types';

@Component({
  selector: 'app-table-box',
  imports: [CommonModule, PgTypeSelectComponent],
  templateUrl: './table-box.component.html',
  styleUrl: './table-box.component.scss'
})
export class TableBoxComponent implements AfterViewInit{
  @Input() table: Table | null = null;
  @Input() isEditing = false;
  @Input() isEditingCol = -1;

  @Input() x = 0;
  @Input() y = 0;
  @Input() width = 180;
  @Input() isOutside = false;   // marca visual al estar fuera del canvas
  @Input() disabled = false;    // desactiva interacciones (drag/resize/editar)

  @Input() isError = false;

  @Output() positionChange = new EventEmitter<{ x: number; y: number }>();
  @Output() widthChange = new EventEmitter<number>();
  @Output() metricsChange = new EventEmitter<{ width: number; height: number }>(); // ← tamaño real
  @Output() editRequest = new EventEmitter<TableElement>();
  @Output() editChange = new EventEmitter<string>();
  @Output() editFinish = new EventEmitter<void>();
  @Output() editCancel = new EventEmitter<void>();
  @Output() dragEnd = new EventEmitter<void>();
  @Output() columnTypeChange = new EventEmitter<{ index: number; type: string }>();

  @ViewChild('root') rootRef!: ElementRef<HTMLDivElement>;
  @ViewChild('visibleInput') visibleInput!: ElementRef<HTMLInputElement>;
  @ViewChild('colInput') colInput!: ElementRef<HTMLInputElement>;


  // ———————————————————————————————————————————————————————————
  // Estado interno (drag/resize)
  // ———————————————————————————————————————————————————————————

  private isDragging = false;
  private isResizing = false;
  private startX = 0;
  private startY = 0;
  private initialWidth = 0;
  private resizeStartX = 0;

  // ———————————————————————————————————————————————————————————
  // Variables para selección de tipo de dato
  // ———————————————————————————————————————————————————————————



  // ———————————————————————————————————————————————————————————
  // Ciclo de vida
  // ———————————————————————————————————————————————————————————

  ngAfterViewInit(): void {
    this.emitMetrics();
  }

  ngOndestroy(): void{
    // Por si el componente muere durante drag/resize
    this.unbindDocListeners();
  }

  // ———————————————————————————————————————————————————————————
  // Métricas (ancho/alto reales)
  // ———————————————————————————————————————————————————————————

  private emitMetrics() {
    const el = this.rootRef?.nativeElement;
    if (!el) return;
    // altura real
    this.metricsChange.emit({ width: el.offsetWidth, height: el.offsetHeight });
  }

  // Reemisión diferida para esperar reflow
  private scheduleEmitMetrics() {
    setTimeout(() => this.emitMetrics());
  }

  // ———————————————————————————————————————————————————————————
  // Edición (tabla / columna)
  // ———————————————————————————————————————————————————————————

  // Doble click en título de tabla
  requestTableEdit() {
    if (this.disabled) return;
    if (this.isEditing) return;
    this.editRequest.emit({ type: 'table' });

    setTimeout(() => {
      const input = this.visibleInput?.nativeElement;
      input?.focus();
      const len = input?.value.length;
      input?.setSelectionRange(len, len);
    });
  }

  // Doble click en nombre de columna
  requestColumnEdit(index: number) {
    if (this.disabled) return;
    if (this.isEditingCol === index) return;
    this.editRequest.emit({ type: 'column', index });

    setTimeout(() => {
      const input = this.colInput?.nativeElement;
      input?.focus();
      const len = input?.value.length;
      input?.setSelectionRange(len, len);
    });
  }

  //
  onColumnTypeChange(index: number, typeObj: PgType) {
    let type = typeObj.base;
    if (typeObj.param) {
      type += `(${typeObj.param})`;
    }
    this.columnTypeChange.emit({ index, type });
  }

  onEditInput(event: Event) {
    if (this.disabled) return;
    const newValue = (event.target as HTMLInputElement).value;
    this.editChange.emit(newValue);
  }

  onKeyDown(event: KeyboardEvent) {
    if (this.disabled) return;
    if (event.key === 'Enter') {
      this.editFinish.emit();
    } else if (event.key === 'Escape') {
      this.editCancel.emit();
    }
  }

  // ———————————————————————————————————————————————————————————
  // Drag & Drop (mover la tabla)
  // ———————————————————————————————————————————————————————————

  //Mover tabla
  onMouseDown(event: MouseEvent) {
    if (this.disabled) return;
    this.isDragging = true;
    this.startX = event.clientX - this.x;
    this.startY = event.clientY - this.y;

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseMove = (event: MouseEvent) => {
    if (this.disabled) return;
    if (this.isDragging) {
      const newX = event.clientX - this.startX;
      const newY = event.clientY - this.startY;
      this.positionChange.emit({ x: newX, y: newY });
    } else if (this.isResizing) {
      const delta = event.clientX - this.resizeStartX;
      const newWidth = this.initialWidth + delta;
      this.widthChange.emit(newWidth);
      this.scheduleEmitMetrics();
    }
  };

  onMouseUp = () => {
    const wasDragging = this.isDragging;
    this.isDragging = false;
    this.isResizing = false;
    this.unbindDocListeners();
    if (wasDragging) this.dragEnd.emit();   // avisa al padre que se soltó el mouse
  };

  // ———————————————————————————————————————————————————————————
  //  Resize horizontal (handler derecho)
  // ———————————————————————————————————————————————————————————

  startResize(event: MouseEvent) {
    if (this.disabled) return;
    this.isResizing = true;
    this.initialWidth = this.width;
    this.resizeStartX = event.clientX;
    event.stopPropagation();
    event.preventDefault();
    this.bindDocListeners();
  }

  // ———————————————————————————————————————————————————————————
  //  Helpers privados (interacciones y listeners)
  // ———————————————————————————————————————————————————————————

  private bindDocListeners() {
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  private unbindDocListeners() {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  // ———————————————————————————————————————————————————————————
  //  Helpers para selección de tipo
  // ———————————————————————————————————————————————————————————

  getFormatType(type: string){
    let formatType: PgType = {
      base: type.split('(')[0],
      param: type.match(/\((.*?)\)/)?.[1]
    }
    return formatType;
  }
}
