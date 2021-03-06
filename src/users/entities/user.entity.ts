import { CourseEntity } from 'src/courses/entities/course.entity';
import { SendingsEntity } from 'src/courses/entities/sendings.entity';
import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany} from 'typeorm';
import { User } from '../interfaces/user.interface';

@Entity()
export class UserEntity implements User{
    
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    user:string;

    @Column()
    password:string;

    @Column()
    lastSyncDate:Date;

    @OneToMany(() => SendingsEntity, send => send.user)
    send: SendingsEntity[];

    @OneToMany(() => CourseEntity, course => course.user)
    course: CourseEntity[];

    @CreateDateColumn({
        name: 'creation_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    creationAt: Date;
    
    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

}