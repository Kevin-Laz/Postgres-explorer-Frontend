import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventOption, EventOptionWithTool, Tool, ToolOption, TOOLS } from '../../data/interface/tool.interface';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  // Emite la acción seleccionada junto con el tool activo
  @Output() actionSelected = new EventEmitter<EventOptionWithTool>();


  // ———————————————————————————————————————————————————————————
  // Estado de UI (tabs, inputs)
  // ———————————————————————————————————————————————————————————

  activeTab = 'sql';
  sqlQuery = '';

  // ———————————————————————————————————————————————————————————
  // Datos de Tools / Opciones
  // ———————————————————————————————————————————————————————————

  toolsDB: Tool[] = TOOLS;

  // Lista de opciones visible para el tool activo/hover
  options_active: ToolOption[] | null = null;

  // Nombre del tool seleccionado (fijo)
  tool_selected: string | null = null;

  // Nombre del tool en hover (solo vista previa)
  hovered_tool: string | null = null;

  // Si el tool está “fijado” (clic) o solo en hover
  isToolFixed = false;

  // ———————————————————————————————————————————————————————————
  // Handlers de interacción con Tools (hover / select / clear)
  // ———————————————————————————————————————————————————————————

  // Vista previa de las opciones de un tool cuando NO hay selección fija
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
      this.setSelectedTool(null);
      this.resetOptions();
      return;
    } else {
      // Seleccionar
      this.isToolFixed = true;
      this.setSelectedTool(tool.name);
      this.setActiveOptions(tool.options);
    }
  }

  clearOptions(): void {
    if (this.isToolFixed) return;
    this.hovered_tool = null;
    this.resetOptions();
  }


  // ———————————————————————————————————————————————————————————
  // Handler de click en una opción (Crear/Editar/Eliminar/etc.)
  // ———————————————————————————————————————————————————————————

  // Emite la acción elegida junto con el tool seleccionado actual.
  onClickOption(evt: EventOption){
    //Verificar tool y option
    if(!this.tool_selected) return;
    this.actionSelected.emit({ ...evt, tool :this.tool_selected})
  }

  // ———————————————————————————————————————————————————————————
  // Helpers privados
  // ———————————————————————————————————————————————————————————

  // Define el tool seleccionado por nombre (o null para limpiar)
  private setSelectedTool(name: string | null): void {
    this.tool_selected = name;
  }

  // Reemplaza el conjunto de opciones activas
  private setActiveOptions(options: ToolOption[] | null): void {
    this.options_active = options;
  }

  // Limpia opciones activas
  private resetOptions(): void {
    this.options_active = null;
  }

}
