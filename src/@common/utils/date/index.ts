import dayjs from 'dayjs';
import 'dayjs/locale/es';

/** App-wide locale. Change here to affect all date formatting. */
export const APP_LOCALE = 'es';

/** Short date: 15/04/2025 */
export const formatDate = (date: string | Date): string =>
  dayjs(date).locale(APP_LOCALE).format('DD/MM/YYYY');

/** Date + time: 15/04/2025 10:30 */
export const formatDateTime = (date: string | Date): string =>
  dayjs(date).locale(APP_LOCALE).format('DD/MM/YYYY HH:mm');

/** Today's date as YYYY-MM-DD — for use as `max` on date inputs or default form values. */
export const todayIso = (): string => dayjs().format('YYYY-MM-DD');
