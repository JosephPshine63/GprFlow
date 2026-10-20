package dev.pioruocco.response;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
public class StatsPoint {

    // first day of the bucket (day, ISO week starting Monday, or month)
    private LocalDate date;

    private BigDecimal buyVolume = BigDecimal.ZERO;
    private BigDecimal sellVolume = BigDecimal.ZERO;
    private BigDecimal realizedPnl = BigDecimal.ZERO;
    private BigDecimal deposits = BigDecimal.ZERO;
    private BigDecimal withdrawals = BigDecimal.ZERO;
    private BigDecimal transfersOut = BigDecimal.ZERO;

    public StatsPoint(LocalDate date) {
        this.date = date;
    }
}
