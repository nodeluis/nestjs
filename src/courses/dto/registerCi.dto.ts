import { ApiProperty } from '@nestjs/swagger';
import {IsNotEmpty,IsArray,IsString} from 'class-validator';

export class RegisterCi{


    @ApiProperty()
    @IsNotEmpty()
    id:number;

    @ApiProperty()
    @IsNotEmpty()
    rude:number;
    
    //para evitar conflictos al ultimo manda la foto
}