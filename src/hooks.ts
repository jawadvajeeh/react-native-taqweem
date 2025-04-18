import { useMemo } from 'react';
import type { CalendarDay } from './types';
import { getCurrentMonth, getCurrentYear, getNextMonth, getNumberOfDaysInMonth, getPreviousMonth, setDayOfMonth } from './utils';
import moment from 'moment-hijri';

export const useCalendarInfo = (isHijri: boolean, dateObj: moment.Moment) => {
	const year = getCurrentYear(isHijri, dateObj);
	const month = getCurrentMonth(isHijri, dateObj);
	const daysInMonth = getNumberOfDaysInMonth(isHijri, dateObj);

	return { year, month, daysInMonth };
};

export const useCalendarDays = (
	isHijri: boolean,
	year: number,
	month: number,
	daysInMonth: number,
	showAdjacentMonths: boolean,
): (CalendarDay | null)[] => {
	return useMemo(() => {
		const startOfCurrentMonth = isHijri
			? moment(`${year}-${month + 1}-1`, 'iYYYY-iM-iD')
			: moment(`${year}-${month + 1}-1`, 'YYYY-M-D');

		const firstDayWeekDayOfMonth = startOfCurrentMonth.day();

		const currentMonthDates = Array.from({ length: daysInMonth }, (_, i) => {
			const day = i + 1;
			const date = startOfCurrentMonth.clone();
			const dateObj = setDayOfMonth(date, day, isHijri);
			return {
				label: day.toString(),
				date: dateObj,
				isCurrentMonth: true,
			};
		});

		if (!showAdjacentMonths) {
			const totalCells = 42;
			const blanksBefore = Array(firstDayWeekDayOfMonth).fill(null);
			const blanksAfter = Array(
				totalCells - blanksBefore.length - currentMonthDates.length,
			).fill(null);
			return [
				...blanksBefore.map(() => null),
				...currentMonthDates,
				...blanksAfter.map(() => null),
			];
		}

		const prevMonth = getPreviousMonth(isHijri, startOfCurrentMonth.clone());
		const prevMonthDays = getNumberOfDaysInMonth(isHijri, prevMonth);
		const prevMonthDates = Array.from(
			{ length: firstDayWeekDayOfMonth },
			(_, i) => {
				const day = prevMonthDays - firstDayWeekDayOfMonth + i + 1;
				const date = prevMonth.clone();
				const dateObj = setDayOfMonth(date, day, isHijri);
				return {
					label: day.toString(),
					date: dateObj,
					isCurrentMonth: false,
				};
			},
		);

		const totalCells = 42;
		const nextDaysNeeded =
			totalCells - (prevMonthDates.length + currentMonthDates.length);
		const nextMonth = getNextMonth(isHijri, startOfCurrentMonth.clone());
		const nextMonthDates = Array.from({ length: nextDaysNeeded }, (_, i) => {
			const day = i + 1;
			const date = nextMonth.clone();
			const dateObj = setDayOfMonth(date, day, isHijri);
			return {
				label: day.toString(),
				date: dateObj,
				isCurrentMonth: false,
			};
		});

		return [...prevMonthDates, ...currentMonthDates, ...nextMonthDates];
	}, [isHijri, year, month, daysInMonth, showAdjacentMonths]);
};
export const useWeekdays = (lang = 'en'): string[] => {
	return useMemo(() => {
		const formatter = new Intl.DateTimeFormat(lang, { weekday: 'short' });

		// Starting from Sunday (0) to Saturday (6)
		const baseDate = new Date(Date.UTC(2023, 9, 1)); // Any Sunday

		return Array.from({ length: 7 }, (_, i) => {
			const date = new Date(baseDate);
			date.setDate(baseDate.getDate() + i); // Increment day
			return formatter.format(date);
		});
	}, [lang]);
};
