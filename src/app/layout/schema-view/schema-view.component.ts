import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { TableBoxComponent } from '../../shared/components/table-box/table-box.component';
import { Table, TableElement } from '../../data/interface/table.interface';

@Component({
  selector: 'app-schema-view',
  imports: [TableBoxComponent],
  templateUrl: './schema-view.component.html',
  styleUrl: './schema-view.component.scss'
})
export class SchemaViewComponent implements AfterViewInit{

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLDivElement>;

  tableTest: Table = {name: 'test',
    columns: [
      {
        name: 'col1',
        type: 'str'
      },
      {
        name: 'col2',
        type: 'str'
      }
    ]
  }

  tableTemp: Table = structuredClone(this.tableTest);
  editingValue = '';
  editingTarget: TableElement | null = null;

  // límites canvas
  private canvasW = 0;
  private canvasH = 0;

  // medidas reales del box
  private boxWidth = this.tableTemp.width ?? 160;
  private boxHeight = 0;

  private lastValidPos = { x: this.tableTemp.x ?? 0, y: this.tableTemp.y ?? 0 };

  // feedback visual
  isOutside = false;

  ngAfterViewInit() {
    this.updateCanvasSize();

    // sidebar cambia de ancho asi que se sigue el tamaño del squema
    const ro = new ResizeObserver(() => this.updateCanvasSize());
    ro.observe(this.canvasRef.nativeElement);

    // por si cambia el viewport
    window.addEventListener('resize', this.updateCanvasSize);
  }

  updateCanvasSize = () => {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.canvasW = rect.width;
    this.canvasH = rect.height;
  };

  // El hijo manda altura/anchura reales
  onBoxMetrics(m: { width: number; height: number }) {
    this.boxWidth  = m.width;
    this.boxHeight = m.height;
  }

  // Comienza la edición
  startEditing(data: TableElement) {
    this.editingTarget = data;
    this.tableTemp = structuredClone(this.tableTest);
    if (data.type === 'table') {
      this.editingValue = this.tableTemp.name;
    } else if (data.type === 'column' && data.index !== undefined) {
      this.editingValue = this.tableTemp.columns[data.index].name;
    }
  }

  onEditChange(value: string) {
    if (!this.editingTarget) return;
    this.editingValue = value;

    if (this.editingTarget.type === 'table') {
      this.tableTemp.name = value;
    } else if (this.editingTarget.index !== undefined) {
      this.tableTemp.columns[this.editingTarget.index].name = value;
    }
  }

  onFinishEditing() {
    this.tableTest = structuredClone(this.tableTemp);
    this.editingTarget = null;
    this.editingValue = '';
  }

  onCancelEditing() {
    this.editingTarget = null;
    this.editingValue = '';
    this.tableTemp = structuredClone(this.tableTest);
  }


  onMoveTable(pos: { x: number; y: number }) {
    //Verificar si esta fuera del rango
    const out =
      pos.x < 0 ||
      pos.y < 0 ||
      pos.x + this.boxWidth  > this.canvasW ||
      pos.y + this.boxHeight > this.canvasH;

    this.isOutside = out;

    this.tableTemp.x = pos.x;
    this.tableTemp.y = pos.y;

    this.tableTest.x = pos.x;
    this.tableTest.y = pos.y;

    if (!out) {
      this.lastValidPos = { x: pos.x, y: pos.y };
    }
  }

  onResizeTable(newWidth: number) {
    this.tableTest.width = Math.max(100, newWidth);
    this.tableTemp.width = this.tableTest.width;
  }

  onDragEnd() {
    if (this.isOutside) {
      // volver a la última posición válida
      this.tableTemp.x = this.lastValidPos.x;
      this.tableTemp.y = this.lastValidPos.y;
      this.tableTest.x = this.lastValidPos.x;
      this.tableTest.y = this.lastValidPos.y;
      this.isOutside = false;
    }
  }


}
