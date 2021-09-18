import { ApiProperty } from '@nestjs/swagger';
import {IsNotEmpty,IsArray,IsString} from 'class-validator';

export class SyncStudentsDto{

    @ApiProperty()
    @IsNotEmpty()
    courseId:number;

    @ApiProperty()
    @IsNotEmpty()
    totalPaid:number;

    @ApiProperty()
    @IsNotEmpty()
    userId:number;

    @ApiProperty()
    @IsNotEmpty()
    payDate:Date;

    @ApiProperty({
        type:()=>[PaidStudentsDto]
    })
    @IsArray()
    @IsNotEmpty()
    public paidStudents: Array<PaidStudentsDto>;
    
    //para evitar conflictos al ultimo manda la foto
}

export class PaidStudentsDto{

    @ApiProperty()
    @IsNotEmpty()
    studentId:number;
 
}
