import { Component, ElementRef, ViewChild } from '@angular/core';
import { TableBoxComponent } from '../../shared/components/table-box/table-box.component';
import { Table, TableElement } from '../../data/interface/table.interface';

@Component({
  selector: 'app-schema-view',
  imports: [TableBoxComponent],
  templateUrl: './schema-view.component.html',
  styleUrl: './schema-view.component.scss'
})
export class SchemaViewComponent {
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

  @ViewChild('hiddenInput') hiddenInput!: ElementRef<HTMLInputElement>;

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
    this.tableTemp.x = pos.x;
    this.tableTemp.y = pos.y;

    this.tableTest.x = this.tableTemp.x;
    this.tableTest.y = this.tableTemp.y;
  }

  onResizeTable(newWidth: number) {
    this.tableTest.width = Math.max(100, newWidth);
    this.tableTemp.width = this.tableTest.width;
  }

}
