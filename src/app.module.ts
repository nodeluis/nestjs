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
      host: 'ec2-44-196-250-191.compute-1.amazonaws.com',
      port: 5432,
      username: 'dmhhygvxfeydjr',
      password: '907bc16f92c2d265858bee90b4ff798954d73875ea19ef759d71816d866b9221',
      database: 'd1gr5r8huc91nc',
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: false,
      retryDelay:3000,
      retryAttempts:10,
      "ssl": true,
      "extra": {
        "ssl": {
          "rejectUnauthorized": false
        }
      }
    }),
    UsersModule,
    CoursesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  
}
