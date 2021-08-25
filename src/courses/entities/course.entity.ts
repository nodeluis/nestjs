import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany} from 'typeorm';
import { Course } from '../interfaces/courses.interface';
import { StudentEntity } from './student.entity';
import { UnitedEntity } from './united.entity';

@Entity()
export class CourseEntity implements Course{

    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    rude:string;

    @Column()
    credential:string;

    @Column()
    name:string;


    @Column()
    gender:String;

    @Column()
    dateOfBirth:Date;
    
    @Column()
    registration:string;

    @ManyToOne(() => UnitedEntity, united => united.course)
    united: UnitedEntity;

    @OneToMany(() => StudentEntity, student => student.course)
    student: StudentEntity[];

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;
    
    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

}