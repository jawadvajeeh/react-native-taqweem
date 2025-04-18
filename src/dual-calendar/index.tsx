import {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import moment,  {type Moment} from 'moment-hijri';
import type {
  DayGridProps,
  DualCalendarProps,
  HeaderProps,
  WeekDayNamesProps,
} from '../types';
import {useCalendarDays, useCalendarInfo, useWeekdays} from '../hooks';
import { getCalendarTitle, getCalendarTitleFormat, getFullDateFormat, getNextMonth, getPreviousMonth, getYearMonthFormat } from '../utils';

export function DualCalendar({
  initialSelectedDate,
  currentYearMonth,
  minDate,
  maxDate,
  renderHeader,
  calendarTheme = {},
  showAdjacentMonths = true,
  calendarMode = 'gregorian',
  allowFutureDates = true,
  onDateChange = () => {},
}: DualCalendarProps) {
  const [isHijri, setIsHijri] = useState(calendarMode === 'hijri');
  const fullDateFormat = getFullDateFormat(isHijri);
  const yearMonthFormat = getYearMonthFormat(isHijri);
  const titleFormat = getCalendarTitleFormat(isHijri);

  const defaultMinDate = isHijri ? '1400-1' : '1900-1';
  const defaultMaxDate = isHijri
    ? moment().add(10, 'iYear').format('iYYYY-iM')
    : moment().add(10, 'year').format('YYYY-M');
  const effectiveMinDate = moment(minDate || defaultMinDate, yearMonthFormat);
  const effectiveMaxDate = moment(maxDate || defaultMaxDate, yearMonthFormat);

  const todaysDate = moment().format(fullDateFormat);

  const initialYearMonth = currentYearMonth
    ? moment(currentYearMonth, yearMonthFormat)
    : initialSelectedDate
    ? moment(initialSelectedDate, fullDateFormat)
    : moment();

  const [currentDate, setCurrentDate] = useState<Moment>(initialYearMonth);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(
    initialSelectedDate ?? null,
  );
  const _previousMonth = getPreviousMonth(isHijri, currentDate);
  const _nextMonth = getNextMonth(isHijri, currentDate);

  const canGoPreviousMonth = !_previousMonth.isBefore(
    effectiveMinDate,
    'month',
  );
  const canGoNextMonth =
    !_nextMonth.isAfter(effectiveMaxDate, 'month') &&
    (allowFutureDates || !_nextMonth.isAfter(moment(), 'month'));

	useEffect(() => {
		setIsHijri(calendarMode === 'hijri')
	},[calendarMode])

  useEffect(() => {
    if (!currentYearMonth) {
      return;
    }

    const parsedKey = moment(currentYearMonth, yearMonthFormat);
    const min = effectiveMinDate;
    const max = effectiveMaxDate;

    const clamped = parsedKey.isBefore(min)
      ? min
      : parsedKey.isAfter(max)
      ? max
      : parsedKey;

    setCurrentDate(clamped);
  }, [currentYearMonth, yearMonthFormat, effectiveMaxDate, effectiveMinDate]);

  const {year, month, daysInMonth} = useCalendarInfo(isHijri, currentDate);

  const days = useCalendarDays(
    isHijri,
    year,
    month,
    daysInMonth,
    showAdjacentMonths,
  );

  const handleSelectDay = (dayObj: {date: Moment; isCurrentMonth: boolean}) => {
    const selectedKey = dayObj.date.format(fullDateFormat);
    const gregorianDate = dayObj.date.format('YYYY-MM-DD');
    const hijriDate = dayObj.date.format('iYYYY-iMM-iDD');

    setSelectedDateStr(prev => {
      const isToggling = prev === selectedKey;

      onDateChange(
        isToggling
          ? {
              calendarDate: '',
              gregorianDate: '',
              hijriDate: '',
              momentObj: null,
            }
          : {
              calendarDate: selectedKey,
              gregorianDate,
              hijriDate,
              momentObj: dayObj.date,
            },
      );

      return isToggling ? null : selectedKey;
    });

    if (!dayObj.isCurrentMonth) {
      setCurrentDate(dayObj.date.clone());
    }
  };

  const goToPrevMonth = () => {
    let prev = getPreviousMonth(isHijri, currentDate);
    if (prev.isBefore(effectiveMinDate, 'month')) {
      return;
    }

    setCurrentDate(prev);
  };

  const goToNextMonth = () => {
    let next = getNextMonth(isHijri, currentDate);

    // 🔒 Block navigation if allowFutureDates is false
    if (!allowFutureDates && next.isAfter(moment(), 'month')) {
      return;
    }

    // 🔒 Still respect maxDate limit
    if (next.isAfter(effectiveMaxDate, 'month')) {
      return;
    }
    setCurrentDate(next);
  };

  const resetSelection = () => {
    onDateChange({
      calendarDate: '',
      gregorianDate: '',
      hijriDate: '',
      momentObj: null,
    });
    setSelectedDateStr(null);
  };

  const toggleCalendarMode = () => {
    setIsHijri(prev => {
      resetSelection();
      if (prev === true) {
        return false;
      }
      return true;
    });
  };

  const monthYearTitle = getCalendarTitle(currentDate, titleFormat);

  const headerProps: HeaderProps = {
    calendarTitle: monthYearTitle,
    canGoNextMonth,
    canGoPreviousMonth,
    goToNextMonth,
    goToPrevMonth,
    toggleCalendarMode,
	isHijri,
	dateObj: currentDate
  };

  const dayGridProps: DayGridProps = {
    days,
    allowFutureDates,
    fullDateFormat,
    handleSelectDay,
    todaysDate,
    selectedDateStr,
  };

  return (
    <View style={[styles.calendarView, calendarTheme.calendarView]}>
      {/* Calendar Header Section */}
      {renderHeader ? (
        renderHeader(headerProps)
      ) : (
        <CalendarHeader
		{...headerProps}
		headerTheme={{header: calendarTheme.header, headerTextStyle:calendarTheme.headerTextStyle}}
        />
      )}
      {/* Calendar WeekDayName With Days Grid */}
      <MonthView
        {...dayGridProps}
        dayGridTheme={{
          calendarGrid: calendarTheme.calendarGrid,
          dayCell: calendarTheme.dayCell,
          dayNameCell: calendarTheme.dayNameCell,
          dayTextStyle: calendarTheme.dayTextStyle,
          nonCurrentMonthTextStyle: calendarTheme.nonCurrentMonthTextStyle,
          selectedDayStyle: calendarTheme.selectedDayStyle,
          todayCellStyle: calendarTheme.todayCellStyle,
		  todayTextStyle: calendarTheme.todayTextStyle,
		  selectedDayTextStyle: calendarTheme.selectedDayTextStyle
        }}
      />
    </View>
  );
}

function CalendarHeader({
  calendarTitle = '',
  canGoPreviousMonth = false,
  canGoNextMonth = false,
  headerTheme = {},
  goToNextMonth = () => {},
  goToPrevMonth = () => {},
}: HeaderProps) {
  return (
    <View style={[styles.header, headerTheme.header]}>
      {canGoPreviousMonth && (
        <TouchableOpacity style={styles.arrow} onPress={goToPrevMonth}>
          <Text style={[styles.nav,headerTheme.headerTextStyle]}>‹</Text>
        </TouchableOpacity>
      )}
      <View style={[styles.titleWrapper]}>
        <Text style={[styles.monthTitleStyle, headerTheme.headerTextStyle]}>
          {calendarTitle}
        </Text>
      </View>
      {canGoNextMonth && (
        <TouchableOpacity style={styles.arrow} onPress={goToNextMonth}>
          <Text style={[styles.nav,headerTheme.headerTextStyle]}>›</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function WeekDayNames({weekDayTheme = {}}: WeekDayNamesProps) {
  const weekDayNames = useWeekdays();
  return weekDayNames.map((dayName, i) => (
    <Text key={i} style={[styles.dayNameCell, weekDayTheme.dayNameCell]}>
      {dayName}
    </Text>
  ));
}

type MonthViewProps = {} & DayGridProps;
function MonthView(props: MonthViewProps) {
  return (
    <View style={[styles.calendarGrid,props.dayGridTheme?.calendarGrid]}>
      <WeekDayNames
        weekDayTheme={{dayNameCell: props.dayGridTheme?.dayNameCell}}
      />
      <DayGrid {...props} />
    </View>
  );
}

function DayGrid({
  allowFutureDates,
  fullDateFormat,
  selectedDateStr,
  todaysDate,
  dayGridTheme = {},
  days = [],
  handleSelectDay = () => {},
}: DayGridProps) {
  return (
    <>
      {days.map((dayObj, idx) => {
        if (!dayObj) {
          return (
            <View key={idx} style={[styles.dayCell, dayGridTheme.dayCell]} />
          );
        }

        if (!allowFutureDates && dayObj.date.isAfter(moment(), 'day')) {
          return (
            <View key={idx} style={[styles.dayCell, dayGridTheme.dayCell]}>
              <Text
                style={[
                  styles.nonCurrentMonthTextStyle,
                  dayGridTheme.nonCurrentMonthTextStyle,
                ]}>
                {dayObj.label}
              </Text>
            </View>
          );
        }

        const key = dayObj.date.format(fullDateFormat);
        const isSelected = key === selectedDateStr;
        const isToday = dayObj.date.format(fullDateFormat) === todaysDate;

        return (
          <TouchableOpacity
            key={idx}
            style={[
              styles.dayCell,
              dayGridTheme.dayCell,
              isToday && styles.todayCellStyle,
              isToday && dayGridTheme.todayCellStyle,
              isSelected && styles.selectedDayStyle,
              isSelected && dayGridTheme.selectedDayStyle,
            ]}
            onPress={() => handleSelectDay(dayObj)}>
            <Text
              style={[
                styles.dayTextStyle,
                dayGridTheme.dayTextStyle,
				isToday && dayGridTheme.todayTextStyle,
				isSelected && dayGridTheme.selectedDayTextStyle,
                !dayObj.isCurrentMonth && styles.nonCurrentMonthTextStyle,
                !dayObj.isCurrentMonth && dayGridTheme.nonCurrentMonthTextStyle,
              ]}>
              {dayObj.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  calendarView: {
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  arrow: {
    width: 40,
    alignItems: 'center',
  },

  titleWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  nav: {fontSize: 24},
  monthTitleStyle: {fontSize: 18, fontWeight: 'bold'},
  calendarGrid: {flexDirection: 'row', flexWrap: 'wrap'},
  dayNameCell: {
    width: '14.28%',
    textAlign: 'center',
    textAlignVertical: 'center',
    height: 35,
    fontWeight: 'bold',
  },
  dayCell: {
    width: '14.28%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  selectedDayStyle: {backgroundColor: '#f7ede2', borderWidth: 1},
  todayCellStyle: {
    borderWidth: 1,
    borderColor: '#415a77',
    borderStyle: 'dashed',
  },
  dayTextStyle: {color: '#000'},
  nonCurrentMonthTextStyle: {color: '#aaa'},
});
