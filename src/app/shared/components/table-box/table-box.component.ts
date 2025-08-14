import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Table, TableElement } from '../../../data/interface/table.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table-box',
  imports: [CommonModule],
  templateUrl: './table-box.component.html',
  styleUrl: './table-box.component.scss'
})
export class TableBoxComponent implements AfterViewInit{
  @Input() table: Table | null = null;
  @Input() isEditing = false;
  @Input() isEditingCol = -1;

  @Input() x = 0;
  @Input() y = 0;
  @Input() width = 160;
  @Input() isOutside = false;
  @Input() disabled = false;      // desactiva interacciones (drag/resize/editar)

  @Output() positionChange = new EventEmitter<{ x: number; y: number }>();
  @Output() widthChange = new EventEmitter<number>();
  @Output() metricsChange = new EventEmitter<{ width: number; height: number }>(); // ← tamaño real
  @Output() editRequest = new EventEmitter<TableElement>();
  @Output() editChange = new EventEmitter<string>();
  @Output() editFinish = new EventEmitter<void>();
  @Output() editCancel = new EventEmitter<void>();
  @Output() dragEnd = new EventEmitter<void>();

  @ViewChild('root') rootRef!: ElementRef<HTMLDivElement>;
  @ViewChild('visibleInput') visibleInput!: ElementRef<HTMLInputElement>;
  @ViewChild('colInput') colInput!: ElementRef<HTMLInputElement>;

  private isDragging = false;
  private isResizing = false;
  private startX = 0;
  private startY = 0;
  private initialWidth = 0;
  private resizeStartX = 0;

  ngAfterViewInit(): void {
    this.emitMetrics();
  }

  private emitMetrics() {
    const el = this.rootRef?.nativeElement;
    if (!el) return;
    // altura real
    this.metricsChange.emit({ width: el.offsetWidth, height: el.offsetHeight });
  }

  // llamados cuando cambie el ancho
  private scheduleEmitMetrics() {
    // esperar al reflow
    setTimeout(() => this.emitMetrics());
  }

  // Emitir solicitud de edición
  requestTableEdit() {
    if (this.disabled) return;
    this.editRequest.emit({ type: 'table' });

    setTimeout(() => {
      const input = this.visibleInput?.nativeElement;
      input?.focus();
      const len = input?.value.length;
      input?.setSelectionRange(len, len);
    });
  }

  requestColumnEdit(index: number) {
    if (this.disabled) return;
    this.editRequest.emit({ type: 'column', index });

    setTimeout(() => {
      const input = this.colInput?.nativeElement;
      input?.focus();
      const len = input?.value.length;
      input?.setSelectionRange(len, len);
    });
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
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    if (wasDragging) {
    this.dragEnd.emit();   // avisa al padre que se soltó el mouse
  }
  };


  startResize(event: MouseEvent) {
    if (this.disabled) return;
    this.isResizing = true;
    this.initialWidth = this.width;
    this.resizeStartX = event.clientX;
    event.stopPropagation();
    event.preventDefault();
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }
}
