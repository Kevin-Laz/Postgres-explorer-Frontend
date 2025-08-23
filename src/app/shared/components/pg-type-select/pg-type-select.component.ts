import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PARAM_TYPES, PgType, SIMPLE_TYPES, TYPE_RULES } from '../../../data/interface/pg-types';

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
  paramValue: number | null = null;

  ngOnInit() {
    if (this.value) {
      this.selectedType = this.value.base.toLowerCase();
      this.paramValue = this.value.param ? Number(this.value.param) : null;
    }
  }

  onTypeChange(event: Event) {
    this.selectedType = (event.target as HTMLSelectElement).value;
    this.paramValue = null; // resetear parámetro si cambia de tipo
    this.emitValue();
  }

  onParamChange(event: Event) {
    let val = Number((event.target as HTMLInputElement).value);
    const rule = this.getRule(this.selectedType!);
    //Validaciones de valor
    if(isNaN(val)) val = rule.default;
    if (val < rule.min) val = rule.min;
    if (val > rule.max) val = rule.max;

    this.paramValue = val;
    this.emitValue();
  }

  private emitValue() {
    if (!this.selectedType) return;

    if (this.paramTypes.includes(this.selectedType)) {
      const rule = this.getRule(this.selectedType);
      const param = this.paramValue ?? rule.default;
      this.valueChange.emit({ base: this.selectedType, param })
    } else {
      this.valueChange.emit({ base: this.selectedType });
    }
  }

  getRule(type: string) {
    return TYPE_RULES[type] ?? { min: 1, max: 65535, default: 1 };
  }
}
