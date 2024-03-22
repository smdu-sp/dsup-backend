import { IsPublic } from './../auth/decorators/is-public.decorator';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UnidadesService } from './unidades.service';
import { CreateUnidadeDto } from './dto/create-unidade.dto';
import { UpdateUnidadeDto } from './dto/update-unidade.dto';
import { Permissoes } from 'src/auth/decorators/permissoes.decorator';

@Controller('unidades')
export class UnidadesController {
  constructor(private readonly unidadesService: UnidadesService) {}

  @Permissoes('ADM')
  @Post('criar')
  criar(@Body() createUnidadeDto: CreateUnidadeDto) {
    return this.unidadesService.criar(createUnidadeDto);
  }

  @Permissoes('ADM')
  @Get('buscar-tudo')
  buscarTudo(
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
    @Query('status') status?: string,
    @Query('busca') busca?: string,
  ) {
    return this.unidadesService.buscarTudo(+pagina, +limite, status, busca);
  }

  @Permissoes('ADM', 'TEC', 'USR')
  @Get('lista-completa')
  listaCompleta() {
    return this.unidadesService.listaCompleta();
  }

  @Permissoes('ADM')
  @Get('buscar-por-id/:id')
  buscarPorId(@Param('id') id: string) {
    return this.unidadesService.buscarPorId(id);
  }

  @Permissoes('ADM')
  @Patch('atualizar/:id')
  atualizar(@Param('id') id: string, @Body() updateUnidadeDto: UpdateUnidadeDto) {
    return this.unidadesService.atualizar(id, updateUnidadeDto);
  }

  @Permissoes('ADM')
  @Delete('desativar/:id')
  desativar(@Param('id') id: string) {
    return this.unidadesService.desativar(id);
  }
}
