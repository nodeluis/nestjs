import { Module } from '@nestjs/common';
import { CoursesService } from './services/courses.service';
import { CoursesController } from './controllers/courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitedEntity } from './entities/united.entity';
import { CourseEntity } from './entities/course.entity';
import { StudentEntity } from './entities/student.entity';
import { MulterModule } from '@nestjs/platform-express';
import { CourseProccessEntity } from './entities/courseProccess.entity';
import { UserEntity } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UnitedEntity,CourseEntity,StudentEntity,CourseProccessEntity,UserEntity])
  ],
  providers: [CoursesService],
  controllers: [CoursesController]
})
export class CoursesModule {}
