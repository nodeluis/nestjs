import { ApiProperty } from '@nestjs/swagger';
import {IsNotEmpty,isString} from 'class-validator';

export class AsignationDto{

    @ApiProperty()
    @IsNotEmpty()
    courseId:number;
    
    @ApiProperty()
    @IsNotEmpty()
    userId:number;

}