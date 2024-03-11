import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ServicosService } from './servicos.service';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';
import { UsuarioAtual } from 'src/auth/decorators/usuario-atual.decorator';
import { Usuario } from '@prisma/client';

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

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.servicosService.remove(+id);
  // }
}
