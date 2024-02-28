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

  async importar() {
    const data = [
      {
        "codigo": "290100000000000",
        "nome": "GABINETE DO SECRETARIO",
        "sigla": "GAB"
      },
      {
        "codigo": "290101000000000",
        "nome": "ASSESSORIA TECNICA E JURIDICA",
        "sigla": "ATAJ"
      },
      {
        "codigo": "290102000000000",
        "nome": "ASSESSORIA TECNICA DE COLEGIADOS E COMISSOES",
        "sigla": "ATECC"
      },
      {
        "codigo": "290103000000000",
        "nome": "ASSESSORIA DE COMUNICACAO",
        "sigla": "ASCOM"
      },
      {
        "codigo": "290104000000000",
        "nome": "ASSESSORIA DE TECNOLOGIA DA INFORMACAO E COMUNICACAO",
        "sigla": "ATIC"
      },
      {
        "codigo": "290200000000000",
        "nome": "COORDENADORIA DE EDIFICACAO DE USO RESIDENCIAL",
        "sigla": "RESID"
      },
      {
        "codigo": "290200010000000",
        "nome": "DIVISAO DE USO RESIDENCIAL VERTICAL",
        "sigla": "RESID/DRVE"
      },
      {
        "codigo": "290200020000000",
        "nome": "DIVISAO DE USO RESIDENCIAL HORIZONTAL E VERTICAL DE GRANDE PORTE",
        "sigla": "RESID/DRGP"
      },
      {
        "codigo": "290200030000000",
        "nome": "DIVISAO DE USO RESIDENCIAL HORIZONTAL",
        "sigla": "RESID/DRH"
      },
      {
        "codigo": "290300000000000",
        "nome": "COORDENADORIA DE EDIFICACAO DE USO COMERCIAL E INDUSTRIAL",
        "sigla": "COMIN"
      },
      {
        "codigo": "290300010000000",
        "nome": "DIVISAO DE USO COMERCIAL E INDUSTRIAL DE PEQUENO E MEDIO PORTE",
        "sigla": "COMIN/DCIMP"
      },
      {
        "codigo": "290300020000000",
        "nome": "DIVISAO DE USO COMERCIAL E INDUSTRIAL DE GRANDE PORTE",
        "sigla": "COMIN/DCIGP"
      },
      {
        "codigo": "290400000000000",
        "nome": "COORDENADORIA DE EDIFICACAO DE SERVICOS E USO INSTITUCIONAL DE PEQUENO E MEDIO PORTE",
        "sigla": "SERVIN"
      },
      {
        "codigo": "290400010000000",
        "nome": "DIVISAO DE SERVICOS E USO INSTITUCIONAL DE MEDIO PORTE",
        "sigla": "SERVIN/DSIMP"
      },
      {
        "codigo": "290400020000000",
        "nome": "DIVISAO DE SERVICOS E USO INSTITUCIONAL DE GRANDE PORTE",
        "sigla": "SERVIN/DSIGP"
      },
      {
        "codigo": "290500000000000",
        "nome": "COORDENADORIA DE PARCELAMENTO DO SOLO E DE HABITACAO DE INTERESSE SOCIAL",
        "sigla": "PARHIS"
      },
      {
        "codigo": "290500010000000",
        "nome": "DIVISAO DE HABITACAO DE INTERESSE SOCIAL E MERCADO POPULAR DE PEQUENO PORTE",
        "sigla": "PARHIS/DHPP"
      },
      {
        "codigo": "290500020000000",
        "nome": "DIVISAO DE HABITACAO DE INTERESSE SOCIAL E MERCADO POPULAR DE GRANDE PORTE",
        "sigla": "PARHIS/DHGP"
      },
      {
        "codigo": "290500030000000",
        "nome": "DIVISAO DE PARCELAMENTO DO SOLO",
        "sigla": "PARHIS/DPS"
      },
      {
        "codigo": "290500040000000",
        "nome": "DIVISAO DE HABITACAO DE INTERESSE SOCIAL E MERCADO MÉDIO PORTE",
        "sigla": "PARHIS/DHMP"
      },
      {
        "codigo": "290600000000000",
        "nome": "COORDENADORIA DE CONTROLE E USO DE IMOVEIS",
        "sigla": "CONTRU"
      },
      {
        "codigo": "290600010000000",
        "nome": "DIVISAO DE ADAPTACAO A ACESSIBILIDADE",
        "sigla": "CONTRU/DACESS"
      },
      {
        "codigo": "290600020000000",
        "nome": "DIVISAO DE SEGURANCA DE USO",
        "sigla": "CONTRU/DSUS"
      },
      {
        "codigo": "290600030000000",
        "nome": "DIVISAO DE LOCAL DE REUNIAO",
        "sigla": "CONTRU/DLR"
      },
      {
        "codigo": "290600040000000",
        "nome": "DIVISAO DE EQUIPAMENTOS E INSTALACOES",
        "sigla": "CONTRU/DINS"
      },
      {
        "codigo": "290700000000000",
        "nome": "COORDENADORIA DE CADASTRO, ANALISE DE DADOS E SISTEMA ELETRONICO DE LICENCIAMENTO",
        "sigla": "CASE"
      },
      {
        "codigo": "290700010000000",
        "nome": "SUPERVISAO DE LICENCIAMENTO ELETRONICO E ANALISE DE DADOS",
        "sigla": "CASE/STEL"
      },
      {
        "codigo": "290700020000000",
        "nome": "DIVISAO DE CADASTRO",
        "sigla": "CASE/DCAD"
      },
      {
        "codigo": "290700030000000",
        "nome": "DIVISAO DE LOGRADOUROS E EDIFICACOES",
        "sigla": "CASE/DLE"
      },
      {
        "codigo": "290700040000000",
        "nome": "DIVISAO DE DADOS URBANISTICOS",
        "sigla": "CASE/DDU"
      },
      {
        "codigo": "290900000000000",
        "nome": "COORDENADORIA DE ATENDIMENTO AO PUBLICO",
        "sigla": "CAP"
      },
      {
        "codigo": "290900010000000",
        "nome": "DIVISAO DE PROTOCOLO",
        "sigla": "CAP/DEPROT"
      },
      {
        "codigo": "290900020000000",
        "nome": "DIVISAO DE PROCESSOS COMUNICADOS E INDEFERIDOS",
        "sigla": "CAP/DPCI"
      },
      {
        "codigo": "290900030000000",
        "nome": "DIVISAO DE PROCESSOS DEFERIDOS",
        "sigla": "CAP/DPD"
      },
      {
        "codigo": "291000000000000",
        "nome": "COORDENADORIA DE ADMINISTRACAO E FINANCAS",
        "sigla": "CAF"
      },
      {
        "codigo": "291000010000000",
        "nome": "DIVISAO DE ORCAMENTO E FINANCAS",
        "sigla": "CAF/DOF"
      },
      {
        "codigo": "291000020000000",
        "nome": "DIVISAO DE GESTAO DE PESSOAS",
        "sigla": "CAF/DGP"
      },
      {
        "codigo": "291000030000000",
        "nome": "DIVISAO DE LICITACOES E CONTRATOS",
        "sigla": "CAF/DLC"
      },
      {
        "codigo": "291000040000000",
        "nome": "DIVISAO DE SERVICOS DE SUPORTE",
        "sigla": "CAF/DSUP"
      },
      {
        "codigo": "291000050000000",
        "nome": "DIVISAO DE GESTAO DE RECURSOS VINCULADOS",
        "sigla": "CAF/DRV"
      },
      {
        "codigo": "291200000000000",
        "nome": "COORDENADORIA DE PLANEJAMENTO URBANO",
        "sigla": "PLANURB"
      },
      {
        "codigo": "291200010000000",
        "nome": "DIVISAO DE ORDENAMENTO TERRITORIAL",
        "sigla": "PLANURB/DOT"
      },
      {
        "codigo": "291200020000000",
        "nome": "DIVISAO DE MONITORAMENTO E AVALIACAO",
        "sigla": "PLANURB/DMA"
      },
      {
        "codigo": "291200030000000",
        "nome": "DIVISAO DE ARTICULACAO INTERSETORIAL",
        "sigla": "PLANURB/DART"
      },
      {
        "codigo": "291300000000000",
        "nome": "COORDENADORIA DE LEGISLACAO DE USO E OCUPACAO DO SOLO",
        "sigla": "DEUSO"
      },
      {
        "codigo": "291300010000000",
        "nome": "DIVISAO DE MONITORAMENTO DO USO DO SOLO",
        "sigla": "DEUSO/DMUS"
      },
      {
        "codigo": "291300020000000",
        "nome": "DIVISAO DE NORMATIZACAO DO USO DO SOLO",
        "sigla": "DEUSO/DNUS"
      },
      {
        "codigo": "291300030000000",
        "nome": "DIVISAO DE SISTEMA DE INFORMACOES SOBRE ZONEAMENTO",
        "sigla": "DEUSO/DSIZ"
      },
      {
        "codigo": "291400000000000",
        "nome": "COORDENADORIA DE PRODUCAO E ANALISE DE INFORMACAO",
        "sigla": "GEOINFO"
      },
      {
        "codigo": "291500000000000",
        "nome": "COORDENADORIA DE CONTROLE DA FUNCAO SOCIAL DA PROPRIEDADE",
        "sigla": "CEPEUC"
      },
      {
        "codigo": "291500010000000",
        "nome": "DIVISAO DE CADASTRO E INFORMACOES TERRITORIAIS",
        "sigla": "CEPEUC/DCIT"
      },
      {
        "codigo": "291500020000000",
        "nome": "DIVISAO DE VISTORIA E FISCALIZACAO",
        "sigla": "CEPEUC/DVF"
      },
      {
        "codigo": "291500030000000",
        "nome": "DIVISAO DE ANALISE DOCUMENTAL",
        "sigla": "CEPEUC/DDOC"
      },
      {
        "codigo": "291800000000000",
        "nome": "COORDENADORIA DE APROVACAO DE EDIFICACOES DE PEQUENO PORTE",
        "sigla": "CAEPP"
      },
      {
        "codigo": "291801000000000",
        "nome": "DIVISAO DE EDIFICACOES RESIDENCIAIS DE PEQUENO PORTE",
        "sigla": "CAEPP/DERPP"
      },
      {
        "codigo": "291802000000000",
        "nome": "DIVISAO DE EDIFICACOES COMERCIAIS E INDUSTRIAIS DE PEQUENO PORTE",
        "sigla": "CAEPP/DECPP"
      },
      {
        "codigo": "291803000000000",
        "nome": "DIVISAO DE EDIFICACOES DE SERVICOS DE PEQUENO PORTE",
        "sigla": "CAEPP/DESPP"
      }
    ];
    const importados = await this.prisma.unidade.createMany({ data });
  }

  // async testaConexao() {
  //   const oracledb = require('oracledb');
  //   oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
  //   oracledb.initOracleClient();
  //   const objConn: Connection = await oracledb.getConnection({
  //     user          : process.env.ORACLEDB_USER,
  //     password      : process.env.ORACLEDB_PASSWORD,
  //     connectString : "cprodamibs6525.PRODAM:1521/ORA011"
  //   });
  //   console.log(await objConn.execute(`
  //     CALL SOE5P03(d634035)
  //   `));
  //   console.log(await objConn.execute(`
  //     SELECT 
  //         *
  //     FROM 
  //         all_objects
  //     WHERE
  //         object_name = 'SOE5P03'
  //   `));
  // }
}
