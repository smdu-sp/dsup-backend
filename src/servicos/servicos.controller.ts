import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Request } from '@nestjs/common';
import { ServicosService } from './servicos.service';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';
import { UsuarioAtual } from 'src/auth/decorators/usuario-atual.decorator';
import { Usuario } from '@prisma/client';
import { AvaliarServicoDto } from './dto/avaliar-servico-dto';
import { Request as Req } from 'express';
import { AdicionarSuspensaoDto } from './dto/adicionar-suspensao-dto';
import { AdicionarMaterialDto } from './dto/adicionar-material-dto';

@Controller('servicos')
export class ServicosController {
  constructor(private readonly servicosService: ServicosService) {}

  @Post('criar')
  criar(@Body() createServicoDto: CreateServicoDto, @UsuarioAtual() usuario: Usuario) {
    return this.servicosService.criar(createServicoDto, usuario);
  }

  @Get('buscar-por-ordem/:ordem_id')
  buscarPorOrdem(@Param('ordem_id') ordem_id: string) {
    return this.servicosService.buscarPorOrdem(ordem_id);
  }

  @Get('buscar-por-id/:id')
  buscarPorId(@Param('id') id: string) {
    return this.servicosService.buscarPorId(id);
  }

  @Patch('atualizar/:id')
  atualizar(@Param('id') id: string, @Body() updateServicoDto: UpdateServicoDto) {
    return this.servicosService.atualizar(id, updateServicoDto);
  }

  @Get('finalizar-servico/:id')
  finalizarServico(@Param('id') id: string, @UsuarioAtual() usuario: Usuario) {
    return this.servicosService.finalizarServico(id, usuario);
  }

  @Patch('avaliar-servico/:id')
  avaliarServico(
    @Param('id') id: string,
    @Body() avaliarServicoDto: AvaliarServicoDto,
    @UsuarioAtual() usuario: Usuario,
  ) {
    return this.servicosService.avaliarServico(id, avaliarServicoDto, usuario);
  }

  @Patch('adicionar-suspensao/:id')
  adicionarSuspensao(
    @Param('id') id: string,
    @Body() adicionarSuspensaoDto: AdicionarSuspensaoDto,
    @UsuarioAtual() usuario: Usuario,
  ) {
    return this.servicosService.adicionarSuspensao(id, adicionarSuspensaoDto, usuario);
  }

  @Get('retomar-servico/:id')
  retomarServico(
    @Param('id') id: string,
    @UsuarioAtual() usuario: Usuario,
  ) {
    return this.servicosService.retomarServico(id, usuario);
  }

  @Post('adicionar-material/:id')
  adicionarMaterial(
    @Param('id') id: string,
    @Body() adicionarMaterialDto: AdicionarMaterialDto,
    @UsuarioAtual() usuario: Usuario,
  ) {
    return this.servicosService.adicionarMaterial(id, adicionarMaterialDto, usuario);
  }

  @Delete('remover-material/:id')
  remove(@Param('id') material_id: string, @UsuarioAtual() usuario: Usuario) {
    return this.servicosService.removerMaterial(material_id, usuario);
  }
}
