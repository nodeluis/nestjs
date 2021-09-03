import { Body, Controller, Get, HttpException, Param, Post, Put, Res } from '@nestjs/common';
import { ApiParam,ApiBodyOptions, ApiBody } from '@nestjs/swagger';
import { InsertStudentDto } from '../dto/insertStudent.dto';
import { UnitedsDto } from '../dto/post.dto';
import { UpdateStudentsDto } from '../dto/updateCourse.dto';
import { Course } from '../interfaces/courses.interface';
import { Student } from '../interfaces/student.interface';
import { CoursesService } from '../services/courses.service';
import { Request, Response } from 'express';

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

    @ApiParam({name: 'id', required: true, description: 'Id de la Escuela para buscar todos los cursos pertenecientes a la Unidad Educativa' })
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

    @ApiParam({name: 'id', required: true, description: 'Id del curso para buscar los estudiantes pertenecientes al curso' })
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

    @ApiBody({
        type:[UnitedsDto]
    })
    @Post('send')
    async postAllData(@Body() data:UnitedsDto[]){
        try {
            const result=await this.coursesService.postAllData(data);
            if(!result)throw new HttpException('Conflicto al hacer la petición',409);
            return {message: 'Se insertaron todos los datos'};
        } catch (error) {
            throw new HttpException(error,409);
        }
    }

    @ApiParam({name: 'id', required: true, description: 'Id del curso para generar el pdf' })
    @Get('pdfqr/:id')
    async getPdfqr(@Param('id') id:number,@Res() res: Response,): Promise<void>{
        try {
            const result: Buffer=await this.coursesService.getPdfACourse(id);
            res.set({
                // pdf
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=invoice.pdf',
                'Content-Length': result.length,
          
                // prevent cache
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': 0,
            });
            res.end(result)
        } catch (error) {
            throw new HttpException(error,409);
        }
    }

    @ApiParam({name: 'id', required: true, description: 'Id del curso para generar el pdf sin el qr' })
    @Get('pdf/:id')
    async getPdf(@Param('id') id:number,@Res() res: Response,): Promise<void>{
        try {
            const result: Buffer=await this.coursesService.getPdfACourseWithOutQr(id);
            res.set({
                // pdf
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=invoice.pdf',
                'Content-Length': result.length,
          
                // prevent cache
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': 0,
            });
            res.end(result)
        } catch (error) {
            throw new HttpException(error,409);
        }
    }

    //crear database
    @Get('created')
    async createDatabase(){
        try {
            const result: boolean=await this.coursesService.createDatabase();
            if(!result)throw new HttpException('Conflicto al hacer la petición',409);
            return {message: 'Se insertaron todos los datos'};
        } catch (error) {
            throw new HttpException(error,409);
        }
    }
}
