import { ForbiddenException, Global, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateOrdemDto } from './dto/create-ordem.dto';
import { UpdateOrdemDto } from './dto/update-ordem.dto';
import { AppService } from 'src/app.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Usuario } from '@prisma/client';

@Global()
@Injectable()
export class OrdensService {
  constructor(
    private prisma: PrismaService,
    private app: AppService,
  ) {}

  async geraId() {
    let id = "";
    let numerico = 1;
    const agora = new Date();
    const data = agora.getFullYear().toString().substring(2);
    const ultimoCadastrado = await this.prisma.ordem.findFirst({
      where: { id: { endsWith: data } },
      orderBy: { data_solicitacao: 'desc' }
    });
    if (ultimoCadastrado)
      numerico = parseInt(ultimoCadastrado.id.substring(0, 4)) + 1;
    id = `${numerico.toString().padStart(4, '0')}-${data}`;
    return id;
  }

  async retornaPainel(usuario: Usuario) {
    const abertos = usuario.permissao === 'USR' ? 
      await this.prisma.ordem.count({ where: { AND: [{ OR: [{ status: 2 }, {status: 1}] }, { solicitante_id: usuario.id } ]}}) :
      await this.prisma.ordem.count({ where: { status: 2 } });
    const naoAtribuidos = await this.prisma.ordem.count({ where: { status: 1 } });
    const concluidos = await this.prisma.ordem.count({ where: { status: 4 } });
    return { abertos, naoAtribuidos, concluidos };
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
    const { unidade_id, andar, sala, tipo, observacoes, telefone, prioridade, tratar_com } = createOrdemDto;
    const chamadoAberto = await this.prisma.ordem.findFirst({
      where: {
        unidade_id,
        status: 3
      }
    });
    if (chamadoAberto) throw new ForbiddenException('Não é possível abrir novo chamado, pois há um chamado pendente de avaliação pela unidade.');
    const unidade = await this.prisma.unidade.findUnique({ where: { id: unidade_id } });
    if (!unidade) throw new ForbiddenException('Unidade não encontrada');
    const novaOrdem = await this.prisma.ordem.create({
      data: { id, unidade_id, solicitante_id: solicitante.id, andar, sala, tipo, observacoes, telefone, tratar_com, prioridade: prioridade ? prioridade : 1 }
    });
    if (!novaOrdem) throw new InternalServerErrorException('Não foi possível criar o chamado. Tente novamente');
    return novaOrdem;
  }

  async buscarTudo(
    usuario: Usuario,
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
      ...(usuario.permissao === 'USR' && { solicitante_id: usuario.id }),
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
        solicitante: true,
        servicos: {
          include: {
            tecnico: true
          }
        }
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
    const ordem = await this.prisma.ordem.findUnique({ 
      where: { id },
      include: {
        solicitante: true,
        unidade: true,
        servicos: {
          include: {
            suspensoes: true,
            materiais: true,
            tecnico: true
          },
          orderBy: { data_inicio: 'desc' }
        },
      }
    });
    const suspensaoAtiva = await this.prisma.servico.findFirst({ where: { ordem_id: id, status: 5 } });
    if (!ordem) throw new ForbiddenException('Ordem não encontrada');
    return { ...ordem, suspensaoAtiva: suspensaoAtiva ? true : false };
  }

  // async desativar(id: string) {
  // }
}
