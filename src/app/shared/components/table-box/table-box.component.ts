import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
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
  @Output() editChange = new EventEmitter<string>();
  @Output() editFinish = new EventEmitter<void>();
  @Output() editCancel = new EventEmitter<void>();

  @ViewChild('visibleInput') visibleInput!: ElementRef<HTMLInputElement>;
  @ViewChild('colInput') colInput!: ElementRef<HTMLInputElement>;

  // Emitir solicitud de edición
  requestTableEdit() {
    this.editRequest.emit({ type: 'table' });

    setTimeout(() => {
      const input = this.visibleInput?.nativeElement;
      input?.focus();
      const len = input?.value.length;
      input?.setSelectionRange(len, len);
    });
  }

  requestColumnEdit(index: number) {
    this.editRequest.emit({ type: 'column', index });

    setTimeout(() => {
      const input = this.colInput?.nativeElement;
      input?.focus();
      const len = input?.value.length;
      input?.setSelectionRange(len, len);
    });
  }

  onEditInput(event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    this.editChange.emit(newValue);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.editFinish.emit();
    } else if (event.key === 'Escape') {
      this.editCancel.emit();
    }
  }
}
