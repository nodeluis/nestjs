import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany} from 'typeorm';
import { United } from '../interfaces/united.interface';
import { CourseEntity } from './course.entity';

@Entity()
export class UnitedEntity implements United{

    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    schoolCode:string;

    @Column()
    schoolName:string;

    @Column()
    year:number;

    @Column()
    schoolType:string;

    @OneToMany(() => CourseEntity, course => course.united)
    course: CourseEntity[];

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;
    
    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

}