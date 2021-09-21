import { ApiProperty } from '@nestjs/swagger';
import {IsNotEmpty} from 'class-validator';

export class SendingDataDto{


    @ApiProperty()
    @IsNotEmpty()
    rude:string;

    @ApiProperty()
    @IsNotEmpty()
    idStudent:number;
    
    //para evitar conflictos al ultimo manda la foto
}