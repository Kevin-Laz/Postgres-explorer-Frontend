import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DatabaseContextService {
  private readonly storageKey = 'databaseUrl';

  setConnection(connectionString: string): void{
    sessionStorage.setItem(this.storageKey,connectionString);
  }

  getConnection(): string | null{
    return sessionStorage.getItem(this.storageKey);
  }

  isConnected(): boolean{
    return !!this.getConnection();
  }

  clear(): void{
    sessionStorage.removeItem(this.storageKey);
  }
}
