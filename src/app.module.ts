import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RoleGuard } from './auth/guards/role.guard';
import { PrismaModule } from './prisma/prisma.module';
import { UnidadesModule } from './unidades/unidades.module';
import { OrdensModule } from './ordens/ordens.module';
import { SGUModule } from './sgu/sgu.module';
import { ServicosModule } from './servicos/servicos.module';

@Global()
@Module({
  imports: [UsuariosModule, AuthModule, PrismaModule, SGUModule, UnidadesModule, OrdensModule, ServicosModule],
  exports: [AppService],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule {}
