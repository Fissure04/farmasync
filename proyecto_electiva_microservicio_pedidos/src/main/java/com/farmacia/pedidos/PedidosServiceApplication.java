package com.farmacia.pedidos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@ComponentScan(basePackages = { "com.farmacia.pedidos", "controller", "dto", "entity", "exceptions", "mapper",
		"service", "repository" })
@EntityScan(basePackages = "entity")
@EnableJpaRepositories(basePackages = "repository")
@EnableTransactionManagement
public class PedidosServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(PedidosServiceApplication.class, args);

	}
}