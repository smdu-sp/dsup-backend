import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Request } from '@nestjs/common';
import { ServicosService } from './servicos.service';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';
import { UsuarioAtual } from 'src/auth/decorators/usuario-atual.decorator';
import { Usuario } from '@prisma/client';
import { AvaliarServicoDto } from './dto/avaliar-servico-dto';
import { Request as Req } from 'express';

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
    @Request() req: Req,
  ) {
    console.log(req.body);
    // return this.servicosService.avaliarServico(avaliarServicoDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.servicosService.remove(+id);
  // }
}
