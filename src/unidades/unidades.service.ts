import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUnidadeDto } from './dto/create-unidade.dto';
import { UpdateUnidadeDto } from './dto/update-unidade.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from 'src/app.service';
// import { Connection } from 'oracledb';

@Injectable()
export class UnidadesService {
  constructor(
    private prisma: PrismaService,
    private app: AppService
  ) {}

  async listaCompleta() {
    const lista = await this.prisma.unidade.findMany({
      orderBy: { nome: 'asc' }
    });
    if (!lista || lista.length == 0) throw new ForbiddenException('Nenhuma unidade encontrada');
    return lista;
  }

  async buscaPorCodigo(codigo: string) {
    const unidade = await this.prisma.unidade.findUnique({
      where: { codigo }
    });
    return unidade;
  }

  async buscaPorSigla(sigla: string) {
    const unidade = await this.prisma.unidade.findUnique({
      where: { sigla }
    });
    return unidade;
  }

  async buscaPorNome(nome: string) {
    const unidade = await this.prisma.unidade.findUnique({
      where: { nome }
    });
    return unidade;
  }

  async criar(createUnidadeDto: CreateUnidadeDto) {
    const { nome, sigla, codigo } = createUnidadeDto;
    if (await this.buscaPorCodigo(codigo)) throw new ForbiddenException('Ja existe uma unidade com o mesmo código');
    if (await this.buscaPorNome(nome)) throw new ForbiddenException('Ja existe uma unidade com o mesmo nome');
    if (await this.buscaPorSigla(sigla)) throw new ForbiddenException('Ja existe uma unidade com a mesmo sigla');
    const novaUnidade = await this.prisma.unidade.create({
      data: { nome, sigla, status: true, codigo }
    });
    if (!novaUnidade) throw new InternalServerErrorException('Não foi possível criar a unidade. Tente novamente.');
    return novaUnidade;
  }

  async buscarTudo(
    pagina: number = 1,
    limite: number = 10,
    status: string = 'all',
    busca?: string
  ) {
    [pagina, limite] = this.app.verificaPagina(pagina, limite);
    const searchParams = {
      ...(busca ? 
        { OR: [
            { nome: { contains: busca } },
            { sigla: { contains: busca } },
        ] } : 
        {}),
      ...(status == 'all' ? {} : { status: status === 'true' }),
    };
    const total = await this.prisma.unidade.count({ where: searchParams });
    if (total == 0) return { total: 0, pagina: 0, limite: 0, users: [] };
    [pagina, limite] = this.app.verificaLimite(pagina, limite, total);
    const unidades = await this.prisma.unidade.findMany({
      where: searchParams,
      orderBy: { codigo: 'asc' },
      skip: (pagina - 1) * limite,
      take: limite,
    });
    return {
      total: +total,
      pagina: +pagina,
      limite: +limite,
      data: unidades
    };
  }

  async buscarPorId(id: string) {
    const unidade = await this.prisma.unidade.findUnique({ where: { id } });
    if (!unidade) throw new ForbiddenException('Unidade não encontrada.');
    return unidade;
  }

  async atualizar(id: string, updateUnidadeDto: UpdateUnidadeDto) {
    const { nome, sigla, codigo } = updateUnidadeDto;
    const unidade = await this.prisma.unidade.findUnique({ where: { id } });
    if (!unidade) throw new ForbiddenException('Unidade não encontrada.');
    if (nome) {
      const unidadeNome = await this.buscaPorNome(nome);
      if (unidadeNome && unidadeNome.id != id) throw new ForbiddenException('Já existe uma unidade com o mesmo nome.');
    }
    if (sigla) {
      const unidadeSigla = await this.buscaPorSigla(sigla);
      if (unidadeSigla && unidadeSigla.id != id) throw new ForbiddenException('Já existe uma unidade com a mesma sigla.');
    }
    if (codigo) {
      const unidadeCodigo = await this.buscaPorCodigo(codigo);
      if (unidadeCodigo && unidadeCodigo.id != id) throw new ForbiddenException('Já existe uma unidade com o mesmo código.');
    }
    const updatedUnidade = await this.prisma.unidade.update({
      where: { id },
      data: updateUnidadeDto
    });
    if (!updatedUnidade) throw new InternalServerErrorException('Não foi possível atualizar a unidade. Tente novamente.');
    return updatedUnidade;
  }

  async desativar(id: string) {
    const unidade = await this.prisma.unidade.findUnique({ where: { id } });
    if (!unidade) throw new ForbiddenException('Unidade não encontrada.');
    const updatedUnidade = await this.prisma.unidade.update({
      where: { id },
      data: { status: false }
    });
    if (!updatedUnidade) throw new InternalServerErrorException('Não foi possível desativar a unidade. Tente novamente.');
    return {
      message: 'Unidade desativada com sucesso.'
    }
  }
}
