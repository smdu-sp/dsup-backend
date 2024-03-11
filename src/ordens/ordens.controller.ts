import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Global } from '@nestjs/common';
import { OrdensService } from './ordens.service';
import { CreateOrdemDto } from './dto/create-ordem.dto';
import { UpdateOrdemDto } from './dto/update-ordem.dto';
import { UsuarioAtual } from 'src/auth/decorators/usuario-atual.decorator';
import { Usuario } from '@prisma/client';

@Global()
@Controller('ordens')
export class OrdensController {
  constructor(private readonly ordensService: OrdensService) {}

  @Post('criar')
  criar(@Body() createOrdenDto: CreateOrdemDto, @UsuarioAtual() usuario: Usuario) {
    return this.ordensService.criar(createOrdenDto, usuario);
  }

  @Get('buscar-tudo')
  buscarTudo(
    @UsuarioAtual() usuario: Usuario,
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
    @Query('status') status?: string,
    @Query('unidade_id') unidade_id?: string,
    @Query('solicitante_id') solicitante_id?: string,
    @Query('andar') andar?: string,
    @Query('sala') sala?: string,
    @Query('tipo') tipo?: string,
  ) {
    return this.ordensService.buscarTudo(usuario, +pagina, +limite, +status, unidade_id, solicitante_id, +andar, sala, +tipo);
  }

  @Get('buscar-por-id/:id')
  buscarPorId(@Param('id') id: string) {
    return this.ordensService.buscarPorId(id);
  }

  @Patch('atualizar/:id')
  atualizar(@Param('id') id: string, @Body() updateOrdemDto: UpdateOrdemDto) {
    return this.ordensService.atualizar(id, updateOrdemDto);
  }

  @Get('painel')
  retornaPainel(@UsuarioAtual() usuario: Usuario) {
    return this.ordensService.retornaPainel(usuario);
  }

  // @Delete('desativar/:id')
  // desativar(@Param('id') id: string) {
  //   return this.ordensService.desativar(id);
  // }
}
