import { HttpException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { isEmpty } from 'src/utils/util';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { DataStoredInToken, TokenData, User } from '../interfaces/user.interface';
import { CourseEntity } from 'src/courses/entities/course.entity';
import { AsignationDto } from '../dto/asignation.dto';
import { Course } from 'src/courses/interfaces/courses.interface';
import { Student } from 'src/courses/interfaces/student.interface';
import { StudentEntity } from 'src/courses/entities/student.entity';
import { CoursesResponse } from '../interfaces/responses.interface';
import { UserDto } from '../dto/user.dto';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
        @InjectRepository(CourseEntity) private courseRepository: Repository<CourseEntity>,
        @InjectRepository(StudentEntity) private studentRepository: Repository<StudentEntity>,
      ) {}

    public async findAll():Promise<User[]>{
        const users:User[]=await this.userRepository.find();
        return users;
    }

    public async findOne(id:number):Promise<User>{
        if (isEmpty(id)) throw new HttpException('No se envió el id',409);
        
        const findUser=await this.userRepository.findOne(id);
        
        return findUser;

    }

    public async createUser(userData:User):Promise<User>{
        if (isEmpty(userData)) throw new HttpException('No se envió el usuario',409);
        
        const findUser=await this.userRepository.findOne({ where: { user:userData.user } });
        if (findUser) throw new HttpException( `Ya existe ${userData.user} en la base de datos`,409);
        const hashedPassword =await bcrypt.hash(userData.password, 10);
        const createUserData: User = await this.userRepository.save({ ...userData,course:[],send:[],password:hashedPassword,lastSyncDate:new Date()});
        return createUserData;

    }

    public async updateUser(id:number, userData:User):Promise<User>{
        if (isEmpty(userData)||isEmpty(id)) throw new HttpException('No se envió la data',409);
        
        const findUser=await this.userRepository.findOne(id);
        if (!findUser) throw new HttpException( `No existe ${userData.user} en la base de datos`,409);

        const hashedPassword =await bcrypt.hash(userData.password, 10);
        const updateUserData:UpdateResult= await this.userRepository.update(id,{ ...userData,password:hashedPassword});

        return findUser;

    }

    public async deleteUser(id:number):Promise<User>{
        if (isEmpty(id)) throw new HttpException('No se envió la data',409);
        
        const findUser: User = await this.userRepository.findOne(id);
        if (!findUser) throw new HttpException( `No existe el id ${id} en la base de datos`,409);

        const deleteUserData:DeleteResult= await this.userRepository.delete(id);

        return findUser;

    }

    public async auth({user,password}:UserDto):Promise<{ cookie: string; findUser: User , tokenData: TokenData }>{
        if (isEmpty(user)||isEmpty(password)) throw new HttpException('No se envió la data',409);
        
        const findUser: User = await this.userRepository.findOne({ where: { user} });
        
        if (!findUser) throw new HttpException('Error credenciales incorrectas',409);

        const isPasswordMatching: boolean = await bcrypt.compare(password, findUser.password);  
        if (!isPasswordMatching) throw new HttpException('Error credenciales incorrectas',409);        

        const tokenData = this.createToken(findUser);
        const cookie = this.createCookie(tokenData);
        
        return { cookie, findUser, tokenData };

    }

    public createToken(user: User): TokenData {
        const dataStoredInToken: DataStoredInToken = { id: user.id };
        const secretKey: string = 'secretKey';
        const expiresIn: number = 60 * 60 * 24 * 1000;

        return { expiresIn, token: jwt.sign(dataStoredInToken, secretKey, { expiresIn }) };
    }

    public createCookie(tokenData: TokenData): string {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
    }

    public async asignationUser({courseId, userId} : AsignationDto): Promise<Course> {

        if(isEmpty(courseId)||isEmpty(userId))throw new HttpException( `No se envió la data`,400);

        const userEnt: UserEntity=await this.userRepository.findOne({where:{id:userId}});
        if(!userEnt)throw new HttpException( `No se encontró el usuario`,409);

        const courseEnt: CourseEntity =await this.courseRepository.findOne({where:{id:courseId}});
        if(!courseEnt)throw new HttpException( `No se encontró el curso`,409);
        if(courseEnt.asignated)throw new HttpException( `Ya se asinó este curso, Si desea corregir su asignacion pongase en contacto con el area de sistemas`,400);
        courseEnt.user=userEnt;
        courseEnt.asignated=true;

        const resultCourse=await this.courseRepository.update(courseEnt.id,courseEnt);
        if(!resultCourse)throw new HttpException( `Error al actualizar el curso`,409);

        const resultuser=await this.userRepository.update(userEnt.id,userEnt);
        if(!resultuser)throw new HttpException( `Error al actualizar el usuario`,409);

        return courseEnt;
    }

    public async myCourse(id:number): Promise<CoursesResponse[]> {

        if(isEmpty(id))throw new HttpException( `No se envió la data`,400);

        const findUser: UserEntity=await this.userRepository.findOne(id);        
        if(!findUser)throw new HttpException( `Error no se encontró el usuario`,409);

        const courseEnt: CourseEntity[]=await this.courseRepository.find({where:{user:findUser}});
        if(!courseEnt)throw new HttpException( `Error no se encontro los cursos`,409);

        const cour:CoursesResponse[]=[];
        for (let z = 0; z < courseEnt.length; z++) {
            const element: CourseEntity = courseEnt[z];
            const studentEnt:Student[] = await this.studentRepository.find({where:{course:element}});
            
            cour.push({
                group:element.group,
                turn:element.turn,
                grade:element.grade,
                students:studentEnt
            });
            
        }

        return cour;
    }

}
