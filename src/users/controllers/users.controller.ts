import { Body, Controller, Delete, Get, HttpException, Param, Post, Put } from '@nestjs/common';
import { Course } from 'src/courses/interfaces/courses.interface';
import { AsignationDto } from '../dto/asignation.dto';
import { UserDto } from '../dto/user.dto';
import { User } from '../interfaces/user.interface';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {


    constructor(
        private userService:UsersService
    ){}

    //poner la ruta entre el parentesis para diferenciar
    @Get()
    async findAll(){
        //throw new HttpException('Error al tratar',400);
        try {
            const users:User[]=await this.userService.findAll();
            if(!users)throw new HttpException('Conflicto al hacer la petición',409);
            return users;
        } catch (error) {
            throw new HttpException(error,409);
        }
    }

    @Get(':id')
    async findOne(@Param('id') id:number){
        try {
            const user=await this.userService.findOne(id);
            if(!user)throw new HttpException('Conflicto al buscar el usuario verifique el id',409);
            return user;
        } catch (error) {
            throw new HttpException(error,409);
        }
    }

    @Post()
    async createUser(@Body() body:UserDto){
        try {
            const user:User=body;
            const result:User=await this.userService.createUser(user);
            if(!result)throw new HttpException('Error al crear',409);
            return {message:'Se creó el usuario', result};
        } catch (error) {
            throw new HttpException(error,409);
        }
    }

    @Put(':id')
    async updateUser(@Param('id') id:number,@Body() body:UserDto){
        try {
            const user:User=body;
            const result:User=await this.userService.updateUser(id,user);
            if(!result)throw new HttpException('Error al actualizar',409);
            return {message:'Se actualizó el usuario', result};
        } catch (error) {
            throw new HttpException(error,409);
        }
    }

    @Delete(':id')
    async deleteUser(@Param('id') id:number){
        try {
            const result:User=await this.userService.deleteUser(id);
            if(!result)throw new HttpException('Error al eliminar',409);
            return {message:'Se eliminó el usuario', result};
        } catch (error) {
            throw new HttpException(error,409);
        }
    }

    @Post('asignation')
    async asignationUser(@Body() body:AsignationDto){
        try {
            const result=await this.userService.asignationUser(body);
            if(!result)throw new HttpException('Error al devolver el usuario',409);
            return {message:'Se asignó un curso al usuario', course:result};
        } catch (error) {
            throw new HttpException(error,409);
        }
    }

    @Get(':id')
    async myCourse(@Param('id') id:number){
        try {
            const result=await this.userService.myCourse(id);
            if(!result)throw new HttpException('Error al devolver el usuario',409);
            return {message:'Estudiantes asignados a la id '+id, students:result};
        } catch (error) {
            throw new HttpException(error,409);
        }
    }


}
