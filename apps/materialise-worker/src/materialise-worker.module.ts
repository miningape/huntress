import { Module } from '@nestjs/common';
import { MaterialiseWorkerService } from './materialise-worker.service';
import { ScheduleModule } from '@nestjs/schedule';
import { HelperModule } from '@app/helper';
import { MaterialiseViewService } from './materialise/materialise.view.service';
import { MaterialiseJobService } from './materialise/materialise.job.service';
import { PostgresFactory } from './postgres.factory';

@Module({
  imports: [ScheduleModule.forRoot(), HelperModule],
  providers: [
    PostgresFactory,
    MaterialiseWorkerService,
    MaterialiseViewService,
    MaterialiseJobService,
  ],
})
export class MaterialiseWorkerModule {}
