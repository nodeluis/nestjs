import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as pdfParse from 'pdf-parse';
import { Repository } from 'typeorm';
import { InsertStudentDto } from '../dto/insertStudent.dto';
import { UnitedsDto } from '../dto/post.dto';
import { UpdateStudentsDto } from '../dto/updateCourse.dto';
import { CourseEntity } from '../entities/course.entity';
import { StudentEntity } from '../entities/student.entity';
import { UnitedEntity } from '../entities/united.entity';
import { Course } from '../interfaces/courses.interface';
import { Student } from '../interfaces/student.interface';
import { United } from '../interfaces/united.interface';
import * as puppeteer from 'puppeteer';
import {toDataURL} from 'qrcode'
import { isEmpty } from 'src/utils/util';
import { ResponsePdfUnited } from '../interfaces/responsePdf.interface';
import * as AdmZip from 'adm-zip';

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
        identification,
        dateOfBirth,
        department,
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
        grade,
        pdfNumber,
        year,
        level
    }:InsertStudentDto):Promise<Student>{

        let findUnited:UnitedEntity=await this.unitedRepository.findOne({where:{schoolCode}});
        if(!findUnited){
            findUnited=await this.createUnited(schoolCode,schoolName,year);
        }
        
        let findCourse:CourseEntity=await this.courseRepository.findOne({where:{grade,group,united:findUnited}});
        if(!findCourse){
            findCourse=await this.createCourse(turn,grade,group,level,findUnited);
        }

        const studentEnt:StudentEntity=new StudentEntity();
        studentEnt.country=country;
        studentEnt.course=findCourse;
        studentEnt.identification=identification;
        studentEnt.dateOfBirth=dateOfBirth;
        studentEnt.department=department;
        studentEnt.gender=gender;
        studentEnt.locality=locality;
        studentEnt.name=name;
        studentEnt.province=province;
        studentEnt.registration=registration;
        studentEnt.pdfNumber=pdfNumber;
        studentEnt.rude=rude;

        await this.studentRepository.save(studentEnt);

        return studentEnt;
    }

    private async createUnited(schoolCode:string,schoolName:string,year:number):Promise<UnitedEntity>{

        const unitedEnt: UnitedEntity=new UnitedEntity();
        unitedEnt.schoolCode=schoolCode;
        unitedEnt.schoolName=schoolName;
        unitedEnt.year=year;
        unitedEnt.course=[];

        await this.unitedRepository.save(unitedEnt);

        return unitedEnt;
    }

    private async createCourse(turn:string,grade:string,group:string,level:string,united:UnitedEntity):Promise<CourseEntity>{

        const courseEnt=new CourseEntity();

        courseEnt.turn=turn;
        courseEnt.grade=grade;
        courseEnt.group=group;
        courseEnt.united=united;
        courseEnt.level=level;
        courseEnt.student=[];
        
        await this.courseRepository.save(courseEnt);

        return courseEnt;
    }

    public async findCoursesUnity(id:number):Promise<Course[]>{

        const unitedEnt=await this.unitedRepository.findOne(id);
        if(!unitedEnt)throw new HttpException('No se encontró la Unidad educativa',409);
        
        
        const coursesEnt:Course[]=await this.courseRepository.find({where:{united:unitedEnt}});

        return coursesEnt;
    }

    public async findCourseStudents(id:number):Promise<Student[]>{
        
        const courseEnt=await this.courseRepository.findOne(id);
        if(!courseEnt)throw new HttpException('No se encontró el curso',409);

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

    public async postAllData(data: UnitedsDto[]):Promise<boolean>{
        for (let z = 0; z < data.length; z++) {
            const {courses,schoolCode,year,schoolName} = data[z];
            const unitEnt=await this.createUnited(schoolCode,schoolName,year);
            for (let y = 0; y < courses.length; y++) {
                const {turn,grade,group,level,students} = courses[y];
                const courseEnt=await this.createCourse(turn,grade,group,level,unitEnt);
                for (let x = 0; x < students.length; x++) {
                    const {country,dateOfBirth,department,gender,identification,locality,name,province,registration,rude,pdfNumber} = students[x];
                    const studentEnt:StudentEntity=new StudentEntity();
                    studentEnt.country=country;
                    studentEnt.course=courseEnt;
                    studentEnt.identification=identification;
                    studentEnt.dateOfBirth=dateOfBirth;
                    studentEnt.department=department;
                    studentEnt.gender=gender;
                    studentEnt.locality=locality;
                    studentEnt.name=name;
                    studentEnt.province=province;
                    studentEnt.registration=registration;
                    studentEnt.pdfNumber=pdfNumber;
                    studentEnt.rude=rude;

                    await this.studentRepository.save(studentEnt);
                }
            }
        }

        return true;
    }

    public async getPdfUnitedQr(id:number):Promise<Buffer>{
        if(isEmpty(id))throw new HttpException('No se envió la data',400);

        const unitedEnt: UnitedEntity=await this.unitedRepository.findOne({
            where:{id},
            relations: ['course']
        });
        if(!unitedEnt)throw new HttpException('No existe un curso con ese id',409);

        const resp: ResponsePdfUnited[]=[];

        const zip: AdmZip= new AdmZip();

        for (let z = 0; z < unitedEnt.course.length; z++) {
            const element: CourseEntity= unitedEnt.course[z];
            const {namePdf,pdf}=await this.getPdfACourse(element.id);
            zip.addFile(namePdf,Buffer.alloc(pdf.length, pdf),'comentario gamp');
        }

        const zipBuffer: Buffer = zip.toBuffer();
        
        return zipBuffer;
    }

    public async getPdfACourse(id:number):Promise<{pdf:Buffer,namePdf:string}>{
        //<img id='barcode' src="https://api.qrserver.com/v1/create-qr-code/?data=hola&amp;size=100x100" alt="" title="HELLO" width="50" height="50" />
        const browser=await puppeteer.launch({args: ['--no-sandbox','--disable-setuid-sandbox']});
        const page=await browser.newPage();
        page.setDefaultNavigationTimeout(0);
        const courseEnt: CourseEntity=await this.courseRepository.findOne({
            where:{id},
            relations: ['united','student']
        });

        let construir='<table id="puppeteer"><thead>'
                +'<tr>'
                +'<th>Nro</th>'
                +'<th>QR</th>'
                +'<th>Rude</th>'
                +'<th>Carnet</th>'
                +'<th>Nombre</th>'
                +'<th>Matricula</th>'
                +'<th>QR</th>'
                +'<th style="padding-right: 100px">Firma</th>'
                +'</tr>'
                +'</thead>'
                +'<tbody>';
        for (let z = 0; z < courseEnt.student.length; z++) {
            const element = courseEnt.student[z];
            if(z%2==0){
                construir+='<tr>'
                    +'<td>'+(z+1)+'</td>'
                    +'<td style="padding: 0px; "><img src="'+(await this.createQR(element.rude))+'" width="50" height="50" /></td>'
                    +'<td>'+element.rude+'</td>'
                    +'<td>'+element.identification+'</td>'
                    +'<td>'+element.name+'</td>'
                    +'<td>'+element.registration+'</td>'
                    +'<td></td>'
                    +'<td></td>'
                    +'</tr>';
            }else{
                construir+='<tr>'
                    +'<td>'+(z+1)+'</td>'
                    +'<td></td>'
                    +'<td>'+element.rude+'</td>'
                    +'<td>'+element.identification+'</td>'
                    +'<td>'+element.name+'</td>'
                    +'<td>'+element.registration+'</td>'
                    +'<td style="padding: 0px; "><img src="'+(await this.createQR(element.rude))+'" width="50" height="50" /></td>'
                    +'<td></td>'
                    +'</tr>';
            }
        }
        construir+='</tbody>'
                /*+'<tfoot>'
                +'<tr>'
                +'<th>Nro</th>'
                +'<th>QR</th>'
                +'<th>Rude</th>'
                +'<th>Carnet</th>'
                +'<th>Nombre</th>'
                +'<th>Matricula</th>'
                +'<th>QR</th>'
                +'<th>Firma</th>'
                +'</tr>'
                +'</tfoot>'*/
                +'</table>';


        let data='<!DOCTYPE html><html lang="en" dir="ltr"><head><meta charset="utf-8"><title></title></head><body>'
        +'<div>'
        +'<h1 style="text-align: center;color:#1953AB">UNIDAD DE SISTEMAS GAMP.</h1>'
        +'<p>Nombre del colegio : '+courseEnt.united.schoolName+'</p>'
        +'<p>Código del colegio : '+courseEnt.united.schoolCode+'</p>'
        +'<p>Nivel : '+courseEnt.level+'</p>'
        +'<p>'+courseEnt.group+'</p>'
        +'<p>'+courseEnt.grade+'</p>'
        +'<p>Turno : '+courseEnt.turn+'</p>'
        +'</div>'
        +construir
        +'</body></html>';
        await page.setContent(data);
        await page.evaluate(async () => {
        const style = document.createElement('style');
        style.type = 'text/css';
        const content = `
        #puppeteer {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
            border-collapse: collapse;
            width: 100%;
        }
        #puppeteer td, #customers th {
            border: 1px solid #ddd;
            padding: 8px;
        }
        #puppeteer tr:nth-child(even){background-color: #f2f2f2;}
        #puppeteer th {
            padding-top: 12px;
            padding-bottom: 12px;
            text-align: left;
            border: 2px solid black;
        }`;
        style.appendChild(document.createTextNode(content));
        const promise = new Promise((resolve, reject) => {
            style.onload = resolve;
            style.onerror = reject;
        });
        document.head.appendChild(style);
        await promise;
        });
        const pdf=await page.pdf({
            landscape:true,
            printBackground: true,
            
        });

        await browser.close();

        const namePdf: string=courseEnt.united.schoolName+'-'+courseEnt.group+'-'+courseEnt.grade+'-'+courseEnt.turn;
        
        return {pdf,namePdf};

    }

    public async getPdfACourseWithOutQr(id:number):Promise<{pdf:Buffer,namePdf:string}>{
        //<img id='barcode' src="https://api.qrserver.com/v1/create-qr-code/?data=hola&amp;size=100x100" alt="" title="HELLO" width="50" height="50" />
        const browser=await puppeteer.launch({args: ['--no-sandbox','--disable-setuid-sandbox']});
        const page=await browser.newPage();
        page.setDefaultNavigationTimeout(0);
        const courseEnt: CourseEntity=await this.courseRepository.findOne({
            where:{id},
            relations: ['united','student']
        });

        let construir='<table id="puppeteer"><thead>'
                +'<tr>'
                +'<th>Nro</th>'
                +'<th>Rude</th>'
                +'<th>Carnet</th>'
                +'<th>Nombre</th>'
                +'<th>Matricula</th>'
                +'<th style="padding-right: 100px">Firma</th>'
                +'</tr>'
                +'</thead>'
                +'<tbody>';
        for (let z = 0; z < courseEnt.student.length; z++) {
            const element = courseEnt.student[z];
            construir+='<tr>'
                +'<td>'+(z+1)+'</td>'
                +'<td>'+element.rude+'</td>'
                +'<td>'+element.identification+'</td>'
                +'<td>'+element.name+'</td>'
                +'<td>'+element.registration+'</td>'
                +'<td></td>'
                +'</tr>';
        }
        construir+='</tbody>'
                /*+'<tfoot>'
                +'<tr>'
                +'<th>Nro</th>'
                +'<th>Rude</th>'
                +'<th>Carnet</th>'
                +'<th>Nombre</th>'
                +'<th>Matricula</th>'
                +'<th>Firma</th>'
                +'</tr>'
                +'</tfoot>'*/
                +'</table>';


        let data='<!DOCTYPE html><html lang="en" dir="ltr"><head><meta charset="utf-8"><title></title></head><body>'
        +'<div>'
        +'<h1 style="text-align: center;color:#1953AB">UNIDAD DE SISTEMAS GAMP.</h1>'
        +'<p>Nombre del colegio : '+courseEnt.united.schoolName+'</p>'
        +'<p>Código del colegio : '+courseEnt.united.schoolCode+'</p>'
        +'<p>Nivel : '+courseEnt.level+'</p>'
        +'<p>'+courseEnt.group+'</p>'
        +'<p>'+courseEnt.grade+'</p>'
        +'<p>Turno : '+courseEnt.turn+'</p>'
        +'</div>'
        +construir
        +'</body></html>';
        await page.setContent(data);
        await page.evaluate(async () => {
        const style = document.createElement('style');
        style.type = 'text/css';
        const content = `
        #puppeteer {
            font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
            border-collapse: collapse;
            width: 100%;
        }
        #puppeteer td, #customers th {
            border: 1px solid #ddd;
            padding: 8px;
        }
        #puppeteer tr:nth-child(even){background-color: #f2f2f2;}
        #puppeteer th {
            padding-top: 12px;
            padding-bottom: 12px;
            text-align: left;
            border: 2px solid black;
        }`;
        style.appendChild(document.createTextNode(content));
        const promise = new Promise((resolve, reject) => {
            style.onload = resolve;
            style.onerror = reject;
        });
        document.head.appendChild(style);
        await promise;
        });
        const pdf=await page.pdf({landscape:true,printBackground: true});

        await browser.close();

        const namePdf: string=courseEnt.united.schoolName+'-'+courseEnt.group+'-'+courseEnt.grade+'-'+courseEnt.turn;
        
        return {pdf,namePdf};
    }

    private async createQR(data:string):Promise<string>{
        const url=await toDataURL(data);    
        return url;
    }

    public async createDatabase():Promise<boolean>{
        const obj: UnitedsDto[]= JSON.parse(fs.readFileSync(__dirname+'/../../../dataStudent/colegios.json', 'utf8'));
        for (let z = 0; z < obj.length; z++) {
            const {courses,schoolCode,year,schoolName} = obj[z];
            const unitEnt=await this.createUnited(schoolCode,schoolName,year);
            for (let y = 0; y < courses.length; y++) {
                const {turn,grade,group,level,students} = courses[y];
                const courseEnt=await this.createCourse(turn,grade,group,level,unitEnt);
                for (let x = 0; x < students.length; x++) {
                    const {country,dateOfBirth,department,gender,identification,locality,name,province,registration,rude,pdfNumber} = students[x];
                    const studentEnt:StudentEntity=new StudentEntity();
                    studentEnt.country=country;
                    studentEnt.course=courseEnt;
                    studentEnt.identification=identification;
                    studentEnt.dateOfBirth=dateOfBirth;
                    studentEnt.department=department;
                    studentEnt.gender=gender;
                    studentEnt.locality=locality;
                    studentEnt.name=name;
                    studentEnt.province=province;
                    studentEnt.registration=registration;
                    studentEnt.pdfNumber=pdfNumber;
                    studentEnt.rude=rude;

                    await this.studentRepository.save(studentEnt);
                }
            }
        }
        return true;
    }

}
