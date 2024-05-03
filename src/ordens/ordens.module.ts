import { Global, Module } from '@nestjs/common';
import { OrdensService } from './ordens.service';
import { OrdensController } from './ordens.controller';

@Global()
@Module({
  imports: [],
  exports: [OrdensService],
  controllers: [OrdensController],
  providers: [OrdensService],
})
export class OrdensModule {}
