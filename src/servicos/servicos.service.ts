import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';
import { Servico, Usuario } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from 'src/app.service';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { OrdensService } from 'src/ordens/ordens.service';

@Injectable()
export class ServicosService {
  constructor(
    private prisma: PrismaService,
    private app: AppService,
    private usuarios: UsuariosService,
    private ordens: OrdensService,
  ) {}
  async criar(createServicoDto: any, usuario: Usuario) {
    if (createServicoDto.tecnico_id || createServicoDto.tecnico_id === '') {
      const tecnico = await this.usuarios.buscarPorId(createServicoDto.tecnico_id);
      if (!tecnico) throw new ForbiddenException('Técnico não encontrado.');
      if (tecnico.permissao !== 'TEC') throw new ForbiddenException('Operação não autorizada para este usuário.');
      createServicoDto.tecnico_id = tecnico.id;
    } else {
      const tecnico = await this.usuarios.buscarPorId(usuario.id);
      if (!tecnico) throw new ForbiddenException('Técnico não encontrado.');
      if (tecnico.permissao !== 'TEC') throw new ForbiddenException('Operação não autorizada para este usuário.');
      createServicoDto.tecnico_id = tecnico.id;
    }
    if (!createServicoDto.tecnico_id) throw new ForbiddenException('Técnico não informado.');
    if (!createServicoDto.ordem_id || createServicoDto.ordem_id === '') throw new ForbiddenException('Ordem de Serviço não informada.');
    const ordem = await this.ordens.buscarPorId(createServicoDto.ordem_id);
    if (!ordem) throw new ForbiddenException('Ordem de Serviço não encontrada.');
    createServicoDto.ordem_id = ordem.id;
    const novoServico = await this.prisma.servico.create({
      data: createServicoDto
    });
    if (!novoServico) throw new InternalServerErrorException('Não foi possível criar o chamado. Tente novamente.');
    const atualizaOrdemStatus = await this.prisma.ordem.update({
      where: { id: ordem.id },
      data: { status: 2 }
    })
    if (!atualizaOrdemStatus) {
      await this.prisma.servico.delete({ where: { id: novoServico.id } });
      throw new InternalServerErrorException('Não foi possível atualizar o chamado. Tente novamente.');
    }
    return novoServico;
  }

  async buscarPorOrdem(ordem_id: string) {
  }

  async buscarPorId(id: string) {
  }

  async atualizar(id: string, updateServicoDto: UpdateServicoDto) {
  }
}
