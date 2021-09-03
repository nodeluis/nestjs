import { UserEntity } from 'src/users/entities/user.entity';
import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany} from 'typeorm';
import { Course } from '../interfaces/courses.interface';
import { StudentEntity } from './student.entity';
import { UnitedEntity } from './united.entity';

@Entity()
export class CourseEntity implements Course{

    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    turn:string;

    @Column()
    grade:string;

    @Column()
    group:string;

    @Column()
    level:string;

    @Column({default:false})
    asignated:boolean;
   
    @ManyToOne(() => UnitedEntity, united => united.course)
    united: UnitedEntity;

    @OneToMany(() => StudentEntity, student => student.course)
    student: StudentEntity[];

    @ManyToOne(() => UserEntity, user => user.course)
    user: UserEntity;

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;
    
    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

}