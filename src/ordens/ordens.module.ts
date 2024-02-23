import { Module } from '@nestjs/common';
import { OrdensService } from './ordens.service';
import { OrdensController } from './ordens.controller';

@Module({
  controllers: [OrdensController],
  providers: [OrdensService],
})
export class OrdensModule {}
