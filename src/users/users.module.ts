import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { CourseEntity } from 'src/courses/entities/course.entity';
import { StudentEntity } from 'src/courses/entities/student.entity';
import { SendingsEntity } from 'src/courses/entities/sendings.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([UserEntity,CourseEntity,StudentEntity,SendingsEntity]),
  ],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {
  
}
