import { Student } from "src/courses/interfaces/student.interface";

export interface CoursesResponse{
    turn:string;
    yearOfSchoollarity:number;
    group:string;
    students:Array<Student>;
}