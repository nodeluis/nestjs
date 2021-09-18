import { ApiProperty } from '@nestjs/swagger';
import {IsNotEmpty,IsArray,IsString} from 'class-validator';

export class SyncCoursesDto{

    @ApiProperty({
        type:()=>[CoursesSyncDto]
    })
    @IsArray()
    @IsNotEmpty()
    courses:CoursesSyncDto;

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

export class CoursesSyncDto{

    @ApiProperty()
    @IsNotEmpty()
    photo:string;
    course_id:string;
 
}

export class PaidStudentsDto{

    @ApiProperty()
    @IsNotEmpty()
    studentId:number;
 
}
