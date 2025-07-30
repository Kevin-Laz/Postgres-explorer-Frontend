import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DatabaseContextService } from '../services/database-context.service';

export const authGuard: CanActivateFn = (route, state) => {
  const dbService = inject(DatabaseContextService);
  const router = inject(Router);

  if(!dbService.isConnected()){
    router.navigate(['/']);
    return false;
  }
  return true;
};
