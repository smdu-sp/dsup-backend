import { IsString } from "class-validator";

export class CreateUnidadeDto {
    @IsString({ message: 'Nome inválido!' })
    nome: string;

    @IsString({ message: 'Sigla inválida!' })
    sigla: string;
}
