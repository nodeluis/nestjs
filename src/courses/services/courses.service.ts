import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as pdfParse from 'pdf-parse';
import { Repository, UpdateResult } from 'typeorm';
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
import { CourseProccessEntity } from '../entities/courseProccess.entity';
import { PaidStudentsDto, SyncStudentsDto } from '../dto/sync.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { SendingDataDto } from '../dto/sendingData.dto';
import { SendingsEntity } from '../entities/sendings.entity';

@Injectable()
export class CoursesService {

    constructor(
        @InjectRepository(UnitedEntity) private unitedRepository: Repository<UnitedEntity>,
        @InjectRepository(CourseEntity) private courseRepository: Repository<CourseEntity>,
        @InjectRepository(StudentEntity) private studentRepository: Repository<StudentEntity>,
        @InjectRepository(CourseProccessEntity) private courseProccessRepository: Repository<CourseProccessEntity>,
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
        @InjectRepository(SendingsEntity) private sendingsRepository: Repository<SendingsEntity>,
    ) {}

    public async pdfReader():Promise<boolean>{

        const data=await pdfParse(fs.readFileSync(__dirname+'/../../pdf/prueba/prueba.pdf'));
        
        return true;
    }

    public async findAllCourses():Promise<number>{

        const findCourses=await this.courseRepository.find();
        
        return findCourses.length;

        /*
        let count=0;

        const unitedEnt=await this.unitedRepository.find({
            where:{schoolType:'E'},
            relations:['course']
        });
        for (let z = 0; z < unitedEnt.length; z++) {
            const element = unitedEnt[z];
            count+=element.course.length;
        }
        
        return count;
        */
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
        if(!unitedEnt)throw new HttpException('No se encontr?? la Unidad educativa',409);
        
        
        const coursesEnt:Course[]=await this.courseRepository.find({where:{united:unitedEnt}});

        return coursesEnt;
    }

    public async findCourseStudents(id:number):Promise<Student[]>{
        
        const courseEnt=await this.courseRepository.findOne(id);
        if(!courseEnt)throw new HttpException('No se encontr?? el curso',409);

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


    //no pagados todas las unidades
    //----------------------------------------------------------------------------------------------------------------
    public async getallRarNoPaids():Promise<Buffer>{
        
        const unitedEnt: UnitedEntity[]=await this.unitedRepository.find();
        if(!unitedEnt)throw new HttpException('error',409);

        const zip: AdmZip= new AdmZip();
     
        for (let z = 0; z < unitedEnt.length; z++) {
            const element= unitedEnt[z];
            const {pdf,nameUnidet}=await this.getPdfUnitedQrNoPaids(element.id);
            zip.addFile(nameUnidet+'.pdf',Buffer.alloc(pdf.length, pdf),'comentario gamp');
        }

        const zipBuffer: Buffer = zip.toBuffer();

        return zipBuffer;
    }

    //no pagados de una unidad
    private async getPdfUnitedQrNoPaids(id:number):Promise<{pdf:Buffer,nameUnidet:string}>{
        if(isEmpty(id))throw new HttpException('No se envi?? la data',400);

        const browser=await puppeteer.launch({args: ['--no-sandbox','--disable-setuid-sandbox']});
        const page=await browser.newPage();
        page.setDefaultNavigationTimeout(0);

        const unitedEnt: UnitedEntity=await this.unitedRepository.findOne({
            where:{id},
            relations: ['course']
        });
        if(!unitedEnt)throw new HttpException('No existe un curso con ese id',409);

        let resultHtml=`
            <table id="puppeteer"><thead>
            <tr>
            <th>Nro</th>
            <th>Rude</th>
            <th>Carnet</th>
            <th>Nombre</th>
            <th>Curso</th>
            <th style="padding-right: 250px">Nombre tutor</th>
            <th style="padding-right: 70px">CI tutor</th>
            <th style="padding-right: 50px">Firma tutor</th>
            </tr>
            </thead>
            <tbody>
        `;
        let count=1;
        for (let z = 0; z < unitedEnt.course.length; z++) {
            const element: CourseEntity= unitedEnt.course[z];
            const {construir,i}=await this.getPdfACourseNoPaids(element.id,count,unitedEnt.schoolType);
            resultHtml+=construir;
            count=i;
        }

        resultHtml+=`
            </tbody>
            </table>
        `;

        let resultHtml2=`<!DOCTYPE html><html lang="en" dir="ltr"><head><meta charset="utf-8"><title></title></head><body>
        <h3 style="text-align: center; margin-bottom: 0px;">${unitedEnt.schoolCode} : ${unitedEnt.schoolName}</h3>
        ${resultHtml}
        <br>
        <table id="puppeteer3"><thead>
        <tr>
        <th>Total beneficiarios pagados</th>
        <th style="padding-right: 150px"></th>
        </tr>
        <tr>
        <th>Total beneficiarios NO pagados</th>
        <th style="padding-right: 150px"></th>
        </tr>
        </thead>
        </table>
        <br>
        <p>Observaciones..........................................................
        ..........................................................................
        ..........................................................................
        ..........................................................</p>
        </body></html>`;

        await page.setContent(resultHtml2);
        await page.evaluate(async () => {
            const style = document.createElement('style');
            style.type = 'text/css';
            const content = `
            #puppeteer {
                font-family:"Times New Roman", Times, serif;
                font-size:70%;
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
            #puppeteer3 {
                font-family:"Times New Roman", Times, serif;
                font-size:70%;
                border-collapse: collapse;
                margin-left: auto;
                margin-right: auto;
            }
            #puppeteer3 td, #customers th {
                border: 1px solid #ddd;
            }
            #puppeteer3 th {
                padding-top: 8px;
                padding-bottom: 8px;
                text-align: left;
                border: 1px solid black;
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
            width:'216mm',
            height:'330mm',
            margin: {
                left: '50',
                right: '10',
                top: '20',
                bottom: '10'
            },
        
        });

        await browser.close();

        const nameUnidet=unitedEnt.schoolCode+'-'+unitedEnt.schoolName;
        

        return {pdf,nameUnidet};
    }

    //no pagados de un curso
    private async getPdfACourseNoPaids(id:number,countNumeration:number,schoolType:string):Promise<{construir:string,i:number}>{

        const courseEnt: CourseEntity=await this.courseRepository.findOne({
            where:{id},
            relations: ['student']
        });
        
        let construir='';
        let i=countNumeration;
        for (let z = 0; z < courseEnt.student.length; z++) {
            const element = courseEnt.student[z];
            if(element.registration=='EFECTIVO'&&!element.paid){
                if(schoolType=='E'){
                    construir+=`<tr>
                        <td>${i}</td>
                        <td>${element.rude}</td>
                        <td>${element.identification}</td>
                        <td>${element.name}</td>
                        <td>${courseEnt.level}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        </tr>`;
                }else{
                    construir+=`<tr>
                        <td>${i}</td>
                        <td>${element.rude}</td>
                        <td>${element.identification}</td>
                        <td>${element.name}</td>
                        <td>${courseEnt.level.substr(0,courseEnt.level.indexOf(' '))+' '+courseEnt.turn+' '+courseEnt.grade.charAt(courseEnt.grade.length-1)+'?? '+courseEnt.group.charAt(courseEnt.group.length-1)}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        </tr>`;
                }
                i+=1;
            }
        }

        return {construir,i};

    }

    //----------------------------------------------------------------------------------------------------------------


    public async getallRar():Promise<Buffer>{
        
        const unitedEnt: UnitedEntity[]=await this.unitedRepository.find();
        if(!unitedEnt)throw new HttpException('error',409);

        const resp: ResponsePdfUnited[]=[];

        const zip: AdmZip= new AdmZip();

        
        for (let z = 211; z < unitedEnt.length; z++) {
            console.log(z);
            
            const element= unitedEnt[z];
            const {zipBuffer,nameUnidet}=await this.getPdfUnitedQr(element.id);
            zip.addFile(nameUnidet+'.zip',Buffer.alloc(zipBuffer.length, zipBuffer),'comentario gamp');
        }

        /*for (let z = 50; z < 100; z++) {
            console.log(z);
            
            const element= unitedEnt[z];
            const {zipBuffer,nameUnidet}=await this.getPdfUnitedQr(element.id);
            zip.addFile(nameUnidet+'.zip',Buffer.alloc(zipBuffer.length, zipBuffer),'comentario gamp');
        }

        for (let z = 100; z < 150; z++) {
            console.log(z);
            
            const element= unitedEnt[z];
            const {zipBuffer,nameUnidet}=await this.getPdfUnitedQr(element.id);
            zip.addFile(nameUnidet+'.zip',Buffer.alloc(zipBuffer.length, zipBuffer),'comentario gamp');
        }

        for (let z = 150; z < 200; z++) {
            console.log(z);
            
            const element= unitedEnt[z];
            const {zipBuffer,nameUnidet}=await this.getPdfUnitedQr(element.id);
            zip.addFile(nameUnidet+'.zip',Buffer.alloc(zipBuffer.length, zipBuffer),'comentario gamp');
        }

        for (let z = 200; z < unitedEnt.length; z++) {
            console.log(z);
            
            const element= unitedEnt[z];
            const {zipBuffer,nameUnidet}=await this.getPdfUnitedQr(element.id);
            zip.addFile(nameUnidet+'.zip',Buffer.alloc(zipBuffer.length, zipBuffer),'comentario gamp');
        }*/

        const zipBuffer: Buffer = zip.toBuffer();

        
        return zipBuffer;
    }

    public async getPdfUnitedQr(id:number):Promise<{zipBuffer:Buffer,nameUnidet:string}>{
        if(isEmpty(id))throw new HttpException('No se envi?? la data',400);

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
            zip.addFile(namePdf+'.pdf',Buffer.alloc(pdf.length, pdf),'comentario gamp');
        }

        //especiales a??adido
        /*for (let z = 0; z < unitedEnt.course.length; z++) {
            const element: CourseEntity= unitedEnt.course[z];
            const {namePdf,pdf}=await this.getPdfACourse(element.id);
            zip.addFile(namePdf+z+'.pdf',Buffer.alloc(pdf.length, pdf),'comentario gamp');
        }*/

        const zipBuffer: Buffer = zip.toBuffer();

        const nameUnidet=unitedEnt.schoolCode+'-'+unitedEnt.schoolName;
        
        return {zipBuffer,nameUnidet};
    }

    

    public async getPdfACourse(id:number):Promise<{pdf:Buffer,namePdf:string}>{
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
                +'<th style="padding-right: 250px">Nombre tutor</th>'
                +'<th style="padding-right: 70px">CI tutor</th>'
                +'<th style="padding-right: 50px">Firma tutor</th>'
                +'</tr>'
                +'</thead>'
                +'<tbody>';
        let countNumeration=1;
        for (let z = 0; z < courseEnt.student.length; z++) {
            const element = courseEnt.student[z];
            if(element.registration=='EFECTIVO'){
                if(countNumeration%2!=0){
                    construir+='<tr>'
                    +'<td>'+(countNumeration)+'</td>'
                    +'<td><img style="margin-bottom:-3px" src="'+(await this.createQR(element.rude))+'" width="30" height="30" /></td>'
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
                    construir+=`<tr>
                    <td>${(countNumeration)}</td>
                    <td></td>
                    <td>${element.rude}</td>
                    <td><img style="margin-bottom:-3px" src="${(await this.createQR(element.rude))}" width="30" height="30" /></td>
                    <td>${element.identification}</td>
                    <td>${element.name}</td>
                    <td>${element.registration}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    </tr>`;
                }
                countNumeration+=1;
            }
        }
        construir+=`</tbody>
                </table>`;

        let data=`<!DOCTYPE html><html lang="en" dir="ltr"><head><meta charset="utf-8"><title></title></head><body>
        <h3 style="text-align: center; margin-bottom: 0px;">${courseEnt.united.schoolCode} : ${courseEnt.united.schoolName}</h3>
        <table id="puppeteer2"><thead>
        <tr>
        <th>Nivel : ${courseEnt.level}</th>
        <th>Turno : ${courseEnt.turn}</th>
        <th>${courseEnt.grade}</th>
        <th>${courseEnt.group}</th>
        </tr>
        </thead>
        <tbody>
        </tbody>
        <br>
        ${construir}
        <br>
        <table id="puppeteer3"><thead>
        <tr>
        <th>Total beneficiarios pagados</th>
        <th style="padding-right: 150px"></th>
        </tr>
        <tr>
        <th>Total beneficiarios NO pagados</th>
        <th style="padding-right: 150px"></th>
        </tr>
        </thead>
        </table>
        <br>
        <p>Observaciones..........................................................
        ..........................................................................
        ..........................................................................
        ..........................................................</p>
        </body></html>`;
        await page.setContent(data);
        await page.evaluate(async () => {
        const style = document.createElement('style');
        style.type = 'text/css';
        const content = `
        #puppeteer {
            font-family:"Times New Roman", Times, serif;
            font-size:70%;
            border-collapse: collapse;
            width: 100%;
        }
        #puppeteer td {
            border: 1px solid #ddd;
        }
        #puppeteer tbody:before {
            content: "@";
            display: block;
            line-height: 1px;
            color: transparent;
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
        }
        #puppeteer3 {
            font-family:"Times New Roman", Times, serif;
            font-size:70%;
            border-collapse: collapse;
            margin-left: auto;
            margin-right: auto;
        }
        #puppeteer3 td, #customers th {
            border: 1px solid #ddd;
        }
        #puppeteer3 th {
            padding-top: 8px;
            padding-bottom: 8px;
            text-align: left;
            border: 1px solid black;
        }
        `;
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
            width:'216mm',
            height:'330mm',
            margin: {
                left: '50',
                right: '10',
                top: '20',
                bottom: '10'
            },
        
        });

        await browser.close();

        const namePdf: string=courseEnt.level.substr(0,courseEnt.level.indexOf(' '))+'-'+courseEnt.turn+'-'+courseEnt.grade.charAt(courseEnt.grade.length-1)+'?? '+courseEnt.group.charAt(courseEnt.group.length-1);
        
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

        const obj3: UnitedsDto[]= JSON.parse(fs.readFileSync(__dirname+'/../../../dataStudent/colegiosEspeciales.json', 'utf8'));
        for (let z = 0; z < obj3.length; z++) {
            const {courses,schoolCode,year,schoolName} = obj3[z];
            const unitEnt=await this.createUnited(schoolCode,schoolName,year,'E');
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

    public async pikaPoint({totalPaid,payDate,paidStudents,courseId,userId}:SyncStudentsDto,path:string):Promise<{results: PaidStudentsDto[],cProccessEnt: CourseProccessEntity}>{
        
        const userEnt: UserEntity=await this.userRepository.findOne({
            where:{id:userId},
            relations:['course','course.student']
        });

        const courses: CourseEntity[]=userEnt.course;
        const index: number=courses.findIndex((dat:CourseEntity)=>{return dat.id==courseId});

        const results: PaidStudentsDto[]=[];

        for (let z = 0; z < paidStudents.length; z++) {
            const element: PaidStudentsDto = paidStudents[z];
            const res: UpdateResult=await this.studentRepository.update(element.studentId,{paid:true});
            if(res.affected==0){
                results.push(element);
            }
        }

        const cProccessEnt=new CourseProccessEntity();
        cProccessEnt.photo='photo/'+cProccessEnt.id;
        cProccessEnt.path=path;
        cProccessEnt.totalPaid=totalPaid;
        cProccessEnt.payDate=payDate;
        cProccessEnt.course=courses[index];

        await this.courseProccessRepository.create(cProccessEnt);

        userEnt.lastSyncDate=new Date(); 
        await this.userRepository.update(userId,userEnt);

        return {results,cProccessEnt};
    }

    //------------------------------------------------------------------------------
    //REVISAR PIKA

    public async countQr(data:SendingDataDto[],id:number):Promise<boolean>{
        
        const userEnt: UserEntity=await this.userRepository.findOne(id);
        if(!userEnt)throw new HttpException('Error al encontrar el usuario',409);
 
        for (let z = 0; z < data.length; z++) {
            const element: SendingDataDto = data[z];
            const studentEnt: StudentEntity=await this.studentRepository.findOne({
                where:{id:element.idStudent,rude:element.rude},
            });
            if(studentEnt){
                const sendEnt: SendingsEntity=new SendingsEntity();
                sendEnt.rude=element.rude;
                sendEnt.user=userEnt;
                sendEnt.student=studentEnt;
                sendEnt.stateStudent=false;
                await this.sendingsRepository.save(sendEnt);
                await this.studentRepository.update(studentEnt.id,{paid:false});
            }
        }
        return true;
    }

    public async getCoursesAndStudents(id:number):Promise<UnitedEntity>{
        const unitedEnt=await this.unitedRepository.findOne({
            where:{id:id},
            relations:['course','course.student']
        });
        if(!unitedEnt)throw new HttpException('Error no se encontr?? la unidad',409);
        return unitedEnt;
    }

    //------------------------------------------------------------------------------

    public async readxls():Promise<any>{
        let courses=[];
        let school=[];
        let student=[];
        let escsin=false;
        let rows=await readXlsxFile(__dirname + '/../../../dataStudent/discapacidad2.xlsx');
        for (let z = 0; z < rows.length; z++) {
            const element = rows[z];
            if(element[0]=='escuelasin'){
                if(courses.length>0){
                    let ob=school.pop();
                    ob.courses=courses;
                    school.push(ob);
                }
                school.push({
                    schoolCode: "",
                    schoolName: element[1],
                    year: "2021",
                    courses: []
                });
                courses=[];
                student=[];
                escsin=true;
            }else if(element[0]=='escuela'){
                if(courses.length>0){
                    let ob=school.pop();
                    ob.courses=courses;
                    school.push(ob);
                }
                school.push({
                    schoolCode: "",
                    schoolName: element[1],
                    year: "2021",
                    courses: []
                });
                student=[];
                courses=[];
            }else if(await this.isNumber(element[0])){
                if(student.length>0){
                    let ob=courses.pop();
                    ob.students=student;
                    courses.push(ob);
                }
                courses.push({
                    level: element[2],
                    turn: "",
                    grade: element[0],
                    group: element[1],
                    students:[]
                });

                student=[];
            }else{
                if(escsin){
                    student.push({
                        pdfNumber: "0",
                        rude: element[1]+'',
                        identification: '',
                        name: element[0]+'',
                        gender: "",
                        dateOfBirth: '',
                        country: "BOLIVIA",
                        department: "Potosi",
                        province: "",
                        locality: "",
                        registration: "EFECTIVO"
                    });
                }else{
                    let res='';
                    let format=element[1];
                    for (let x = 0; x < format.length; x++) {
                        if(await this.isNumber(format.charAt(x))){
                            res+=format.charAt(x);
                        }
                        
                    }                
                    student.push({
                        pdfNumber: "0",
                        rude: res,
                        identification: element[3]?element[3]+'':'',
                        name: element[0],
                        gender: "",
                        dateOfBirth: '',
                        country: "BOLIVIA",
                        department: "Potosi",
                        province: "",
                        locality: "",
                        registration: "EFECTIVO"
                    });
                }
                
            }
        }
        if(student.length>0){
            let ob=courses.pop();
            ob.students=student;
            courses.push(ob);
            let obs=school.pop();
            obs.courses=courses;
            school.push(obs);
        }
        return school;
    }

    private async isNumber(x:string):Promise<boolean>{
        const n:number=parseInt(x); 
        if(isNaN(n))return false;
        return true;
    }


    public async deleteFile(path:string):Promise<boolean>{

        const element = path;
        fs.unlink(element, (err) => {
            if (err) {
            console.log(`???? error al eliminar el archivo ${err}`);
            }
        });

        return true;
    }

    public async getStatePdf():Promise<Buffer>{

        const zip: AdmZip= new AdmZip();
         
        const unitedEnt=await this.unitedRepository.find({
            relations:['course']
        });

        for (let z = 211; z < unitedEnt.length; z++) {
            console.log(z);
            
            const element: UnitedEntity= unitedEnt[z];
            const {namePdf,pdf}=await this.getpdfCourses(element);
            zip.addFile(namePdf+'.pdf',Buffer.alloc(pdf.length, pdf),'comentario gamp');
        }

        /*for (let z = 130; z < 131; z++) {
            const element: UnitedEntity= unitedEnt[z];
            const {namePdf,pdf}=await this.getpdfCourses(element);
            zip.addFile(namePdf+'.pdf',Buffer.alloc(pdf.length, pdf),'comentario gamp');
        }*/

        const zipBuffer: Buffer = zip.toBuffer();

        return zipBuffer;

    }

    private async getpdfCourses(unitedEnt:UnitedEntity):Promise<{pdf:Buffer,namePdf:string}>{
        //<img id='barcode' src="https://api.qrserver.com/v1/create-qr-code/?data=hola&amp;size=100x100" alt="" title="HELLO" width="50" height="50" />
        const browser=await puppeteer.launch({args: ['--no-sandbox','--disable-setuid-sandbox']});
        const page=await browser.newPage();
        page.setDefaultNavigationTimeout(0);
        
        let construir='<table id="puppeteer"><thead>'
                +'<tr>'
                +'<th>Nro</th>'
                +'<th style="text-align: left; padding-right: 250px">CURSO</th>'
                +'<th style="padding-right: 10px; padding-left: 10px">CANTIDAD PAGADOS</th>'
                +'<th>CANTIDAD NO PAGADOS</th>'
                +'</tr>'
                +'</thead>'
                +'<tbody>';
        let countNumeration=1;

        if(unitedEnt.schoolType=='E'){
            for (let z = 0; z < unitedEnt.course.length; z++) {
                const element: CourseEntity = unitedEnt.course[z];
                construir+=`<tr>
                    <td>${countNumeration}</td>
                    <td>${element.level} ${element.grade} ${element.group}</td>
                    <td></td>
                    <td></td>
                    </tr>`;
                countNumeration++;
            }
        }else{
            for (let z = 0; z < unitedEnt.course.length; z++) {
                const element: CourseEntity = unitedEnt.course[z];
                construir+=`<tr>
                    <td>${countNumeration}</td>
                    <td>${element.level.substr(0,element.level.indexOf(' '))+' '+element.turn+' '+element.grade.charAt(element.grade.length-1)+'?? '+element.group.charAt(element.group.length-1)}</td>
                    <td></td>
                    <td></td>
                    </tr>`;
                countNumeration++;
            }
        }

        construir+=`</tbody>
                <tfoot>
                <tr>
                <th colspan="2" style="text-align: right;">TOTAL</th>
                <th></th>
                <th></th>
                </tr>
                </tfoot>
                </table>`;

        let data=`<!DOCTYPE html><html lang="en" dir="ltr"><head><meta charset="utf-8"><title></title></head><body>
        <h3 style="text-align: center; margin-bottom: 0px;">RESUMEN DE PAGOS DEL BONO ESTUDIANTIL</h3>
        <h3 style="text-align: center; margin-bottom: 0px;">${unitedEnt.schoolCode} : ${unitedEnt.schoolName}</h3>
        <br>
        ${construir}
        <br>
        </body></html>`;
        await page.setContent(data);
        await page.evaluate(async () => {
        const style = document.createElement('style');
        style.type = 'text/css';
        const content = `
        #puppeteer {
            font-family:"Times New Roman", Times, serif;
            font-size:50%;
            border-collapse: collapse;
            width: 60%;
            margin-left: auto;
            margin-right: auto;
        }
        #puppeteer td {
            border: 1px solid black;
            padding-top: 6px;
            padding-bottom: 6px;
        }
        #puppeteer th {
            padding-top: 8px;
            padding-bottom: 8px;
            border: 1px solid black;
        }
        `;
        style.appendChild(document.createTextNode(content));
        const promise = new Promise((resolve, reject) => {
            style.onload = resolve;
            style.onerror = reject;
        });
        document.head.appendChild(style);
        await promise;
        });
        const pdf=await page.pdf({
            printBackground: true,
            width:'216mm',
            height:'330mm',
            margin: {
                top: '50',
                bottom: '50'
            },
        });

        await browser.close();

        const namePdf: string=unitedEnt.schoolCode+' : '+unitedEnt.schoolName;

        return {pdf,namePdf};

    }

}
