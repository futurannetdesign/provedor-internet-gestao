import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Cliente } from './cliente.model';
import { PostgrestError } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  private readonly MAX_RETRIES = 3;

  constructor(private supabaseService: SupabaseService) {}

  async create(cliente: Cliente): Promise<Cliente> {
    if (!this.validateCliente(cliente)) {
      throw new Error('Cliente inválido');
    }

    return this.withRetry(async () => {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('clientes')
        .insert([cliente])
        .select()
        .single();

      if (error) {
        this.handleError('criar', error);
      }

      if (!data) {
        throw new Error('Nenhum dado retornado após criar cliente');
      }

      return data as Cliente;
    });
  }

  async read(): Promise<Cliente[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('clientes')
      .select('*');

    if (error) {
      this.handleError('ler', error);
    }

    return (data as Cliente[]) || [];
  }

  async update(cliente: Cliente): Promise<Cliente> {
    if (!cliente.id) {
      throw new Error('ID do cliente é obrigatório para atualização');
    }

    if (!this.validateCliente(cliente)) {
      throw new Error('Cliente inválido');
    }

    return this.withRetry(async () => {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('clientes')
        .update(cliente)
        .eq('id', cliente.id)
        .select()
        .single();

      if (error) {
        this.handleError('atualizar', error);
      }

      if (!data) {
        throw new Error('Cliente não encontrado');
      }

      return data as Cliente;
    });
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) {
      this.handleError('deletar', error);
    }
  }

  private validateCliente(cliente: Cliente): boolean {
    if (!cliente) return false;

    const requiredFields = {
      nome: cliente.nome?.trim(),
      email: cliente.email?.trim(),
    };

    // Verifica se todos os campos obrigatórios estão preenchidos
    const isValid = Object.values(requiredFields).every((field) => !!field);

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = emailRegex.test(cliente.email);

    if (!isValid) {
      throw new Error('Nome e email são campos obrigatórios');
    }

    if (!isValidEmail) {
      throw new Error('Email inválido');
    }

    return true;
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    const delays = [1000, 2000, 4000]; // Backoff exponencial

    for (let i = 0; i < this.MAX_RETRIES; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Tentativa ${i + 1} falhou:`, error);

        if (i < this.MAX_RETRIES - 1) {
          await new Promise((resolve) => setTimeout(resolve, delays[i]));
        }
      }
    }

    throw new Error(
      `Falha após ${this.MAX_RETRIES} tentativas: ${lastError?.message}`
    );
  }

  private handleError(operation: string, error: PostgrestError): never {
    const errorMap: Record<string, string> = {
      '23505': 'Já existe um cliente com este email',
      '23503': 'Cliente referenciado não existe',
      '42P01': 'Tabela não encontrada',
    };

    const errorMessage = `Erro ao ${operation} cliente: ${
      errorMap[error.code] || error.message
    }`;
    console.error(errorMessage, {
      operation,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    throw new Error(errorMessage);
  }
}
