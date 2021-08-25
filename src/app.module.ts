import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '172.22.0.2',
      port: 5432,
      username: 'gamp',
      password: 'gamp-pass',
      database: 'gampUser',
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: false,
      retryDelay:3000,
      retryAttempts:10
    }),
    UsersModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  
}
