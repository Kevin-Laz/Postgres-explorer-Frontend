import { Component, HostListener } from '@angular/core';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SchemaViewComponent } from '../../layout/schema-view/schema-view.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [SidebarComponent, SchemaViewComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  sidebarWidth = 200;
  private isResizing = false;

  startResizing(event: MouseEvent){
    this.isResizing = true;
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isResizing) return;
    const newWidth = event.clientX;
    if (newWidth >= 100 && newWidth <= 600) {
      this.sidebarWidth = newWidth;
    }
  }

  @HostListener('document:mouseup')
  stopResizing() {
    this.isResizing = false;
  }
}
