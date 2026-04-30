package org.fiuba.guitapp.exception;

import lombok.Getter;

@Getter
public class RateLimitException extends RuntimeException {

    private final ErrorCode errorCode;

    public RateLimitException() {
        super("Too many requests. Please try again later.");
        this.errorCode = ErrorCode.RATE_LIMIT_EXCEEDED;
    }

}
