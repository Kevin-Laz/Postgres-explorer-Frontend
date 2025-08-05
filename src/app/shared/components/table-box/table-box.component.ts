import { Component, Input } from '@angular/core';
import { Table } from '../../../data/interface/table.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table-box',
  imports: [CommonModule],
  templateUrl: './table-box.component.html',
  styleUrl: './table-box.component.scss'
})
export class TableBoxComponent {
  @Input() table: Table | null = null;

  test = []
}
