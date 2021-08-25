import { Module } from '@nestjs/common';
import { CoursesService } from './services/courses.service';
import { CoursesController } from './controllers/courses.controller';

@Module({
  providers: [CoursesService],
  controllers: [CoursesController]
})
export class CoursesModule {}
