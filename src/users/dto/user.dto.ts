import { ApiProperty } from '@nestjs/swagger';
import {IsNotEmpty,isString} from 'class-validator';

export class UserDto{

    @ApiProperty()
    @IsNotEmpty()
    user:string;

    @ApiProperty()
    @IsNotEmpty()
    password:string;
    
}