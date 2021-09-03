import { Student } from "src/courses/interfaces/student.interface";

export interface CoursesResponse{
    turn:string;
    grade:string;
    group:string;
    students:Array<Student>;
}