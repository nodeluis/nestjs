
import { UserEntity } from 'src/users/entities/user.entity';
import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany} from 'typeorm';
import { SendingProccessInterface } from '../interfaces/sendingProccess.interface';
import { StudentEntity } from './student.entity';


@Entity()
export class SendingsEntity implements SendingProccessInterface{

    @PrimaryGeneratedColumn()
    id:number;
    
    @Column()
    rude: string;

    @Column()
    stateStudent: boolean;

    @ManyToOne(() => StudentEntity, student => student.send)
    student: StudentEntity;

    @ManyToOne(() => UserEntity, user => user.send)
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