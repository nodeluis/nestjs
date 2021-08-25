import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne} from 'typeorm';
import { Student } from '../interfaces/student.interface';
import { CourseEntity } from './course.entity';

@Entity()
export class StudentEntity implements Student{

    @PrimaryGeneratedColumn()
    id:number;

    @ManyToOne(() => CourseEntity, course => course.student)
    course: CourseEntity;

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;
    
    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

}