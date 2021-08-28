import { ApiProperty } from '@nestjs/swagger';
import {IsNotEmpty,IsArray,IsString} from 'class-validator';

export class UpdateStudentsDto{

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    public students: Array<StudentPaid>;
    
}

export class StudentPaid{

    @ApiProperty()
    @IsNotEmpty()
    public id: number;

    @ApiProperty()
    @IsNotEmpty()
    public paid: boolean;
    
}