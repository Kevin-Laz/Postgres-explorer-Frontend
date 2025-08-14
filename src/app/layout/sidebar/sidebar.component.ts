import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tool, ToolOption, TOOLS } from '../../data/interface/tool.interface';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  @Output() actionSelected = new EventEmitter<string>();
  activeTab = 'sql';
  sqlQuery = '';

  toolsDB = TOOLS;
  options_active: ToolOption[] | null = null;
  tool_selected: string | null = null;
  hovered_tool: string | null = null;
  isToolFixed = false;

  isOptionFixed = false;


  previewTool(tool: Tool): void {
    if (!this.isToolFixed) {
      this.hovered_tool = tool.name;
      this.options_active = tool.options;
    }
  }

  selectTool(tool: Tool): void {
    if (this.tool_selected === tool.name && this.isToolFixed) {
      // Deseleccionar si ya está seleccionada
      this.isToolFixed = false;
      this.tool_selected = null;
      this.options_active = null;
    } else {
      // Seleccionar nueva herramienta
      this.isToolFixed = true;
      this.tool_selected = tool.name;
      this.options_active = tool.options;
    }
  }

  clearOptions(): void {
    if (!this.isToolFixed) {
      this.hovered_tool = null;
      this.options_active = null;
    }
  }

  onClickOption(optionAction: string){
    //Verificar tool y option
    if(!this.tool_selected) return;
    this.actionSelected.emit(optionAction)
  }


}
