import { ApiProperty } from '@nestjs/swagger';
import {IsNotEmpty} from 'class-validator';

export class InsertStudentDto{

    @ApiProperty()
    @IsNotEmpty()
    rude:string;

    @ApiProperty()
    @IsNotEmpty()
    identification:string;

    @ApiProperty()
    @IsNotEmpty()
    name:string;

    @ApiProperty()
    @IsNotEmpty()
    gender:string;

    @ApiProperty()
    @IsNotEmpty()
    dateOfBirth:string;

    @ApiProperty()
    @IsNotEmpty()
    country:string;

    @ApiProperty()
    @IsNotEmpty()
    department:string;

    @ApiProperty()
    @IsNotEmpty()
    province:string;

    @ApiProperty()
    @IsNotEmpty()
    locality:string;

    @ApiProperty()
    @IsNotEmpty()
    registration:string;

    @ApiProperty()
    @IsNotEmpty()
    pdfNumber:number;

    //course
    @ApiProperty()
    @IsNotEmpty()
    turn:string;

    @ApiProperty()
    @IsNotEmpty()
    grade:string;

    @ApiProperty()
    @IsNotEmpty()
    group:string;

    @ApiProperty()
    @IsNotEmpty()
    level:string;

    //college
    @ApiProperty()
    @IsNotEmpty()
    schoolCode:string;

    @ApiProperty()
    @IsNotEmpty()
    schoolName:string;

    @ApiProperty()
    @IsNotEmpty()
    year:number;
    
}