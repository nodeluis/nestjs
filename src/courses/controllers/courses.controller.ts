import { Controller, Get, HttpException } from '@nestjs/common';
import { CoursesService } from '../services/courses.service';

@Controller('courses')
export class CoursesController {

    constructor(
        private coursesService:CoursesService
    ){}

    @Get()
    async pdfReader(){
        try {
            const t=await this.coursesService.pdfReader();
            return {message:'Se ha guardado la base de datos'};
        } catch (error) {
            throw new HttpException(error,409);
        }
    }
}
