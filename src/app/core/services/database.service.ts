import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  url_base:string = 'http://localhost:3000'

  constructor(private http: HttpClient) { }

  checkConnection(connectionString: string): Observable<Object>{
    return this.http.post(`${this.url_base}/connection/check-connection`, { "databaseUrl": connectionString})
  }
}
