import { ApiProperty } from '@nestjs/swagger';
import {IsNotEmpty} from 'class-validator';

export class InsertStudentDto{

    @ApiProperty()
    @IsNotEmpty()
    rude:string;

    @ApiProperty()
    @IsNotEmpty()
    credential:string;

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
    departament:string;

    @ApiProperty()
    @IsNotEmpty()
    province:string;

    @ApiProperty()
    @IsNotEmpty()
    locality:string;

    @ApiProperty()
    @IsNotEmpty()
    registration:string;

    //course
    @ApiProperty()
    @IsNotEmpty()
    turn:string;

    @ApiProperty()
    @IsNotEmpty()
    yearOfSchoollarity:number;

    @ApiProperty()
    @IsNotEmpty()
    group:string;

    //college
    @ApiProperty()
    @IsNotEmpty()
    schoolCode:string;

    @ApiProperty()
    @IsNotEmpty()
    schoolName:string;
    
}