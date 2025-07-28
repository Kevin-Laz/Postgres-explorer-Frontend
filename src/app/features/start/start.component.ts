import { Component } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatabaseService } from '../../core/services/database.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start',
  imports: [ReactiveFormsModule],
  templateUrl: './start.component.html',
  styleUrl: './start.component.scss'
})
export class StartComponent {
  dbForm: FormGroup;
  mensageError = '';
  constructor(private fb:FormBuilder, private dbService : DatabaseService, private router: Router){
    this.dbForm = this.fb.group({
      connectionString: ['', [Validators.required, Validators.pattern(/^postgresql:\/\/.+$/)]]
    })
  }

  onSubmit(){
    if(this.dbForm.invalid){
      this.dbForm.markAllAsTouched();
      this.mensageError = 'Cadena de conexión inválida';
      return;
    }
    this.mensageError = '';
    const connection = this.dbForm.value.connectionString;
    this.dbService.checkConnection(connection).subscribe({
      next: ()=>{
        sessionStorage.setItem('databaseUrl', connection);
        this.router.navigate(['/dashboard']);
      },
      error: (error)=>{
        this.mensageError = 'No se logro conectar';
        console.log(error.error?.error)
      }
    })
  }
}
