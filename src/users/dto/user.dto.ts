import {IsNotEmpty,isString} from 'class-validator';

export class UserDto{

    @IsNotEmpty()
    user:string;

    @IsNotEmpty()
    password:string;
    
}