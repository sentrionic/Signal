import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import calendar from 'dayjs/plugin/calendar';

dayjs.extend(relativeTime);
dayjs.extend(calendar);

export const getLastSeen = (date: string): string => dayjs().to(dayjs(date));

export const checkNewDay = (date1: string, date2: string): boolean =>
  !dayjs(date1).isSame(dayjs(date2), 'day');

export const formatSentAt = (date: string): string => dayjs(date).calendar();

export const formatDivider = (date: string): string => dayjs(date).format('MMMM D, YYYY');
