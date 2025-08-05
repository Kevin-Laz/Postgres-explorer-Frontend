import { Component } from '@angular/core';
import { TableBoxComponent } from '../../shared/components/table-box/table-box.component';
import { Table } from '../../data/interface/table.interface';

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
}
