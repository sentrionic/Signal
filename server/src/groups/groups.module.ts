import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../users/entities/user.entity';
import { Group } from './entities/group.entity';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [User, Group] })],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
