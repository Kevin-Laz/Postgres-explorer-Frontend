import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Table, TableElement } from '../../../data/interface/table.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table-box',
  imports: [CommonModule],
  templateUrl: './table-box.component.html',
  styleUrl: './table-box.component.scss'
})
export class TableBoxComponent {
  @Input() table: Table | null = null;
  @Input() isEditing = false;
  @Input() isEditingCol = -1;
  @Output() editRequest = new EventEmitter<TableElement>();
  test = []

  requestTableEdit() {
    this.editRequest.emit({ type: 'table' });
  }

  requestColumnEdit(index: number) {
    this.editRequest.emit({ type: 'column', index });
  }
}
