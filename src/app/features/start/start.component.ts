import { Component } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-start',
  imports: [ReactiveFormsModule],
  templateUrl: './start.component.html',
  styleUrl: './start.component.scss'
})
export class StartComponent {
  dbForm: FormGroup;

  constructor(private fb:FormBuilder){
    this.dbForm = this.fb.group({
      connectionString: ['', [Validators.required, Validators.pattern(/^postgresql:\/\/.+$/)]]
    })
  }

  onSubmit(){
    if(this.dbForm.invalid){
      this.dbForm.markAllAsTouched();
      console.log("Invalido");
      return;
    }
    const connection = this.dbForm.value.connectionString;
    console.log("Iniciando conexion...")
  }
}
