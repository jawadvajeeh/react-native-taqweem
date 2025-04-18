import moment from 'moment-hijri';

export function getPreviousMonth(isHijri: boolean, currentDate: moment.Moment) {
	if (isHijri) {
		return currentDate.clone().subtract(1, 'iMonth');
	} else {
		return currentDate.clone().subtract(1, 'month');
	}
}

export function getNextMonth(isHijri: boolean, currentDate: moment.Moment) {
	if (isHijri) {
		return currentDate.clone().add(1, 'iMonth');
	} else {
		return currentDate.clone().add(1, 'month');
	}
}

export function getFullDateFormat(isHijri: boolean) {
	return isHijri ? 'iYYYY-iM-iD' : 'YYYY-M-D';
}

export function getYearMonthFormat(isHijri: boolean) {
	return isHijri ? 'iYYYY-iM' : 'YYYY-M';
}

export function getCalendarTitleFormat(isHijri: boolean) {
	return isHijri ? 'iMMMM iYYYY' : 'MMMM YYYY';
}

export function getCalendarTitle(dateObj: moment.Moment, titleFormat: string) {
	return dateObj.format(titleFormat);
}

export function getCurrentYear(isHijri: boolean, currentDate: moment.Moment) {
	return isHijri ? currentDate.iYear() : currentDate.year();
}

export function getCurrentMonth(isHijri: boolean, currentDate: moment.Moment) {
	return isHijri ? currentDate.iMonth() : currentDate.month();
}

export function getNumberOfDaysInMonth(isHijri: boolean, currentDate: moment.Moment) {
	return isHijri ? currentDate.iDaysInMonth() : currentDate.daysInMonth();
}

export function setDayOfMonth(
	date: moment.Moment,
	day: number,
	isHijri: boolean,
): moment.Moment {
	return isHijri ? date.iDate(day) : date.date(day);
}
