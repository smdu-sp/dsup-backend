import {
  ForbiddenException,
  Global,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { $Enums, Usuario } from '@prisma/client';
import { AppService } from 'src/app.service';
import { SGUService } from 'src/sgu/sgu.service';
import { Client, createClient } from 'ldapjs';

@Global()
@Injectable()
export class UsuariosService {
  constructor(
    private prisma: PrismaService,
    private prisma2: SGUService,
    private app: AppService,
  ) {}

  async retornaPermissao(id: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    return usuario.permissao;
  }

  async listaCompleta() {
    const lista = await this.prisma.usuario.findMany({
      orderBy: { nome: 'asc' },
      include: {
        unidade: true,
      }
    });
    if (!lista || lista.length == 0) throw new ForbiddenException('Nenhum usuário encontrado.');
    return lista;
  }

  validaPermissaoCriador(
    permissao: $Enums.Permissao,
    permissaoCriador: $Enums.Permissao,
  ) {
    if (
      permissao === $Enums.Permissao.DEV &&
      permissaoCriador === $Enums.Permissao.ADM
    )
      permissao = $Enums.Permissao.ADM;
    if (
      (permissao === $Enums.Permissao.DEV ||
        permissao === $Enums.Permissao.ADM) &&
      permissaoCriador === $Enums.Permissao.TEC
    )
      permissao = $Enums.Permissao.TEC;
    return permissao;
  }

  async criar(createUsuarioDto: CreateUsuarioDto, criador?: Usuario) {
    const loguser = await this.buscarPorLogin(createUsuarioDto.login);
    if (loguser) throw new ForbiddenException('Login já cadastrado.');
    const emailuser = await this.buscarPorEmail(createUsuarioDto.email);
    if (emailuser) throw new ForbiddenException('Email já cadastrado.');
    if (!criador) createUsuarioDto.permissao = 'USR';
    if (criador) {
      const permissaoCriador = await this.retornaPermissao(criador.id);
      if (permissaoCriador !== $Enums.Permissao.DEV)
        createUsuarioDto.permissao = this.validaPermissaoCriador(
          createUsuarioDto.permissao,
          permissaoCriador,
        );
    }
    var unidade_id = createUsuarioDto.unidade_id;
    if (!unidade_id){
      const usuario_sgu = await this.prisma2.tblUsuarios.findFirst({
        where: {
          cpRF: { startsWith: createUsuarioDto.login.substring(1) },
        },
      });
      if (usuario_sgu){
        const codigo = usuario_sgu.cpUnid;
        const unidade = await this.prisma.unidade.findUnique({ where: { codigo } });
        unidade_id = unidade ? unidade.id : '';
      }
    }
    const usuario = await this.prisma.usuario.create({
      data: { 
        ...createUsuarioDto,
        ...(unidade_id ? { unidade_id } : {}),
      }
    });
    if (!usuario)
      throw new InternalServerErrorException(
        'Não foi possível criar o usuário, tente novamente.',
      );
    return usuario;
  }

  async buscarTudo(
    usuario: Usuario = null,
    pagina: number = 1,
    limite: number = 10,
    status: number = 1,
    busca?: string,
    permissao?: string,
    unidade_id?: string,
  ) {
    [pagina, limite] = this.app.verificaPagina(pagina, limite);
    const searchParams = {
      ...(busca && { OR: [
        { nome: { contains: busca } },
        { login: { contains: busca } },
        { email: { contains: busca } },
      ]}),
      ...(unidade_id !== '' && { unidade_id }),
      ...(permissao !== '' && { permissao: $Enums.Permissao[permissao] }),
      ...(usuario.permissao !== 'DEV' ? { status: 1 } : (status !== 4 && { status })),
    };
    const total = await this.prisma.usuario.count({ where: searchParams });
    if (total == 0) return { total: 0, pagina: 0, limite: 0, users: [] };
    [pagina, limite] = this.app.verificaLimite(pagina, limite, total);
    const usuarios = await this.prisma.usuario.findMany({
      where: searchParams,
      orderBy: { nome: 'asc' },
      include: {
        unidade: true,
      },
      skip: (pagina - 1) * limite,
      take: limite,
    });
    return {
      total: +total,
      pagina: +pagina,
      limite: +limite,
      data: usuarios,
    };
  }

  async buscarPorId(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
    });
    return usuario;
  }

  async buscarPorEmail(email: string) {
    return await this.prisma.usuario.findUnique({ where: { email } });
  }

  async buscarPorLogin(login: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { login },
    });
    return usuario;
  }

  async atualizar(
    usuario: Usuario,
    id: string,
    updateUsuarioDto: UpdateUsuarioDto,
  ) {
    const usuarioLogado = await this.buscarPorId(usuario.id);
    if (!usuarioLogado || ['TEC', 'USR'].includes(usuarioLogado.permissao) && id !== usuarioLogado.id)
      throw new ForbiddenException('Operação não autorizada para este usuário.')
    if (updateUsuarioDto.login) {
      const usuario = await this.buscarPorLogin(updateUsuarioDto.login);
      if (usuario && usuario.id !== id)
        throw new ForbiddenException('Login já cadastrado.');
    }
    if (updateUsuarioDto.permissao)
      updateUsuarioDto.permissao = this.validaPermissaoCriador(
        updateUsuarioDto.permissao,
        usuarioLogado.permissao,
      );
    const usuarioAtualizado = await this.prisma.usuario.update({
      data: updateUsuarioDto,
      where: { id },
    });
    return usuarioAtualizado;
  }

  async excluir(id: string) {
    await this.prisma.usuario.update({
      data: { status: 2 },
      where: { id },
    });
    return {
      desativado: true,
    };
  }

  async autorizaUsuario(id: string) {
    const autorizado = await this.prisma.usuario.update({
      where: { id },
      data: { status: 1 },
    });
    if (autorizado && autorizado.status === 1) return { autorizado: true };
    throw new ForbiddenException('Erro ao autorizar o usuário.');
  }

  async validaUsuario(id: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id }, include: { unidade: true } });
    if (!usuario) throw new ForbiddenException('Usuário não encontrado.');
    if (usuario.status !== 1) throw new ForbiddenException('Usuário inativo.');
    return usuario;
  }

  async buscarNovo(login: string){
    const usuarioExiste = await this.buscarPorLogin(login);
    if (usuarioExiste && usuarioExiste.status === 1) throw new ForbiddenException('Login já cadastrado.');
    if (usuarioExiste && usuarioExiste.status !== 1){
      const usuarioReativado = await this.prisma.usuario.update({ where: { id: usuarioExiste.id }, data: { status: 1 } });
      return usuarioReativado;
    }
    const rf = login.substring(1);
    const usuario_sgu = await this.prisma2.tblUsuarios.findFirst({
      where: {
        cpRF: { startsWith: rf },
      }
    });
    var unidade_id = '';
    if (usuario_sgu){
      const codigo = usuario_sgu.cpUnid;
      const unidade = await this.prisma.unidade.findUnique({ where: { codigo } });
      unidade_id = unidade ? unidade.id : '';
    }
    const client: Client = createClient({
      url: process.env.LDAP_SERVER,
    });
    await new Promise<void>((resolve, reject) => {
      client.bind(`${process.env.USER_LDAP}${process.env.LDAP_DOMAIN}`, process.env.PASS_LDAP, (err) => {
        if (err) {
          client.destroy();
          reject(new UnauthorizedException('Credenciais incorretas 2.'));
        }
        resolve();
      });
    });
    const usuario_ldap = await new Promise<any>((resolve, reject) => {
      client.search(
        process.env.LDAP_BASE,
        {
          filter: `(&(samaccountname=${login})(company=SMUL))`,
          scope: 'sub',
          attributes: ['name', 'mail'],
        },
        (err, res) => {
          if (err) {
            client.destroy();
            resolve('erro');
          }
          res.on('searchEntry', async (entry) => {
            const nome = JSON.stringify(
              entry.pojo.attributes[0].values[0],
            ).replaceAll('"', '');
            const email = JSON.stringify(
              entry.pojo.attributes[1].values[0],
            ).replaceAll('"', '').toLowerCase();
            resolve({ nome, email });
          });
          res.on('error', (err) => {
            client.destroy();
            resolve('erro');
          });
          res.on('end', () => {
            client.destroy();
            resolve('erro');
          });
        },
      );
    });
    client.destroy();
    if (!usuario_ldap.email) throw new UnauthorizedException('Credenciais incorretas.');
    return {
      login,
      nome: usuario_ldap.nome,
      email: usuario_ldap.email,
      unidade_id
    };
  }
}
