import { Module } from '@nestjs/common';
import { CoursesService } from './services/courses.service';
import { CoursesController } from './controllers/courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitedEntity } from './entities/united.entity';
import { CourseEntity } from './entities/course.entity';
import { StudentEntity } from './entities/student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UnitedEntity,CourseEntity,StudentEntity])
  ],
  providers: [CoursesService],
  controllers: [CoursesController]
})
export class CoursesModule {}
