import { ApiBody, ApiOkResponse, ApiProperty } from '@nestjs/swagger';
import {IsNotEmpty,IsArray} from 'class-validator';

/*@ApiOkResponse(
    description: 'Cat object',
    type: CreateCatDto,
    isArray: true // <= diff is here
)*/
export class UnitedsDto{

    @ApiProperty()
    @IsNotEmpty()
    public schoolCode: string;

    @ApiProperty()
    @IsNotEmpty()
    public schoolName: string;

    @ApiProperty()
    @IsNotEmpty()
    public year: number;

    @ApiProperty({
        type:()=>[CourseDto]
    })
    @IsArray()
    public courses: Array<CourseDto>;
    
}

export class CourseDto{

    @ApiProperty()
    @IsNotEmpty()
    level:string;

    @ApiProperty()
    @IsNotEmpty()
    turn:string;

    @ApiProperty()
    @IsNotEmpty()
    grade:string;

    @ApiProperty()
    @IsNotEmpty()
    group:string;

    @ApiProperty({
        type:()=>[StudentDto]
    })
    @IsArray()
    @IsNotEmpty()
    public students: Array<StudentDto>;
}

export class StudentDto{

    @ApiProperty()
    @IsNotEmpty()
    rude:string;

    @ApiProperty()
    @IsNotEmpty()
    identification:string;

    @ApiProperty()
    @IsNotEmpty()
    pdfNumber:number;

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

}
