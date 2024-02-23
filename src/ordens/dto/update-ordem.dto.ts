import { PartialType } from '@nestjs/mapped-types';
import { CreateOrdemDto } from './create-ordem.dto';

export class UpdateOrdemDto extends PartialType(CreateOrdemDto) {}
