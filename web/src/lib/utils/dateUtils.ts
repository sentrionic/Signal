import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const getLastSeen = (date: string): string => dayjs().to(dayjs(date));
