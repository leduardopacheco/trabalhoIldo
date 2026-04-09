package br.unifor.healthsys.prontuario.config;

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
                        .title("HealthSys – Serviço de Prontuário")
                        .description("API de prontuário eletrônico, consultas e exames")
                        .version("1.0.0"));
    }
}
