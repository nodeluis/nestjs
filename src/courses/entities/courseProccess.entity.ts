
import { UserEntity } from 'src/users/entities/user.entity';
import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, OneToOne, JoinColumn} from 'typeorm';
import { CourseProccessInterface } from '../interfaces/courseProccess.interface';
import { CourseEntity } from './course.entity';


@Entity()
export class CourseProccessEntity implements CourseProccessInterface{

    @PrimaryGeneratedColumn()
    id:number;
    
    @Column()
    photo:string;

    @Column()
    path:string;

    @Column()
    totalPaid:number;

    @Column()
    payDate:Date;

    @ManyToOne(() => CourseEntity, course => course.courseProccess)
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