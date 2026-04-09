package br.unifor.healthsys.notificacoes.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("HealthSys – Serviço de Notificações")
                        .description("API de notificações e consumo de eventos Kafka")
                        .version("1.0.0"));
    }
}
