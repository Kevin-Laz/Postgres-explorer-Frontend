import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PARAM_TYPES, PgType, SIMPLE_TYPES } from '../../../data/interface/pg-types';

@Component({
  selector: 'app-pg-type-select',
  imports: [],
  templateUrl: './pg-type-select.component.html',
  styleUrl: './pg-type-select.component.scss'
})
export class PgTypeSelectComponent implements OnInit{
  @Input() value: PgType | null = null;
  @Output() valueChange = new EventEmitter<PgType>();

  simpleTypes = SIMPLE_TYPES.map((t)=>t.toLowerCase());
  paramTypes = PARAM_TYPES.map((t)=>t.toLowerCase());

  selectedType: string | null = null;
  paramValue: number | string | null = null;

  ngOnInit() {
    if (this.value) {
      this.selectedType = this.value.base;
      this.paramValue = this.value.param ?? null;
    }
  }

  onTypeChange(event: Event) {
    this.selectedType = (event.target as HTMLSelectElement).value;
    this.paramValue = null; // resetear parámetro si cambia de tipo
    this.emitValue();
  }

  onParamChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.paramValue = val;
    this.emitValue();
  }

  private emitValue() {
    if (!this.selectedType) return;

    if (this.paramTypes.includes(this.selectedType)) {
      this.valueChange.emit({ base: this.selectedType, param: this.paramValue ?? '' });
    } else {
      this.valueChange.emit({ base: this.selectedType });
    }
  }
}
