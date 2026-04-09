package br.unifor.healthsys.triagem.config;

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
                        .title("HealthSys – Serviço de Triagem")
                        .description("API de triagem de Manchester e gestão de atendimentos")
                        .version("1.0.0"));
    }
}
