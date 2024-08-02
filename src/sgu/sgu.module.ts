import { Global, Module } from '@nestjs/common';
import { SGUService } from './sgu.service';

@Global()
@Module({
  providers: [SGUService],
  exports: [SGUService],
})
export class SGUModule {}
