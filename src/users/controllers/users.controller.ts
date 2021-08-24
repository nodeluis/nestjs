import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {


    constructor(
        private userService:UsersService
    ){}

    //poner la ruta entre el parentesis para diferenciar
    @Get()
    findAll(){
        return this.userService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id:string){
        
        return {id};
    }

    @Post()
    createUser(@Body() body:any){
        return body;
    }

    @Put(':id')
    updateUser(@Param('id') id:string,@Body() body:any){
        return body;
    }

}
