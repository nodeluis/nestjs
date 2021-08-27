import { CourseEntity } from 'src/courses/entities/course.entity';
import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn} from 'typeorm';
import { User } from '../interfaces/user.interface';

@Entity()
export class UserEntity implements User{
    
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    user:string;

    @Column()
    password:string;

    @OneToOne(() => CourseEntity)
    @JoinColumn()
    course: CourseEntity;

    @CreateDateColumn({
        name: 'creation_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    creationAt: Date;
    
    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

}