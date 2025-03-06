import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientesComponent } from './clientes/clientes.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ClientesComponent],
  template: `
    <div class="container-fluid">
      <app-clientes></app-clientes>
    </div>
  `,
})
export class AppComponent {}
