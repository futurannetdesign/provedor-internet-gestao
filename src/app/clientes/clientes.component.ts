import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { ClientesService } from '../clientes.service';
import { Cliente } from '../cliente.model';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskModule],
  template: ` // ...existing template... `,
  styles: [
    `
      // ...existing styles...
    `,
  ],
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  clienteForm: FormGroup;
  editando: boolean = false;
  clienteId: undefined;

  constructor(
    private fb: FormBuilder,
    private clientesService: ClientesService
  ) {
    this.clienteForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: [''],
      cpf: [''],
    });
  }

  ngOnInit(): void {
    this.carregarClientes();
  }

  async carregarClientes(): Promise<void> {
    this.clientes = await this.clientesService.read();
  }

  async updateCliente(cliente: Cliente): Promise<void> {
    const novoNome = prompt('Novo nome:', cliente.nome);
    if (novoNome) {
      cliente.nome = novoNome;
      await this.clientesService.update(cliente);
      this.carregarClientes();
    }
  }

  async addCliente(): Promise<void> {
    if (this.clienteForm.valid) {
      try {
        const novoCliente: Cliente = this.clienteForm.value;
        await this.clientesService.create(novoCliente);
        await this.carregarClientes();
        this.resetForm();
      } catch (error) {
        console.error('Erro ao adicionar cliente:', error);
      }
    }
  }

  async deleteCliente(id: number): Promise<void> {
    await this.clientesService.delete(id);
    this.carregarClientes();
  }

  resetForm(): void {
    this.clienteForm.reset();
    this.editando = false;
    this.clienteId = undefined;
  }
}
