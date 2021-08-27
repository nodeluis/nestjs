import { Body, Controller, Get, HttpException, Post } from '@nestjs/common';
import { InsertStudentDto } from '../dto/insertStudent.dto';
import { CoursesService } from '../services/courses.service';

@Controller('courses')
export class CoursesController {

    constructor(
        private coursesService:CoursesService
    ){}

    /*@Get()
    async pdfReader(){
        try {
            const t=await this.coursesService.pdfReader();
            return {message:'Se ha guardado la base de datos'};
        } catch (error) {
            throw new HttpException(error,409);
        }
    }*/

    @Get('allCourses')
    async findAllCourses(){
        try {
            const courses=await this.coursesService.findAllCourses();
            return courses;
        } catch (error) {
            throw new HttpException(error,409);
        }
    }

    @Get('allStudents')
    async findAllStudents(){
        try {
            const students=await this.coursesService.findAllStudents();
            return students;
        } catch (error) {
            throw new HttpException(error,409);
        }
    }

    @Get('allUniteds')
    async findAllUniteds(){
        try {
            const uniteds=await this.coursesService.findAllUniteds();
            return uniteds;
        } catch (error) {
            throw new HttpException(error,409);
        }
    }

    @Post('student')
    async insertStudent(@Body() body:InsertStudentDto){
        try {
            const student=await this.coursesService.insertStudent(body);
            if(!student) throw new HttpException('Error al insertar el usuario',409);
            return {student,message:'Estudiante insertado'};
        } catch (error) {
            throw new HttpException(error,409);
        }
    }
}
