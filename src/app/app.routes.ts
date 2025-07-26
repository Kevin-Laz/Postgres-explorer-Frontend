import { Routes } from '@angular/router';
import { StartComponent } from './features/start/start.component';

export const routes: Routes = [
  { path: '', component: StartComponent },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoute)
  },
  { path: '**', redirectTo: '' }
];
