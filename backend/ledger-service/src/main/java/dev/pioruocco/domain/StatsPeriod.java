package dev.pioruocco.domain;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.Arrays;
import java.util.Optional;

public enum StatsPeriod {
    WEEK("7d", 7, Granularity.DAY),
    MONTH("30d", 30, Granularity.DAY),
    QUARTER("90d", 90, Granularity.WEEK),
    ALL("all", null, Granularity.MONTH);

    private final String param;
    private final Integer days;
    private final Granularity granularity;

    StatsPeriod(String param, Integer days, Granularity granularity) {
        this.param = param;
        this.days = days;
        this.granularity = granularity;
    }

    public static Optional<StatsPeriod> fromParam(String value) {
        return Arrays.stream(values()).filter(p -> p.param.equalsIgnoreCase(value)).findFirst();
    }

    public String getParam() {
        return param;
    }

    // null for ALL: the period starts at the user's first activity
    public Integer getDays() {
        return days;
    }

    public Granularity getGranularity() {
        return granularity;
    }

    public enum Granularity {
        DAY, WEEK, MONTH;

        public LocalDate bucketStart(LocalDate date) {
            return switch (this) {
                case DAY -> date;
                case WEEK -> date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                case MONTH -> date.withDayOfMonth(1);
            };
        }

        public LocalDate next(LocalDate bucketStart) {
            return switch (this) {
                case DAY -> bucketStart.plusDays(1);
                case WEEK -> bucketStart.plusWeeks(1);
                case MONTH -> bucketStart.plusMonths(1);
            };
        }
    }
}
