import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { FilesService } from './files.service';
import { ConfigSchema } from './common/schemas/config.schema';
import { RmqModule } from '@senorg/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: ConfigSchema,
    }),
    RmqModule,
  ],
  controllers: [AppController],
  providers: [FilesService],
})
export class AppModule {}
