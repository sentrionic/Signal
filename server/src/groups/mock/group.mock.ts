import { Group } from '../entities/group.entity';
import { getRandomString } from '../../common/utils/faker';

export const getMockGroup = (): Group => new Group(getRandomString());
