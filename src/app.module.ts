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
      host: '34.133.240.184',
      port: 5432,
      username: 'postgres',
      password: 'AfAFAFFl3xCFHJLd',
      database: 'postgres',
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
