import { IsBoolean, IsString } from "class-validator";

export class CreateUnidadeDto {
    @IsString({ message: 'Nome inválido!' })
    nome: string;

    @IsString({ message: 'Sigla inválida!' })
    sigla: string;

    @IsString({ message: 'Código inválido!' })
    codigo: string;

    @IsBoolean({ message: 'Status inválida!' })
    status?: boolean;
}
