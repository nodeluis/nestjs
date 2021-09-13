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
import { Course } from '../interfaces/courses.interface';
import { Student } from '../interfaces/student.interface';
import { United } from '../interfaces/united.interface';
import * as puppeteer from 'puppeteer';
import {toDataURL} from 'qrcode'
import { isEmpty } from 'src/utils/util';
import { ResponsePdfUnited } from '../interfaces/responsePdf.interface';
import * as AdmZip from 'adm-zip';
import { UnitedEntity } from '../entities/united.entity';
import * as readXlsxFile from 'read-excel-file/node';

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
        level,
        
    }:InsertStudentDto):Promise<Student>{

        let findUnited:UnitedEntity=await this.unitedRepository.findOne({where:{schoolCode}});
        if(!findUnited){
            findUnited=await this.createUnited(schoolCode,schoolName,year,'U');
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

    private async createUnited(schoolCode:string,schoolName:string,year:number,sType:string):Promise<UnitedEntity>{

        const unitedEnt: UnitedEntity=new UnitedEntity();
        unitedEnt.schoolCode=schoolCode;
        unitedEnt.schoolName=schoolName;
        unitedEnt.year=year;
        unitedEnt.schoolType=sType;
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
            const unitEnt=await this.createUnited(schoolCode,schoolName,year,'U');
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
                +'<th>QR</th>'
                +'<th>Carnet</th>'
                +'<th>Nombre</th>'
                +'<th>Matricula</th>'
                +'<th style="padding-right: 320px">Tutor</th>'
                +'<th style="padding-right: 70px">CI tutor</th>'
                +'<th style="padding-right: 50px">Firma tutor</th>'
                +'</tr>'
                +'</thead>'
                +'<tbody>';
        for (let z = 0; z < courseEnt.student.length; z++) {
            const element = courseEnt.student[z];
            if(element.registration=='EFECTIVO'){
                if(z%2==0){
                    construir+='<tr style="padding: 0px; margin:0px ">'
                    +'<td>'+(z+1)+'</td>'
                    +'<td style="padding: 0px; margin:0px "><img src="'+(await this.createQR(element.rude))+'" width="30" height="30" /></td>'
                    +'<td>'+element.rude+'</td>'
                    +'<td></td>'
                    +'<td>'+element.identification+'</td>'
                    +'<td>'+element.name+'</td>'
                    +'<td>'+element.registration+'</td>'
                    +'<td></td>'
                    +'<td></td>'
                    +'<td></td>'
                    +'</tr>';
                }else{
                    construir+='<tr style="padding: 0px; margin:0px ">'
                    +'<td>'+(z+1)+'</td>'
                    +'<td></td>'
                    +'<td>'+element.rude+'</td>'
                    +'<td style="padding: 0px; margin:0px "><img src="'+(await this.createQR(element.rude))+'" width="30" height="30" /></td>'
                    +'<td>'+element.identification+'</td>'
                    +'<td>'+element.name+'</td>'
                    +'<td>'+element.registration+'</td>'
                    +'<td></td>'
                    +'<td></td>'
                    +'<td></td>'
                    +'</tr>';
                }
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
        +'<h2 style="text-align: center;color:#1953AB; margin-bottom: 0px;">'+courseEnt.united.schoolCode+' : '+courseEnt.united.schoolName+'</h2>'
        +'<table id="puppeteer2"><thead>'
        +'<tr>'
        +'<th>Nivel : '+courseEnt.level+'</th>'
        +'<th>Turno : '+courseEnt.turn+'</th>'
        +'<th>'+courseEnt.grade+'</th>'
        +'<th>'+courseEnt.group+'</th>'
        +'</tr>'
        +'</thead>'
        +'<tbody>'
        +'</tbody>'
        +'<br>'
        +construir
        +'</body></html>';
        await page.setContent(data);
        await page.evaluate(async () => {
        const style = document.createElement('style');
        style.type = 'text/css';
        const content = `
        #puppeteer {
            font-family:"Times New Roman", Times, serif;
            font-size:75%;
            border-collapse: collapse;
            width: 100%;
        }
        #puppeteer td {
            border: 1px solid #ddd;
        }
        #puppeteer th {
            padding-top: 8px;
            padding-bottom: 8px;
            text-align: left;
            border: 1px solid black;
        }

        #puppeteer2 {
            font-family:"Times New Roman", Times, serif;
            border-collapse: collapse;
            width: 100%;
        }
        #puppeteer2 td, #customers th {
            border: 1px solid #ddd;
        }
        
        #puppeteer2 th {
            padding-top: 12px;
            padding-bottom: 12px;
            text-align: left;
            border: 0px solid black;
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
            width:'215mm',
            height:'330mm'
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
                +'<th style="padding-right: 350px">Tutor</th>'
                +'<th style="padding-right: 50px">CI tutor</th>'
                +'<th>Firma tutor</th>'
                +'</tr>'
                +'</thead>'
                +'<tbody>';
        for (let z = 0; z < courseEnt.student.length; z++) {
            const element = courseEnt.student[z];
            construir+='<tr style="padding: 0px; margin:0px ">'
                +'<td>'+(z+1)+'</td>'
                +'<td>'+element.rude+'</td>'
                +'<td>'+element.identification+'</td>'
                +'<td>'+element.name+'</td>'
                +'<td>'+element.registration+'</td>'
                +'<td></td>'
                +'<td></td>'
                +'<td></td>'
                +'</tr>';
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
        +'<h2 style="text-align: center;color:#1953AB; margin-bottom: 0px;">'+courseEnt.united.schoolCode+' : '+courseEnt.united.schoolName+'</h2>'
        +'<table id="puppeteer2"><thead>'
        +'<tr>'
        +'<th>Nivel : '+courseEnt.level+'</th>'
        +'<th>Turno : '+courseEnt.turn+'</th>'
        +'<th>'+courseEnt.grade+'</th>'
        +'<th>'+courseEnt.group+'</th>'
        +'</tr>'
        +'</thead>'
        +'<tbody>'
        +'</tbody>'
        +'<br>'
        +construir
        +'</body></html>';
        await page.setContent(data);
        await page.evaluate(async () => {
        const style = document.createElement('style');
        style.type = 'text/css';
        const content = `
        #puppeteer {
            font-family:"Times New Roman", Times, serif;
            border-collapse: collapse;
            font-size:75%;
            width: 100%;
        }
        #puppeteer td, #customers th {
            border: 1px solid #ddd;
        }
        #puppeteer td{
            padding: -1; 
            margin: 0;
            border: 0;
        }
        #puppeteer tr:nth-child(even){background-color: #f2f2f2;}
        #puppeteer th {
            padding-top: 8px;
            padding-bottom: 8px;
            text-align: left;
            border: 2px solid black;
        }

        #puppeteer2 {
            font-family:"Times New Roman", Times, serif;
            border-collapse: collapse;
            width: 100%;
        }
        #puppeteer2 td, #customers th {
            border: 1px solid #ddd;
        }
        #puppeteer2 tr:nth-child(even){background-color: #f2f2f2;}
        #puppeteer2 th {
            padding-top: 12px;
            padding-bottom: 12px;
            text-align: left;
            border: 0px solid black;
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
            width:'215mm',
            height:'330mm'
        });


        await browser.close();

        const namePdf: string=courseEnt.united.schoolName+'-'+courseEnt.group+'-'+courseEnt.grade+'-'+courseEnt.turn;
        
        return {pdf,namePdf};
    }

    private async createQR(data:string):Promise<string>{
        const url=await toDataURL(data,{margin:0});    
        return url;
    }

    public async createDatabase():Promise<boolean>{
        const obj: UnitedsDto[]= JSON.parse(fs.readFileSync(__dirname+'/../../../dataStudent/colegios.json', 'utf8'));
        for (let z = 0; z < obj.length; z++) {
            const {courses,schoolCode,year,schoolName} = obj[z];
            const unitEnt: UnitedEntity=await this.createUnited(schoolCode,schoolName,year,'U');
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
        const obj2: UnitedsDto[]= JSON.parse(fs.readFileSync(__dirname+'/../../../dataStudent/colegiosRurales.json', 'utf8'));
        for (let z = 0; z < obj2.length; z++) {
            const {courses,schoolCode,year,schoolName} = obj2[z];
            const unitEnt=await this.createUnited(schoolCode,schoolName,year,'R');
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

    public async getSchoolsAndNumberStudent():Promise<string>{
        const unitedEnt=await this.unitedRepository.find({
            relations:['course','course.student']
        });
        
        let names: string='';
        for (let z = 0; z < 1; z++) {
            const element = unitedEnt[z];
            const coursesEnt=await this.courseRepository.find()
            names+=element.schoolName+'\n';
        }
        return names;
    }

    public async readxls():Promise<any>{
        let courses=[];
        let school=[];
        let student=[];
        let courseObj={};
        let schoolObj={};
        let escsin=false;
        let rows=await readXlsxFile(__dirname + '/../../../dataStudent/discapacidad2.xlsx');
        for (let z = 0; z < rows.length; z++) {
            const element = rows[z];
            if(element[0]=='escuelasin'){
                school.push(schoolObj);
                schoolObj={
                    schoolCode: "",
                    schoolName: element[1],
                    year: "2021",
                    courses: courses
                }
                courses=[];
                student=[];
                escsin=true;
            }else if(element[0]=='escuela'){
                school.push(schoolObj);
                schoolObj={
                    schoolCode: "",
                    schoolName: element[1],
                    year: "2021",
                    courses: courses
                }
                student=[];
                courses=[];
            }else if(await this.isNumber(element[0])){
                courses.push(courseObj);
                
                courseObj={
                    level: element[2],
                    turn: "",
                    grade: element[0],
                    group: element[1],
                    students:student
                }

                student=[];
            }else{
                if(escsin){
                    student.push({
                        pdfNumber: "0",
                        rude: '',
                        identification: '',
                        name: element[0],
                        gender: "",
                        dateOfBirth: '',
                        country: "BOLIVIA",
                        department: "Potosi",
                        province: "",
                        locality: "",
                        registration: "EFECTIVO"
                    });
                }else{
                    student.push({
                        pdfNumber: "0",
                        rude: element[1]?element[1]:'',
                        identification: element[3]?element[3]:'',
                        name: element[0],
                        gender: "",
                        dateOfBirth: element[2]?element[2]:'',
                        country: "BOLIVIA",
                        department: "Potosi",
                        province: "",
                        locality: "",
                        registration: "EFECTIVO"
                    });
                }
                
            }
        }
        return school;
    }

    private async isNumber(x:string):Promise<boolean>{
        const n:number=parseInt(x); 
        if(isNaN(n))return false;
        return true;
    }

}
