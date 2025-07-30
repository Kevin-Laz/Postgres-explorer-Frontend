import { Routes } from '@angular/router';
import { StartComponent } from './features/start/start.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: StartComponent },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoute)
  },
  { path: '**', redirectTo: '' }
];
