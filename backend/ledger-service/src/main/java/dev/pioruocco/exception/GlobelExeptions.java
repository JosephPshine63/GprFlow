package dev.pioruocco.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;

@ControllerAdvice
public class GlobelExeptions {

    private static final Logger log = LoggerFactory.getLogger(GlobelExeptions.class);

    @ExceptionHandler(WalletException.class)
    public ResponseEntity<ErrorDetails> walletExceptionHandler(WalletException we, WebRequest req) {
        ErrorDetails error = new ErrorDetails(we.getMessage(), req.getDescription(false), LocalDateTime.now());
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    // Two concurrent requests hitting the same @Version-ed row (wallet, order, ...) —
    // the loser must not silently overwrite the winner's update. Surface it as a
    // retryable conflict instead of letting it fall through to the 500 handler below.
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ErrorDetails> optimisticLockingHandler(ObjectOptimisticLockingFailureException ex, WebRequest req) {
        ErrorDetails error = new ErrorDetails("This resource was updated concurrently, please retry",
                req.getDescription(false), LocalDateTime.now());
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorDetails> handleRuntimeException(RuntimeException ex, WebRequest request) {
        log.error("RuntimeException on {}: {}", request.getDescription(false), ex.getMessage(), ex);
        ErrorDetails error = new ErrorDetails("An unexpected error occurred",
                request.getDescription(false), LocalDateTime.now());
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorDetails> handleOtherExceptions(Exception ex, WebRequest request) {
        log.error("Unhandled exception on {}: {}", request.getDescription(false), ex.getMessage(), ex);
        ErrorDetails error = new ErrorDetails("An unexpected error occurred",
                request.getDescription(false), LocalDateTime.now());
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

}
