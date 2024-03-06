import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateOrdemDto } from './dto/create-ordem.dto';
import { UpdateOrdemDto } from './dto/update-ordem.dto';
import { AppService } from 'src/app.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Usuario } from '@prisma/client';

@Injectable()
export class OrdensService {
  constructor(
    private prisma: PrismaService,
    private app: AppService
  ) {}

  async geraId() {
    let id = "";
    let numerico = 1;
    const agora = new Date();
    const data = `${agora.getFullYear()}${(agora.getMonth() + 1).toString().padStart(2, '0')}${agora.getDate().toString().padStart(2, '0')}`;
    const ultimoCadastrado = await this.prisma.ordem.findFirst({
      where: { id: { startsWith: data } },
      orderBy: { data_solicitacao: 'desc' }
    });
    if (ultimoCadastrado)
      numerico = parseInt(ultimoCadastrado.id.substring(8)) + 1;
    id = `${data}${numerico.toString().padStart(4, '0')}`;
    return id;
  }

  async atualizar(id: string, updateOrdemDto: UpdateOrdemDto) {
    const ordem = await this.prisma.ordem.findUnique({ where: { id } });
    if (!ordem) throw new ForbiddenException('Ordem não encontrada');
    const updatedOrdem = await this.prisma.ordem.update({
      where: { id },
      data: {
        prioridade: updateOrdemDto.prioridade
      }
    });
    if (!updatedOrdem) throw new InternalServerErrorException('Não foi possível atualizar o chamado. Tente novamente');
    return updatedOrdem;
  }

  async criar(createOrdemDto: CreateOrdemDto, solicitante: Usuario) {
    const id = await this.geraId();
    const { unidade_id, andar, sala, tipo, observacoes } = createOrdemDto;
    const unidade = await this.prisma.unidade.findUnique({ where: { id: unidade_id } });
    if (!unidade) throw new ForbiddenException('Unidade não encontrada');
    const novaOrdem = await this.prisma.ordem.create({
      data: { id, unidade_id, solicitante_id: solicitante.id, andar, sala, tipo, observacoes }
    });
    if (!novaOrdem) throw new InternalServerErrorException('Não foi possível criar o chamado. Tente novamente');
    return novaOrdem;
  }

  async buscarTudo(
    pagina: number = 1,
    limite: number = 10,
    status: number = 0,
    unidade_id?: string,
    solicitante_id?: string,
    andar?: number,
    sala?: string,
    tipo?: number
  ) {
    [pagina, limite] = this.app.verificaPagina(pagina, limite);
    const searchParams = {
      ...(status !== 0 && { status }),
      ...(unidade_id !== '' && { unidade_id }),
      ...(solicitante_id !== '' && { solicitante_id }),
      ...(sala !== '' && { sala }),
      ...(andar !== 0 && { sala }),
      ...(tipo !== 0 && { tipo }),
    };
    const total = await this.prisma.ordem.count({ where: searchParams });
    if (total == 0) return { total: 0, pagina: 0, limite: 0, users: [] };
    [pagina, limite] = this.app.verificaLimite(pagina, limite, total);
    const ordens = await this.prisma.ordem.findMany({
      where: searchParams,
      orderBy: { data_solicitacao: 'desc' },
      skip: (pagina - 1) * limite,
      take: limite,
      include: {
        unidade: true,
        solicitante: true
      }
    });
    return {
      total: +total,
      pagina: +pagina,
      limite: +limite,
      data: ordens
    };
  }

  async buscarPorId(id: string) {
    const ordem = await this.prisma.ordem.findUnique({ where: { id } });
    if (!ordem) throw new ForbiddenException('Ordem não encontrada');
    return ordem;
  }

  // async atualizar(id: string, updateOrdemDto: UpdateOrdemDto) {
  // }

  // async desativar(id: string) {
  // }
}
