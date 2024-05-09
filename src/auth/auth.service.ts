import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { Usuario } from '@prisma/client';
import { UsuarioPayload } from './models/UsuarioPayload';
import { JwtService } from '@nestjs/jwt';
import { UsuarioToken } from './models/UsuarioToken';
import { Client, createClient } from 'ldapjs';
import { UsuarioJwt } from './models/UsuarioJwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async login(usuario: Usuario): Promise<UsuarioToken> {
    const { access_token, refresh_token } = await this.getTokens(usuario);
    return { access_token, refresh_token };
  }

  async refresh(usuario: Usuario) {
    const { access_token, refresh_token } = await this.getTokens(usuario);
    return { access_token, refresh_token };
  }

  async getTokens(usuario: UsuarioJwt) {
    const { id, login, nome, email, permissao, status } = usuario;
    const payload: UsuarioPayload = { sub: id, login, nome, email, permissao, status };
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_SECRET,
    });
    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.RT_SECRET,
    });
    return { access_token, refresh_token };
  }

  async validateUser(login: string, senha: string) {
    let usuario = await this.usuariosService.buscarPorLogin(login);
    if (!usuario) throw new UnauthorizedException('Usuário não encontrado.');
    if (usuario && usuario.status !== 1)
      throw new UnauthorizedException('Usuário inativo.');
    if (process.env.ENVIRONMENT == 'local') {
      if (usuario) return usuario;
    }
    const client: Client = createClient({
      url: process.env.LDAP_SERVER,
    });
    await new Promise<void>((resolve, reject) => {
      client.bind(`${login}${process.env.LDAP_DOMAIN}`, senha, (err) => {
        if (err) {
          client.destroy();
          reject(new UnauthorizedException('Credenciais incorretas.'));
        }
        resolve();
      });
    });
    client.destroy();
    return usuario;
  }
}
