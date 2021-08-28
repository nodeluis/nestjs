import { Body, Controller, Get, HttpException, Param, Post, Put } from '@nestjs/common';
import { InsertStudentDto } from '../dto/insertStudent.dto';
import { UpdateStudentsDto } from '../dto/updateCourse.dto';
import { Course } from '../interfaces/courses.interface';
import { Student } from '../interfaces/student.interface';
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

    @Get('united/:id')
    async findCoursesUnity(@Param('id') id:number){
        try {
            const result:Course[]=await this.coursesService.findCoursesUnity(id);
            if(!result)throw new HttpException('Conflicto al hacer la petición',409);
            return result;
        } catch (error) {
            throw new HttpException(error,409);
        }
    }

    @Get('students/:id')
    async findCourseStudents(@Param('id') id:number){
        try {
            const result:Student[]=await this.coursesService.findCourseStudents(id);
            if(!result)throw new HttpException('Conflicto al hacer la petición',409);
            return result;
        } catch (error) {
            throw new HttpException(error,409);
        }
    }

    @Put(':id')
    async updateCourse(@Param('id') id:number,@Body() data:UpdateStudentsDto){
        try {
            const result=await this.coursesService.updateCourse(data);
            if(!result)throw new HttpException('Conflicto al hacer la petición',409);
            return {message:'los estudiantes con el id '+id+' del curso fueron actualizados',students:result};
        } catch (error) {
            throw new HttpException(error,409);
        }
    }
}
