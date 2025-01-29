import { Injectable } from '@nestjs/common';
import { AppService } from 'src/app.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Injectable()
export class RelatoriosService {
  constructor(
    private prisma: PrismaService,
    private app: AppService,
    private usuarios: UsuariosService,
  ) {
  }

  async listarChamadosPeriodoAno(
    ano_inicio: number = 2024,
    ano_fim?: number
  ) {
    const prioridades = ['', 'Baixa', 'Média', 'Alta', 'Urgente']
    const tipos = ['', 'Elétrica', 'Hidráulica', 'Telefonia', 'Outros']
    const status = ['', 'Aberto', 'Em Andamento', 'Aguardando avaliação', 'Concluído']

    if (!ano_fim)
      ano_fim = ano_inicio;

    if (ano_inicio > ano_fim || ano_inicio < 2024 || ano_fim < 2024)
      throw new Error('Ano de início deve ser maior ou igual a 2024 e menor ou igual ao ano de fim');

    const chamados = await this.prisma.ordem.findMany({
      where: {
        data_solicitacao: {
          gte: new Date(ano_inicio, 0, 1),
          lt: new Date(ano_fim + 1, 0, 1),
        },
      },
      orderBy: {
        data_solicitacao: 'asc',
      },
      select: {
        id: true,
        data_solicitacao: true,
        prioridade: true,
        tipo: true,
        status: true,
        solicitante: {
          select: {
            nome: true,
          },
        },
        unidade: {
          select: {
            sigla: true,
          },
        },
        servicos: {
          orderBy: {
            data_inicio: 'desc',
          },
          select: {
            data_fim: true,
            tecnico: {
              select: {
                nome: true,
              },
            }
          }
        }
      }
    });

    const relatorioChamados = chamados.map(chamado => {
      return {
        '#': chamado.id,
        Prioridade: prioridades[chamado.prioridade],
        Tipo: tipos[chamado.tipo],
        Status: status[chamado.status],
        Unidade: chamado.unidade.sigla,
        Solicitante: chamado.solicitante.nome,
        'Técnico Responsável': chamado.servicos[0].tecnico.nome,
        'Data de Abertura': new Date(chamado.data_solicitacao).toLocaleDateString().split('T')[0],
        'Data de Encerramento': chamado.servicos[0].data_fim ? new Date(chamado.servicos[0].data_fim).toLocaleDateString().split('T')[0] : "",
      }
    });

    return relatorioChamados;
  }
}
