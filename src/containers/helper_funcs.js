moment = require('moment-timezone');
export function getLiveShow(props) {
  if (!props.schedule) {
    console.log('JG: no schedule!! cant get live show!!');
    return null;
  }
  const weekdays = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  let date = new moment();
  // convert all dates to eastern time
  const currentYear = date.year();
  const currentMonth = date.month();
  const currentDay = date.day();
  const currentDate = date.date();
  const today = weekdays[currentDay];
  const yesterday = weekdays[(currentDay - 1) % 7];
  for (let show of props.schedule) {
    if (show.day != today && show.day != yesterday) {
      continue;
    }

    if (!show.start_time || !show.end_time) {
      continue;
    }

    let show_start_time = show.start_time.split(':');
    let show_end_time = show.end_time.split(':');

    if (
      !show_start_time ||
      show_start_time.length < 2 ||
      !show_end_time ||
      show_end_time.length < 2
    ) {
      return null;
    }

    let offset = 240;
    const start_hour =
      parseInt(show_start_time[0]) + (date.utcOffset() + offset) / 60;
    const start_min =
      parseInt(show_start_time[1]) + (date.utcOffset() + offset) % 60;
    let show_starts = moment(
      new Date(currentYear, currentMonth, currentDate, start_hour, start_min),
    );

    const end_hour =
      parseInt(show_end_time[0]) + (date.utcOffset() + offset) / 60;
    const end_min =
      parseInt(show_end_time[1]) + (date.utcOffset() + offset) % 60;
    let show_ends = moment(
      new Date(currentYear, currentMonth, currentDate, end_hour, end_min),
    );

    if (show.day == today && show_ends < show_starts) {
      show_ends.add(1000 * 60 * 60 * 24);
    } else if (show.day == yesterday) {
      if (show_ends > show_starts) {
        show_ends.add(-1000 * 60 * 60 * 24);
      }
      show_starts.add(-1000 * 60 * 60 * 24);
    }

    if (show_starts <= date && show_ends >= date) {
      console.log('JG: show ', show, ' is now');
      return show;
    }
  }
  return null;
}
