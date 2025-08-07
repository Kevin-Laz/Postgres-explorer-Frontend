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

    // Hace focus en el input invisible
    setTimeout(() => {
      this.hiddenInput.nativeElement.focus();
      this.hiddenInput.nativeElement.select();
    });
  }

  // Actualiza en tiempo real
  onEditChange(event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    this.editingValue = newValue;

    if (this.editingTarget) {
      if (this.editingTarget.type === 'table') {
        this.tableTemp.name = newValue;
      } else if (this.editingTarget.index !== undefined) {
        this.tableTemp.columns[this.editingTarget.index].name = newValue;
      }
    }
  }

   // Finaliza edición
  finishEditing() {
    this.tableTest = structuredClone(this.tableTemp);
    this.editingTarget = null;
    this.editingValue = '';
    this.hiddenInput.nativeElement.blur();
  }

  // Cancela edición
  cancelEditing() {
    this.editingTarget = null;
    this.editingValue = '';
    this.tableTemp = structuredClone(this.tableTest); // Descarta cambios
  }
}
