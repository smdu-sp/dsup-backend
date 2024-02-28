import { IsNumber, IsString } from "class-validator";

export class CreateOrdemDto {
    @IsString({ message: 'Unidade inválida!' })
    unidade_id: string;

    @IsNumber({}, { message: 'Andar inválido!' })
    andar: number;

    @IsString({ message: 'Sala inválida!' })
    sala: string;

    @IsNumber({}, { message: 'Tipo inválido!' })
    tipo: number;

    @IsString({ message: 'É necessário descrever o problema a receber o serviço!' })
    observacoes: string;

    @IsNumber({}, { message: 'Nivel de prioridade inválido!' })
    prioridade?: number;
}
