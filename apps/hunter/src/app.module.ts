import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { HelperModule } from '@app/helper';

@Module({
  imports: [ScheduleModule.forRoot(), HelperModule],
  providers: [SchedulerService],
})
export class AppModule {}
