import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesModule } from './courses/courses.module';

@Module({
  imports: [
    /*TypeOrmModule.forRoot({
      type: 'postgres',
      host: '172.22.0.2',
      port: 5432,
      username: 'gamp',
      password: 'gamp-pass',
      database: 'gampUser',
      //
      synchronize: false,
      retryDelay:3000,
      retryAttempts:10
    }),*/
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '190.129.25.205',
      port: 5432,
      username: 'postgres',
      password: 'TN5NACBQFBLA0NUJ8OA1',
      database: 'bono_estudiantil_2021',
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: false,
      retryDelay:3000,
      retryAttempts:10
    }),
    UsersModule,
    CoursesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  
}
