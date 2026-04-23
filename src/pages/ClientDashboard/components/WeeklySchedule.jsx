import React, { useState, useCallback, useEffect } from "react";
import useGetFromAPI from "@/hooks/useGetFromAPI";

const WeeklySchedule = () => {
  const daysOfTheWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const resolvedUserId = localStorage.getItem("userId");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weeklyScheduleURI, setWeeklyScheduleURI] = useState(null);
  const [selectedDateWorkouts, setSelectedDateWorkouts] = useState(null);

  const compareDateToSelectedDate = useCallback(
    (date) => {
      if (date.toDateString() === selectedDate.toDateString()) {
        return true;
      }
    },
    [selectedDate]
  );
  const getStartDateOfWeek = useCallback((date) => {
    const theDate = new Date(date);
    const dayOfWeek = theDate.getDay();
    const diff = theDate.getDate() - dayOfWeek;
    return new Date(theDate.setDate(diff));
  }, []);

  const [currentWeekStart, setCurrentWeekStart] = useState(
    getStartDateOfWeek(new Date())
  );

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(currentWeekStart);
    const next = nextDate.getDate() + i;
    weekDates.push(new Date(nextDate.setDate(next)));
  }

  const {
    data: weeklyScheduleData,
    loading: weeklyScheduleLoading,
    error: weeklyScheduleError,
  } = useGetFromAPI(weeklyScheduleURI, null);

  useEffect(() => {
    if (!resolvedUserId) {
      console.log("no userID for schedule");
      return;
    }
    setWeeklyScheduleURI(`/workouts/my_schedule?user_id=${resolvedUserId}`);
  }, [resolvedUserId]);

  useEffect(() => {
    if (!weeklyScheduleData || !weeklyScheduleData.my_schedule) {
      return;
    }
    setSelectedDateWorkouts(
      weeklyScheduleData.my_schedule.filter(
        (scheduledWorkout) =>
          scheduledWorkout.weekday === daysOfTheWeek[selectedDate.getDay()]
      )
    );
    console.log(weeklyScheduleData);
  }, [weeklyScheduleData, selectedDate]);

  return (
    <div
      className="bg-card flex h-[calc(80vh-1rem)] max-w-2xl flex-col gap-4
        rounded-xl p-4"
    >
      <div className="flex justify-between gap-4 px-1 py-4">
        {weekDates.map((date, index) => {
          // We can extract the day name and number here later
          return (
            <div
              key={index}
              className={`flex w-full cursor-pointer flex-col items-center
              justify-center rounded-lg p-3 transition-all duration-200 ${
                compareDateToSelectedDate(date)
                  ? "ring-border bg-primary text-primary-foreground ring-2"
                  : "bg-primary/20 text-foreground hover:bg-primary/40"
              }`}
              onClick={() => {
                setSelectedDate(date);
              }}
            >
              <div className="mb-1 text-xs">
                {date.toDateString().slice(0, 3).toUpperCase()}
              </div>
              <div className="mb-1 text-xs">{date.getDate()}</div>
            </div>
          );
        })}
      </div>
      <div
        className={`flex justify-center overflow-y-auto ${
          selectedDateWorkouts?.length === 0 ||
          weeklyScheduleError ||
          weeklyScheduleLoading
            ? " flex-1 items-center"
            : "no-scrollbar flex-col gap-4"
          }`}
      >
        {weeklyScheduleError && <p>error: {weeklyScheduleError}</p>}

        {!weeklyScheduleError && weeklyScheduleLoading && (
          <p>Loading Schedule</p>
        )}
        {!weeklyScheduleError &&
          !weeklyScheduleLoading &&
          weeklyScheduleData &&
          selectedDateWorkouts?.length === 0 && (
            <div>No Workouts Planned for Today</div>
          )}
        {!weeklyScheduleError &&
          !weeklyScheduleLoading &&
          weeklyScheduleData &&
          selectedDateWorkouts?.length > 0 &&
          selectedDateWorkouts.map((selectedWorkout, key) => {
            return (
              <div
                key={key}
                className="bg-secondary/50 hover:bg-secondary flex items-center
                  justify-between rounded-xl p-4 transition-all duration-200"
              >
                {console.log(selectedDateWorkouts)}
                <div className="flex items-center gap-6">
                  <div className="text-muted-foreground text-sm font-medium">
                    {selectedWorkout.schedule_time?.substring(0, 5)}
                  </div>
                  <div className="text-foreground text-lg font-semibold">
                    {selectedWorkout.title.toUpperCase()}
                  </div>
                </div>
                <div
                  className="bg-primary text-primary-foreground flex
                    items-center rounded-full px-3 py-1 text-sm font-medium"
                >
                  {`${selectedWorkout.duration_min} min`}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default WeeklySchedule;
