import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OrdensService } from './ordens.service';
import { CreateOrdemDto } from './dto/create-ordem.dto';
import { UpdateOrdemDto } from './dto/update-ordem.dto';

@Controller('ordens')
export class OrdensController {
  constructor(private readonly ordensService: OrdensService) {}

  @Post('criar')
  criar(@Body() createOrdenDto: CreateOrdemDto) {
    return this.ordensService.criar(createOrdenDto);
  }

  @Get('buscar-tudo')
  buscarTudo(
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
    @Query('status') status?: string,
    @Query('busca') busca?: string
  ) {
    return this.ordensService.buscarTudo(+pagina, +limite, +status, busca);
  }

  @Get('buscar-por-id/:id')
  buscarPorId(@Param('id') id: string) {
    return this.ordensService.buscarPorId(id);
  }

  @Patch('atualizar/:id')
  atualizar(@Param('id') id: string, @Body() updateOrdemDto: UpdateOrdemDto) {
    return this.ordensService.atualizar(id, updateOrdemDto);
  }

  @Delete('desativar/:id')
  desativar(@Param('id') id: string) {
    return this.ordensService.desativar(id);
  }
}
