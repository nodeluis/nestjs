import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany} from 'typeorm';
import { Student } from '../interfaces/student.interface';
import { CourseEntity } from './course.entity';
import { SendingsEntity } from './sendings.entity';

@Entity()
export class StudentEntity implements Student{

    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    rude:string;

    @Column()
    identification:string;

    @Column()
    name:string;

    @Column()
    pdfNumber:number;

    @Column()
    gender:string;

    @Column()
    dateOfBirth:string;
    
    @Column()
    country:string;

    @Column()
    department:string;

    @Column()
    province:string;

    @Column()
    locality:string;

    @Column()
    registration:string;

    @Column({default:true})
    paid:boolean;

    @OneToMany(() => SendingsEntity, send => send.student)
    send: SendingsEntity[];

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