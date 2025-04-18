import type { Moment } from 'moment-hijri';
import { type TextStyle, type ViewStyle } from 'react-native';

export interface CalendarDay {
	label: string;
	date: Moment;
	isCurrentMonth: boolean;
}

export interface HeaderProps {
	goToNextMonth?: () => void;
	goToPrevMonth?: () => void;
	toggleCalendarMode?: () => void;
	calendarTitle?: string;
	canGoPreviousMonth?: boolean;
	canGoNextMonth?: boolean;
	headerTheme?: Pick<CalendarTheme, 'header' | 'headerTextStyle'>;
}

export type CalendarMode = 'gregorian' | 'hijri';

export type DayGridProps = {
	days: (CalendarDay | null)[];
	allowFutureDates: boolean;
	fullDateFormat: string;
	selectedDateStr: string | null;
	todaysDate: string;
	dayGridTheme?: Pick<CalendarTheme, 'calendarGrid' | 'dayCell' | 'dayNameCell' | 'dayTextStyle' | 'todayCellStyle' | 'selectedDayStyle' | 'nonCurrentMonthTextStyle' | 'todayTextStyle' | 'selectedDayTextStyle'>;
	handleSelectDay: (props: CalendarDay) => void;
};

export type WeekDayNamesProps = {
	weekDayTheme?: Pick<CalendarTheme, 'dayNameCell'>;
};

export type DualCalendarProps = {
	calendarTheme?: CalendarTheme;
	/**
	 * Whether to show the padding days from previous and next month (default: true)
	 */
	showAdjacentMonths?: boolean;
	/**
	 * Allows future date selection (default: true)
	 */
	allowFutureDates?: boolean;

	/**
	 * Mininum accepted date
	 */
	minDate?: YearMonthKey;
	/**
	 * Maximum accepted date
	 */
	maxDate?: YearMonthKey;

	/**
	 * Determines whether calendar uses hijri or gregorian dates (default: gregorian)
	 */
	calendarMode?: CalendarMode;
	/**
	 * The initialYearMonth selected date. Format: YYYY-M-D (e.g 2023-4-8)
	 */
	initialSelectedDate?: YearMonthDayKey;
	/**
	 * The starting month to display. Format: YYYY-M (e.g 2005-10)
	 */
	currentYearMonth?: YearMonthKey;

	renderHeader?: (props: HeaderProps) => React.ReactNode;

	onDateChange?: (info: {
		calendarDate: string;
		hijriDate: string;
		gregorianDate: string;
		momentObj: Moment | null;
	}) => void;
};

export type YearMonthKey = `${number}-${number}`;
export type YearMonthDayKey = `${number}-${number}-${number}`;

export type CalendarTheme = Partial<{
	header: ViewStyle;
	calendarGrid: ViewStyle;
	dayCell: ViewStyle;
	todayCellStyle: ViewStyle;
	selectedDayStyle: ViewStyle;
	calendarView: ViewStyle;
	dayNameCell: TextStyle;
	nonCurrentMonthTextStyle: TextStyle;
	dayTextStyle: TextStyle;
	selectedDayTextStyle: TextStyle;
	todayTextStyle: TextStyle;
	headerTextStyle: TextStyle;
}>;