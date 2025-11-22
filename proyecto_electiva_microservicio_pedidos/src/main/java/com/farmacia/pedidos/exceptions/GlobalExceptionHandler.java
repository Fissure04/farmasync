package com.farmacia.pedidos.exceptions;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(PedidoNotFoundException.class)
	public ResponseEntity<ErrorResponse> handlePedidoNotFound(PedidoNotFoundException ex) {
		ErrorResponse error = new ErrorResponse(HttpStatus.NOT_FOUND.value(), ex.getMessage(), LocalDateTime.now());
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
	}

	@ExceptionHandler(PedidoBusinessException.class)
	public ResponseEntity<ErrorResponse> handleBusinessException(PedidoBusinessException ex) {
		ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), ex.getMessage(), LocalDateTime.now());
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
		String message = ex.getBindingResult().getAllErrors().stream().map(ObjectError::getDefaultMessage)
				.collect(Collectors.joining(", "));

		ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "Errores de validación: " + message,
				LocalDateTime.now());
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
	}
}

class ErrorResponse {
	private int status;
	private String message;
	private LocalDateTime timestamp;

	public ErrorResponse(int status, String message, LocalDateTime timestamp) {
		this.status = status;
		this.message = message;
		this.timestamp = timestamp;
	}

	public int getStatus() {
		return status;
	}

	public void setStatus(int status) {
		this.status = status;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public LocalDateTime getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(LocalDateTime timestamp) {
		this.timestamp = timestamp;
	}

}
