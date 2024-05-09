import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';
import { Servico, Usuario } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from 'src/app.service';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { OrdensService } from 'src/ordens/ordens.service';
import { AvaliarServicoDto } from './dto/avaliar-servico-dto';
import { AdicionarSuspensaoDto } from './dto/adicionar-suspensao-dto';
import { AdicionarMaterialDto } from './dto/adicionar-material-dto';

@Injectable()
export class ServicosService {
  constructor(
    private prisma: PrismaService,
    private app: AppService,
    private usuarios: UsuariosService,
    private ordens: OrdensService,
  ) {}

  async avaliarServico(id: string, avaliarServicoDto: AvaliarServicoDto, usuario: Usuario) {
    const servico = await this.prisma.servico.findUnique({ where: { id } });
    if (!servico) throw new ForbiddenException('Serviço não encontrado.');
    const ordem = await this.prisma.ordem.findUnique({ where: { id: servico.ordem_id } });
    if (!ordem) throw new ForbiddenException('Ordem não encontrada.');
    if (ordem.solicitante_id !== usuario.id) throw new ForbiddenException('Operação não autorizada para este usuário.');
    const avaliado = await this.prisma.servico.update({
      where: { id },
      data: {
        ...avaliarServicoDto,
        avaliado_em: new Date()
      }
    });
    if (!avaliado) throw new InternalServerErrorException('Não foi possível avaliar o chamado. Tente novamente.');
    await this.prisma.ordem.update({
      where: { id: ordem.id },
      data: {
        status: avaliarServicoDto.status === 3 ? 4 : 1,
      }
    });
    return avaliado;
  }

  async criar(createServicoDto: CreateServicoDto, usuario: Usuario) {
    var tecnico_id = usuario.id;
    var ordem_id = createServicoDto.ordem_id;
    if (createServicoDto.tecnico_id) {
      const tecnico = await this.usuarios.buscarPorId(createServicoDto.tecnico_id);
      if (!tecnico) throw new ForbiddenException('Técnico não encontrado.');
      if (tecnico.permissao !== 'TEC') throw new ForbiddenException('Operação não autorizada para este usuário.');
      tecnico_id = tecnico.id;
    }
    if (!createServicoDto.tecnico_id || createServicoDto.tecnico_id === ''){
      const tecnico = await this.usuarios.buscarPorId(usuario.id);
      if (!tecnico) throw new ForbiddenException('Técnico não encontrado.');
      if (tecnico.permissao !== 'TEC') throw new ForbiddenException('Operação não autorizada para este usuário.');
      tecnico_id = tecnico.id;
    }
    if (!tecnico_id) throw new ForbiddenException('Técnico não informado.');
    if (!ordem_id || ordem_id === '') throw new ForbiddenException('Ordem de Serviço não informada.');
    const ordem = await this.ordens.buscarPorId(createServicoDto.ordem_id);
    if (!ordem) throw new ForbiddenException('Ordem de Serviço não encontrada.');
    const novoServico = await this.prisma.servico.create({
      data: {
        tecnico_id,
        ordem_id
      }
    });
    if (!novoServico) throw new InternalServerErrorException('Não foi possível criar o chamado. Tente novamente.');
    const atualizaOrdemStatus = await this.prisma.ordem.update({
      where: { id: ordem.id },
      data: { status: 2, prioridade: createServicoDto.prioridade }
    })
    if (!atualizaOrdemStatus) {
      await this.prisma.servico.delete({ where: { id: novoServico.id } });
      throw new InternalServerErrorException('Não foi possível atualizar o chamado. Tente novamente.');
    }
    const corpo = this.app.emailAtualizacaoChamado(
      ordem.solicitante.nome.split(' ')[0], 
      ordem.id, 
      `Serviço atribuído ao técnico`,
      'DSUP Chamados', `${process.env.URL_BASE_FRONTEND}/chamados/detalhes/${ordem.id}`
    );
    await this.app.enviaEmail(`#${ordem.id} Atualização de Chamado`, corpo, [ordem.solicitante.email]);
    return novoServico;
  }

  async buscarPorOrdem(ordem_id: string) {
  }

  async buscarPorId(id: string) {
  }

  async atualizar(id: string, updateServicoDto: UpdateServicoDto) {
    const { descricao } = updateServicoDto;
    const servico = await this.prisma.servico.findUnique({ where: { id } });
    if (!servico) throw new ForbiddenException('Serviço não encontrado.');
    const atualizado = await this.prisma.servico.update({
      where: { id },
      data: { descricao }
    });
    if (!atualizado) throw new InternalServerErrorException('Não foi possível atualizar o chamado. Tente novamente.');
    return atualizado;
  }

  async finalizarServico(id: string, usuario: Usuario) {
    const servico = await this.prisma.servico.findUnique({ where: { id } });
    if (!servico) throw new ForbiddenException('Serviço não encontrado.');
    if (servico.tecnico_id !== usuario.id) throw new ForbiddenException('Operação não autorizada para este usuário.');
    const suspensaoAtiva = await this.prisma.suspensao.findFirst({ where: { servico_id: servico.id, status: true } });
    if (suspensaoAtiva) throw new ForbiddenException('Serviço possui suspensão ativa.');
    const finalizado = await this.prisma.servico.update({
      where: { id },
      data: { 
        status: 2,
        data_fim: new Date()
      }
    });
    if (!finalizado) throw new InternalServerErrorException('Não foi possível finalizar o chamado. Tente novamente.');
    const ordem = await this.prisma.ordem.update({
      where: { id: servico.ordem_id },
      data: { status: 3 },
      include: {
        solicitante: true
      }
    })
    if (!ordem) {
      await this.prisma.servico.update({ where: { id }, data: { status: 1 } });
      throw new InternalServerErrorException('Não foi possível atualizar o chamado. Tente novamente.');
    }
    const corpo = this.app.emailAtualizacaoChamado(
      ordem.solicitante.nome.split(' ')[0], 
      ordem.id, 
      'Finalizado. Aguardando avaliação do solicitante',
      'DSUP Chamados', `${process.env.URL_BASE_FRONTEND}/chamados/detalhes/${ordem.id}`
    );
    await this.app.enviaEmail(`#${ordem.id} Atualização de Chamado`, corpo, [ordem.solicitante.email]);
    return finalizado;
  }

  async adicionarSuspensao(id: string, { motivo }: AdicionarSuspensaoDto, usuario: Usuario) {
    const servico = await this.prisma.servico.findUnique({ where: { id, tecnico_id: usuario.id } });
    if (!servico) throw new ForbiddenException('Serviço não encontrado.');
    const suspensaoAtiva = await this.prisma.suspensao.findFirst({ where: { servico_id: id, status: true } });
    if (suspensaoAtiva) throw new ForbiddenException('Serviço possui suspensão ativa.');
    const suspensao = await this.prisma.suspensao.create({
      data: {
        servico_id: id,
        motivo
      }
    });
    if (!suspensao) throw new InternalServerErrorException('Não foi possível suspender o chamado. Tente novamente.');
    const atualizaServico = await this.prisma.servico.update({
      where: { id },
      data: { status: 5 }
    })
    if (!atualizaServico) {
      await this.prisma.suspensao.delete({ where: { id: suspensao.id } });
      throw new InternalServerErrorException('Não foi possível suspender o chamado. Tente novamente.');
    }
    const ordem = await this.prisma.ordem.findUnique({ where: { id: servico.ordem_id }, include: { solicitante: true } });
    const corpo = this.app.emailAtualizacaoChamado(
      ordem.solicitante.nome.split(' ')[0],
      ordem.id,
      `Serviço suspenso. Motivo: ${motivo}`,
      'DSUP Chamados', `${process.env.URL_BASE_FRONTEND}/chamados/detalhes/${ordem.id}`
    );
    await this.app.enviaEmail(`#${ordem.id} Atualização de Chamado`, corpo, [ordem.solicitante.email]);
    return suspensao;
  }

  async retomarServico(id: string, usuario: Usuario) {
    const servico = await this.prisma.servico.findUnique({ where: { id, tecnico_id: usuario.id } });
    if (!servico) throw new ForbiddenException('Serviço não encontrado.');
    const suspensaoAtiva = await this.prisma.suspensao.findFirst({ where: { servico_id: id, status: true } });
    if (!suspensaoAtiva) throw new ForbiddenException('Serviço não possui suspensão ativa.');
    const suspensao = await this.prisma.suspensao.update({
      where: { id: suspensaoAtiva.id },
      data: { status: false, termino: new Date() }
    });
    if (!suspensao) throw new InternalServerErrorException('Não foi possível retomar o chamado. Tente novamente.');
    const atualizaServico = await this.prisma.servico.update({
      where: { id },
      data: { status: 1 }
    })
    if (!atualizaServico) {
      await this.prisma.suspensao.update({ where: { id: suspensao.id }, data: { status: true, termino: null } });
      throw new InternalServerErrorException('Não foi possível suspender o chamado. Tente novamente.');
    }
    const ordem = await this.prisma.ordem.findUnique({ where: { id: servico.ordem_id }, include: { solicitante: true } });
    const corpo = this.app.emailAtualizacaoChamado(
      ordem.solicitante.nome.split(' ')[0], 
      ordem.id, 
      'Serviço retomado após suspensão', 
      'DSUP Chamados', `${process.env.URL_BASE_FRONTEND}/chamados/detalhes/${ordem.id}`
    );
    await this.app.enviaEmail(`#${ordem.id} Atualização de Chamado`, corpo, [ordem.solicitante.email]);
    return suspensao;
  }

  async adicionarMaterial(servico_id: string, adicionarMaterialDto: AdicionarMaterialDto, usuario: Usuario) {
    const servico = await this.prisma.servico.findUnique({ where: { id: servico_id } });
    if (!servico) throw new ForbiddenException('Serviço não encontrado.');
    if (servico.tecnico_id !== usuario.id) throw new ForbiddenException('Operação não autorizada para este usuário.');
    const material = await this.prisma.material.create({
      data: {
        ...adicionarMaterialDto,
        servico_id
      }
    });
    if (!material) throw new InternalServerErrorException('Não foi possível adicionar o material. Tente novamente.');
    return material;
  }

  async removerMaterial(material_id: string, usuario: Usuario) {
    const material = await this.prisma.material.findUnique({ where: { id: material_id }, include: { servico: true } });
    if (!material) throw new ForbiddenException('Material não encontrado.');
    if (material.servico.tecnico_id !== usuario.id) throw new ForbiddenException('Operação não autorizada para este usuário.');
    const removido = await this.prisma.material.delete({ where: { id: material_id } });
    if (!removido) throw new InternalServerErrorException('Não foi possível remover o material. Tente novamente.');
    return { status: true };
  }
}
