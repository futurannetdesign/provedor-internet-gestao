import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { ClientesService } from './clientes.service';
import { Cliente } from './cliente.model';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskModule],
  template: `
    <div class="container mt-4">
      <h2 class="mb-4">Gerenciamento de Clientes</h2>

      <!-- Formulário de Cliente -->
      <form
        [formGroup]="clienteForm"
        (ngSubmit)="onSubmit()"
        class="card p-4 mb-4"
      >
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Nome*</label>
            <input
              formControlName="nome"
              placeholder="Nome completo"
              class="form-control"
              [class.is-invalid]="isFieldInvalid('nome')"
            />
            <div class="invalid-feedback" *ngIf="isFieldInvalid('nome')">
              Nome é obrigatório
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Email*</label>
            <input
              formControlName="email"
              type="email"
              placeholder="email@exemplo.com"
              class="form-control"
              [class.is-invalid]="isFieldInvalid('email')"
            />
            <div class="invalid-feedback" *ngIf="isFieldInvalid('email')">
              Email inválido
            </div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Telefone</label>
            <input
              formControlName="telefone"
              placeholder="(00) 00000-0000"
              class="form-control"
              mask="(00) 00000-0000"
            />
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">CPF</label>
            <input
              formControlName="cpf"
              placeholder="000.000.000-00"
              class="form-control"
              mask="000.000.000-00"
            />
          </div>
        </div>

        <div class="d-flex gap-2">
          <button
            type="submit"
            [disabled]="clienteForm.invalid || loading"
            class="btn btn-primary"
          >
            <span
              *ngIf="loading"
              class="spinner-border spinner-border-sm me-1"
            ></span>
            {{ editando ? 'Atualizar' : 'Cadastrar' }}
          </button>
          <button
            *ngIf="editando"
            type="button"
            (click)="resetForm()"
            class="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>

      <!-- Lista de Clientes -->
      <div class="card">
        <div class="card-body">
          <div *ngIf="loadingList" class="text-center p-4">
            <div class="spinner-border"></div>
          </div>

          <table *ngIf="!loadingList" class="table table-striped mb-0">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>CPF</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let cliente of clientes">
                <td>{{ cliente.nome }}</td>
                <td>{{ cliente.email }}</td>
                <td>{{ cliente.telefone }}</td>
                <td>{{ cliente.cpf }}</td>
                <td>
                  <button
                    (click)="editarCliente(cliente)"
                    class="btn btn-sm btn-info me-2"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    (click)="deletarCliente(cliente.id!)"
                    class="btn btn-sm btn-danger"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
              <tr *ngIf="clientes.length === 0">
                <td colspan="5" class="text-center">
                  Nenhum cliente cadastrado
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        margin: 20px;
      }
      .form-control.is-invalid {
        border-color: #dc3545;
        padding-right: calc(1.5em + 0.75rem);
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right calc(0.375em + 0.1875rem) center;
        background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
      }
    `,
  ],
})
export class ClientesComponent implements OnInit {
  clienteForm: FormGroup;
  clientes: Cliente[] = [];
  editando = false;
  clienteId?: number;
  loading = false;
  loadingList = false;

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

  ngOnInit() {
    this.carregarClientes();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.clienteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  async carregarClientes() {
    try {
      this.loadingList = true;
      this.clientes = await this.clientesService.read();
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      alert('Erro ao carregar clientes. Tente novamente.');
    } finally {
      this.loadingList = false;
    }
  }

  async onSubmit() {
    if (this.clienteForm.valid) {
      try {
        this.loading = true;
        const cliente: Cliente = this.clienteForm.value;

        if (this.editando && this.clienteId) {
          cliente.id = this.clienteId;
          await this.clientesService.update(cliente);
          alert('Cliente atualizado com sucesso!');
        } else {
          await this.clientesService.create(cliente);
          alert('Cliente cadastrado com sucesso!');
        }

        await this.carregarClientes();
        this.resetForm();
      } catch (error) {
        console.error('Erro ao salvar cliente:', error);
        alert('Erro ao salvar cliente. Tente novamente.');
      } finally {
        this.loading = false;
      }
    }
  }

  editarCliente(cliente: Cliente) {
    this.editando = true;
    this.clienteId = cliente.id;
    this.clienteForm.patchValue({
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      cpf: cliente.cpf,
    });
  }

  async deletarCliente(id: number) {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await this.clientesService.delete(id);
        await this.carregarClientes();
      } catch (error) {
        console.error('Erro ao deletar cliente:', error);
        alert('Erro ao deletar cliente. Tente novamente.');
      }
    }
  }

  resetForm() {
    this.clienteForm.reset();
    this.editando = false;
    this.clienteId = undefined;
  }
}
