import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as pdfParse from 'pdf-parse';
import { Repository } from 'typeorm';
import { InsertStudentDto } from '../dto/insertStudent.dto';
import { UpdateStudentsDto } from '../dto/updateCourse.dto';
import { CourseEntity } from '../entities/course.entity';
import { StudentEntity } from '../entities/student.entity';
import { UnitedEntity } from '../entities/united.entity';
import { Course } from '../interfaces/courses.interface';
import { Student } from '../interfaces/student.interface';
import { United } from '../interfaces/united.interface';


@Injectable()
export class CoursesService {

    constructor(
        @InjectRepository(UnitedEntity) private unitedRepository: Repository<UnitedEntity>,
        @InjectRepository(CourseEntity) private courseRepository: Repository<CourseEntity>,
        @InjectRepository(StudentEntity) private studentRepository: Repository<StudentEntity>,
    ) {}

    public async pdfReader():Promise<boolean>{

        const data=await pdfParse(fs.readFileSync(__dirname+'/../../pdf/prueba/prueba.pdf'));
        
        return true;
    }

    public async findAllCourses():Promise<Course[]>{

        const findCourses=await this.courseRepository.find();
        
        return findCourses;
    }

    public async findAllStudents():Promise<Student[]>{

        const findStudents=await this.studentRepository.find();
        
        return findStudents;
    }

    public async findAllUniteds():Promise<United[]>{

        const findUniteds=await this.unitedRepository.find();
        
        return findUniteds;
    }

    public async insertStudent({
        country,
        credential,
        dateOfBirth,
        departament,
        gender,
        group,
        locality,
        name,
        province,
        registration,
        rude,
        schoolCode,
        schoolName,
        turn,
        yearOfSchoollarity
    }:InsertStudentDto):Promise<Student>{

        let findUnited:UnitedEntity=await this.unitedRepository.findOne({where:{schoolCode}});
        if(!findUnited){
            findUnited=await this.createUnited(schoolCode,schoolName);
        }
        
        let findCourse:CourseEntity=await this.courseRepository.findOne({where:{yearOfSchoollarity,group,united:findUnited}});
        if(!findCourse){
            findCourse=await this.createCourse(turn,yearOfSchoollarity,group,findUnited);
        }

        const studentEnt:StudentEntity=new StudentEntity();
        studentEnt.country=country;
        studentEnt.course=findCourse;
        studentEnt.credential=credential;
        studentEnt.dateOfBirth=dateOfBirth;
        studentEnt.departament=departament;
        studentEnt.gender=gender;
        studentEnt.locality=locality;
        studentEnt.name=name;
        studentEnt.province=province;
        studentEnt.registration=registration;
        studentEnt.rude=rude;

        await this.studentRepository.save(studentEnt);

        return studentEnt;
    }

    private async createUnited(schoolCode:string,schoolName:string,):Promise<UnitedEntity>{

        const unitedEnt: UnitedEntity=new UnitedEntity();
        unitedEnt.schoolCode=schoolCode;
        unitedEnt.schoolName=schoolName;
        unitedEnt.course=[];

        await this.unitedRepository.save(unitedEnt);

        return unitedEnt;
    }

    private async createCourse(turn:string,yearOfSchoollarity:number,group:string,united:UnitedEntity):Promise<CourseEntity>{

        const courseEnt=new CourseEntity();

        courseEnt.turn=turn;
        courseEnt.yearOfSchoollarity=yearOfSchoollarity;
        courseEnt.group=group;
        courseEnt.united=united;
        courseEnt.student=[];
        
        await this.courseRepository.save(courseEnt);

        return courseEnt;
    }

    public async findCoursesUnity(id:number):Promise<Course[]>{

        const unitedEnt=await this.unitedRepository.findOne(id);
        
        const coursesEnt:Course[]=await this.courseRepository.find({where:{united:unitedEnt}});

        return coursesEnt;
    }

    public async findCourseStudents(id:number):Promise<Student[]>{
        
        const courseEnt=await this.courseRepository.findOne(id);
        
        const studentEnt:Student[]=await this.studentRepository.find({where:{course:courseEnt}});

        return studentEnt;
    }

    public async updateCourse({students}:UpdateStudentsDto):Promise<Student[]>{
        
        const studentsEnt:Student[]=[];
        for (let x = 0; x < students.length; x++) {
            const element = students[x];
            const studentEnt=await this.studentRepository.findOne(element.id);
            studentEnt.paid=element.paid;
            studentsEnt.push(studentEnt);
            await this.studentRepository.update(element.id,studentEnt);
        }

        return studentsEnt;
    }

}
