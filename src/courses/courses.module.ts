import { Module } from '@nestjs/common';
import { CoursesService } from './services/courses.service';
import { CoursesController } from './controllers/courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitedEntity } from './entities/united.entity';
import { CourseEntity } from './entities/course.entity';
import { StudentEntity } from './entities/student.entity';
import { CourseProccessEntity } from './entities/courseProccess.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { SendingsEntity } from './entities/sendings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UnitedEntity,CourseEntity,StudentEntity,CourseProccessEntity,UserEntity,SendingsEntity])
  ],
  providers: [CoursesService],
  controllers: [CoursesController]
})
export class CoursesModule {}
