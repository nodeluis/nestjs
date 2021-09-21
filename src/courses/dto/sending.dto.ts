import { ApiProperty } from '@nestjs/swagger';
import {IsNotEmpty,IsArray,IsString} from 'class-validator';

export class SendingDto{


    @ApiProperty()
    @IsNotEmpty()
    id:number;

    @ApiProperty()
    @IsNotEmpty()
    rude:string;
    
    //para evitar conflictos al ultimo manda la foto
}