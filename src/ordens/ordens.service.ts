import { Injectable } from '@nestjs/common';
import { CreateOrdemDto } from './dto/create-ordem.dto';
import { UpdateOrdemDto } from './dto/update-ordem.dto';

@Injectable()
export class OrdensService {
  async criar(createOrdemDto: CreateOrdemDto) {
  }

  async buscarTudo(
    pagina: number = 1,
    limite: number = 10,
    status: number = 1,
    busca?: string
  ) {
  }

  async buscarPorId(id: string) {
  }

  async atualizar(id: string, updateOrdemDto: UpdateOrdemDto) {
  }

  async desativar(id: string) {
  }
}
