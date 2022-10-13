import { getRandomString } from '@senorg/common';
import { Group } from '../entities/group.entity';

export const getMockGroup = (): Group => new Group(getRandomString());
