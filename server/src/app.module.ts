import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ApplicationsModule } from './applications/applications.module';

@Module({
  imports: [AuthModule, ApplicationsModule]
})
export class AppModule {}
