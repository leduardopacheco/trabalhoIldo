# Especificação de Requisitos de Software (SRS)

## HealthSys Distribuído — Plataforma de Gestão Hospitalar

---

| Campo             | Informação                                         |
|-------------------|----------------------------------------------------|
| **Projeto**       | HealthSys Distribuído                              |
| **Disciplina**    | Computação Distribuída                             |
| **Curso**         | Ciência da Computação — UNIFOR                     |
| **Período**       | 7º semestre — 2026.1                               |
| **Equipe**        | Mário Eduardo (2316157) · Luiz Eduardo (2310314) · Gregory Jereissati (2320425) |
| **Versão**        | 1.0                                                |
| **Data**          | Abril / 2026                                       |

---

## Sumário

1. [Introdução](#1-introdução)
2. [Descrição Geral](#2-descrição-geral)
3. [Requisitos Funcionais](#3-requisitos-funcionais)
4. [Requisitos Não Funcionais](#4-requisitos-não-funcionais)
5. [Casos de Uso](#5-casos-de-uso)
6. [Arquitetura do Sistema](#6-arquitetura-do-sistema)
7. [Modelo de Dados](#7-modelo-de-dados)
8. [Restrições e Premissas](#8-restrições-e-premissas)

---

## 1. Introdução

### 1.1 Propósito

Este documento especifica os requisitos de software para o **HealthSys Distribuído**, uma plataforma de gestão hospitalar construída sobre arquitetura de microsserviços. O documento tem como objetivo descrever as funcionalidades, restrições e características do sistema para orientar o desenvolvimento acadêmico ao longo do semestre.

### 1.2 Escopo

O HealthSys Distribuído abrange:

- Autenticação e controle de acesso por perfil de usuário
- Cadastro e gerenciamento de pacientes
- Prontuário eletrônico (consultas, exames, medicamentos)
- Teletriagem com classificação de risco (Protocolo de Manchester)
- Notificações em tempo real via mensageria
- Dashboard hospitalar com métricas operacionais

O sistema **não cobre**: faturamento hospitalar, integração com planos de saúde, prescrição eletrônica homologada por CRM ou telemedicina com vídeo.

### 1.3 Definições e Acrônimos

| Termo       | Definição                                                              |
|-------------|------------------------------------------------------------------------|
| SRS         | Software Requirements Specification                                    |
| RF          | Requisito Funcional                                                    |
| RNF         | Requisito Não Funcional                                                |
| UC          | Use Case (Caso de Uso)                                                 |
| JWT         | JSON Web Token — padrão de autenticação stateless                     |
| API Gateway | Ponto único de entrada que roteia requisições para os microsserviços   |
| Kafka       | Plataforma de mensageria distribuída para comunicação assíncrona       |
| Triagem     | Classificação de urgência do paciente antes do atendimento             |
| Prontuário  | Registro clínico completo do paciente                                  |

### 1.4 Referências

- IEEE Std 830-1998 — Recommended Practice for Software Requirements Specifications
- Spring Boot 3.2 Documentation — https://docs.spring.io/spring-boot
- React 18 Documentation — https://react.dev
- Apache Kafka Documentation — https://kafka.apache.org/documentation
- Protocolo de Manchester (triagem hospitalar)

---

## 2. Descrição Geral

### 2.1 Perspectiva do Produto

O HealthSys Distribuído é um sistema web acessado via browser, composto por microsserviços independentes comunicando-se via HTTP (síncrono) e Apache Kafka (assíncrono). Cada microsserviço possui seu próprio banco de dados lógico no PostgreSQL e pode ser implantado e escalado de forma independente.

```
Navegador
    │
    ▼
Frontend React (porta 3000)
    │
    ▼
API Gateway — Spring Cloud Gateway (porta 8080)
    │
    ├──► servico-usuarios    (8081)  — JWT, RBAC
    ├──► servico-pacientes   (8082)  — CRUD pacientes/vacinas/alergias
    ├──► servico-prontuario  (8083)  — Prontuário eletrônico
    ├──► servico-triagem     (8084)  — Triagem + Kafka producer
    └──► servico-notificacoes(8085)  — Kafka consumer + alertas

Infraestrutura compartilhada:
    PostgreSQL 16 · Kafka + Zookeeper · Redis 7
    Prometheus · Grafana
```

### 2.2 Funções do Produto

| Módulo                  | Função principal                                             |
|-------------------------|--------------------------------------------------------------|
| Autenticação            | Login com JWT, controle de acesso por perfil (RBAC)          |
| Gestão de Usuários      | CRUD de funcionários com perfis diferenciados                |
| Gestão de Pacientes     | Cadastro, busca, vacinas e alergias                          |
| Prontuário Eletrônico   | Histórico clínico, consultas, exames, medicamentos           |
| Teletriagem             | Classificação de risco (Protocolo de Manchester)             |
| Notificações            | Alertas automáticos via eventos Kafka                        |
| Dashboard               | Visão operacional em tempo real da unidade hospitalar        |

### 2.3 Usuários do Sistema

| Perfil               | Descrição                                                    |
|----------------------|--------------------------------------------------------------|
| **ADMIN**            | Gerencia usuários, perfis e configurações do sistema         |
| **ATENDENTE**        | Cadastra pacientes, registra chegadas e abertura de triagem  |
| **PROFISSIONAL_SAUDE** | Realiza triagem, registra consultas, exames e prontuários  |
| **GESTOR**           | Acessa relatórios, dashboard e indicadores hospitalares      |

### 2.4 Restrições Gerais

- O sistema deve operar em ambiente containerizado (Docker)
- Comunicação entre microsserviços ocorre exclusivamente via rede interna Docker
- Dados sensíveis (senhas) devem ser armazenados com hash BCrypt
- Tokens JWT expiram em 24 horas

---

## 3. Requisitos Funcionais

### RF01 — Autenticação de Usuários

**Descrição:** O sistema deve permitir que usuários se autentiquem com e-mail e senha, recebendo um token JWT válido por 24 horas.

**Critérios de aceitação:**
- O endpoint `POST /api/auth/login` retorna `{ "token": "..." }` com HTTP 200
- Credenciais inválidas retornam HTTP 401
- O token contém o e-mail do usuário (`sub`) e suas permissões (`roles`)
- Senhas são armazenadas com BCrypt (nunca em texto claro)
- A resposta nunca inclui o campo `senha`

**Prioridade:** Alta

---

### RF02 — Gerenciamento de Usuários

**Descrição:** Administradores podem cadastrar, listar e desativar usuários do sistema.

**Critérios de aceitação:**
- `POST /api/auth/registro` cria um novo usuário com nome, e-mail, senha e perfil
- `GET /api/usuarios` lista todos os usuários (sem campo senha)
- `DELETE /api/usuarios/{id}` desativa (soft delete) o usuário
- E-mail duplicado retorna HTTP 400 com mensagem descritiva
- Campos obrigatórios ausentes retornam HTTP 400 com detalhes por campo

**Prioridade:** Alta

---

### RF03 — Cadastro de Pacientes

**Descrição:** Atendentes e profissionais podem cadastrar e consultar pacientes.

**Critérios de aceitação:**
- `POST /api/pacientes` cria paciente com nome, data de nascimento e CPF
- `GET /api/pacientes` lista todos os pacientes com paginação implícita
- `GET /api/pacientes?nome=X` filtra por nome (busca parcial, case-insensitive)
- CPF duplicado retorna HTTP 400
- `PUT /api/pacientes/{id}` atualiza dados cadastrais

**Prioridade:** Alta

---

### RF04 — Registro de Vacinas

**Descrição:** O sistema deve permitir o registro do histórico de vacinação associado ao paciente.

**Critérios de aceitação:**
- `POST /api/pacientes/{id}/vacinas` registra uma vacina (nome, data de aplicação, lote)
- `GET /api/pacientes/{id}/vacinas` lista todas as vacinas do paciente
- Tentativa de registrar vacina para paciente inexistente retorna HTTP 404

**Prioridade:** Média

---

### RF05 — Registro de Alergias

**Descrição:** O sistema deve permitir o registro de alergias associadas ao paciente, com tipo e nível de gravidade.

**Critérios de aceitação:**
- `POST /api/pacientes/{id}/alergias` registra alergia com descrição, tipo (MEDICAMENTO, ALIMENTO, AMBIENTAL, OUTRO) e gravidade (LEVE, MODERADA, GRAVE)
- `GET /api/pacientes/{id}/alergias` lista alergias do paciente
- `DELETE /api/pacientes/{id}/alergias/{alergiaId}` remove uma alergia
- A resposta não inclui o objeto paciente completo (evita dados redundantes)

**Prioridade:** Alta

---

### RF06 — Prontuário Eletrônico

**Descrição:** Cada paciente possui um prontuário único, criado automaticamente no primeiro acesso.

**Critérios de aceitação:**
- `POST /api/prontuarios/paciente/{idPaciente}` cria ou retorna o prontuário existente (idempotente)
- `GET /api/prontuarios/{id}/consultas` lista as consultas do prontuário
- `POST /api/prontuarios/{id}/consultas` adiciona consulta com diagnóstico, descrição e conduta
- `GET /api/prontuarios/{id}/exames` lista exames
- `POST /api/prontuarios/{id}/exames` adiciona exame com tipo e resultado

**Prioridade:** Alta

---

### RF07 — Teletriagem com Classificação de Risco

**Descrição:** O sistema implementa o Protocolo de Manchester com 5 níveis de risco.

**Critérios de aceitação:**
- `POST /api/triagens` registra triagem com sintomas, nível de risco e ID do paciente
- Níveis válidos: `VERMELHO` (emergência), `LARANJA` (muito urgente), `AMARELO` (urgente), `VERDE` (pouco urgente), `AZUL` (não urgente)
- `GET /api/triagens/aguardando` retorna fila ordenada por data
- `PATCH /api/triagens/{id}/status` atualiza o status da triagem (AGUARDANDO → EM_ATENDIMENTO → CONCLUIDA)
- Nova triagem publica evento no tópico Kafka `triagem-eventos`

**Prioridade:** Alta

---

### RF08 — Notificações Automáticas

**Descrição:** O serviço de notificações consome eventos Kafka e cria alertas para os profissionais.

**Critérios de aceitação:**
- Ao receber evento `NOVA_TRIAGEM` no tópico `triagem-eventos`, cria notificação com título e nível de risco
- `GET /api/notificacoes/usuario/{id}` lista notificações do usuário
- `GET /api/notificacoes/usuario/{id}/contagem` retorna total de não lidas
- `PATCH /api/notificacoes/{id}/lida` marca notificação como lida

**Prioridade:** Média

---

### RF09 — Dashboard Hospitalar

**Descrição:** A interface web exibe um painel operacional em tempo real.

**Critérios de aceitação:**
- Exibe número de triagens aguardando atendimento
- Exibe número de notificações não lidas
- Lista fila de triagem com badge colorido por nível de risco
- Dados carregados automaticamente ao acessar a página

**Prioridade:** Média

---

### RF10 — Documentação de API (Swagger)

**Descrição:** Todos os microsserviços devem expor documentação interativa da API.

**Critérios de aceitação:**
- Cada serviço expõe `/swagger-ui.html` e `/v3/api-docs`
- O serviço de usuários exige autenticação Bearer no Swagger UI
- A documentação descreve todos os endpoints disponíveis

**Prioridade:** Média

---

## 4. Requisitos Não Funcionais

### RNF01 — Desempenho

- O tempo de resposta para operações CRUD simples deve ser inferior a **500ms** em condições normais de carga
- O sistema deve suportar ao menos **50 requisições simultâneas** sem degradação perceptível

### RNF02 — Segurança

- Todas as senhas devem ser armazenadas com **BCrypt** (custo mínimo 10)
- Tokens JWT devem ser assinados com chave HMAC-SHA384 de ao menos **256 bits**
- Endpoints não-públicos exigem token válido no header `Authorization: Bearer <token>`
- Respostas da API nunca devem expor o campo `senha`

### RNF03 — Disponibilidade

- Cada microsserviço deve expor endpoint `/actuator/health` para verificação de saúde
- O sistema deve reiniciar automaticamente em caso de falha (`restart: unless-stopped` no Docker)
- Banco de dados deve estar disponível antes da inicialização dos serviços (health check no Docker Compose)

### RNF04 — Escalabilidade

- A arquitetura de microsserviços deve permitir escalonamento horizontal independente por serviço
- O uso de Kafka desacopla produtores e consumidores, permitindo escalar cada lado de forma independente

### RNF05 — Manutenibilidade

- Cada microsserviço deve ter ao menos **um teste unitário** cobrindo o service principal
- Exceções devem ser tratadas por `@RestControllerAdvice` retornando respostas JSON estruturadas
- O código deve seguir os padrões de projeto **DTO** para separação entre camada de domínio e API

### RNF06 — Portabilidade

- Todo o sistema deve ser executável com um único comando `docker compose up -d`
- As imagens Docker devem ser compatíveis com **linux/arm64** (Apple Silicon) e **linux/amd64**

### RNF07 — Observabilidade

- Prometheus coleta métricas de todos os microsserviços via `/actuator/prometheus`
- Grafana disponibiliza dashboards visuais na porta 3001
- Logs estruturados via Spring Boot com nível configurável

---

## 5. Casos de Uso

### Atores

| Ator                  | Descrição                                                  |
|-----------------------|------------------------------------------------------------|
| Administrador         | Gerencia usuários e configurações do sistema               |
| Atendente / Recepção  | Cadastra pacientes e registra chegadas                     |
| Profissional de Saúde | Realiza triagem, consultas e registros clínicos            |
| Gestor Hospitalar     | Visualiza relatórios e indicadores de desempenho           |

### UC01 — Autenticar Usuário

- **Ator:** Todos
- **Pré-condição:** Usuário cadastrado no sistema com status ativo
- **Fluxo principal:** Usuário informa e-mail e senha → Sistema valida → Retorna token JWT
- **Fluxo alternativo:** Credenciais inválidas → Sistema retorna erro 401
- **Pós-condição:** Token JWT válido por 24h emitido ao cliente

### UC02 — Gerenciar Usuários

- **Ator:** Administrador
- **Pré-condição:** Autenticado com perfil ADMIN
- **Fluxo principal:** Admin acessa tela de usuários → Lista usuários → Cadastra novo ou desativa existente
- **Fluxo alternativo:** E-mail duplicado → Sistema exibe mensagem de erro
- **Pós-condição:** Usuário criado ou desativado no sistema

### UC03 — Cadastrar Paciente

- **Ator:** Atendente / Profissional de Saúde
- **Pré-condição:** Autenticado no sistema
- **Fluxo principal:** Atendente preenche formulário com dados do paciente → Sistema valida CPF → Salva registro
- **Fluxo alternativo:** CPF já cadastrado → Sistema exibe mensagem de duplicidade
- **Pós-condição:** Paciente registrado e disponível para atendimento

### UC07 — Registrar Alergias e Vacinas

- **Ator:** Profissional de Saúde
- **Pré-condição:** Paciente cadastrado
- **Fluxo principal:** Profissional seleciona paciente → Acessa aba de alergias/vacinas → Registra item com detalhes
- **Pós-condição:** Alergia ou vacina associada ao prontuário do paciente

### UC08 — Realizar Teletriagem

- **Ator:** Profissional de Saúde
- **Pré-condição:** Paciente cadastrado, Kafka disponível
- **Fluxo principal:** Profissional descreve sintomas → Classifica nível de risco → Sistema registra triagem e publica evento Kafka
- **Pós-condição:** Triagem na fila de atendimento, notificação gerada automaticamente

---

## 6. Arquitetura do Sistema

### 6.1 Estilo Arquitetural

O sistema adota **arquitetura de microsserviços** com os seguintes padrões:

| Padrão                | Aplicação no sistema                                        |
|-----------------------|-------------------------------------------------------------|
| API Gateway           | Spring Cloud Gateway centraliza roteamento e autenticação  |
| Database per Service  | Cada serviço usa seu próprio schema no PostgreSQL           |
| Event-Driven          | Triagem publica eventos; Notificações consomem via Kafka    |
| Stateless Auth        | JWT elimina necessidade de sessão no servidor               |
| Health Check          | Actuator expõe `/health` para orquestrador Docker          |

### 6.2 Stack Tecnológica

| Camada          | Tecnologia                              | Versão    |
|-----------------|-----------------------------------------|-----------|
| Frontend        | React + Vite + React Router + Axios     | 18 / 5    |
| API Gateway     | Spring Cloud Gateway                    | 2023.0.0  |
| Backend         | Spring Boot + Spring Data JPA           | 3.2.3     |
| Segurança       | Spring Security + JJWT                  | 0.12.5    |
| Banco de Dados  | PostgreSQL                              | 16        |
| Mensageria      | Apache Kafka (Confluent)                | 7.6.0     |
| Cache           | Redis                                   | 7         |
| Documentação    | SpringDoc OpenAPI (Swagger UI)          | 2.3.0     |
| Containerização | Docker + Docker Compose                 | 24+ / 2+  |
| Monitoramento   | Prometheus + Grafana                    | 2.50 / 10 |

### 6.3 Comunicação entre Serviços

```
Síncrona (HTTP/REST via API Gateway):
  Frontend → Gateway → servico-usuarios
  Frontend → Gateway → servico-pacientes
  Frontend → Gateway → servico-prontuario
  Frontend → Gateway → servico-triagem
  Frontend → Gateway → servico-notificacoes

Assíncrona (Apache Kafka):
  servico-triagem  →  [tópico: triagem-eventos]  →  servico-notificacoes
```

---

## 7. Modelo de Dados

O banco de dados PostgreSQL contém **11 tabelas** organizadas por domínio:

| Tabela          | Domínio              | Descrição                                      |
|-----------------|----------------------|------------------------------------------------|
| `usuarios`      | Autenticação         | Funcionários do hospital com perfil de acesso  |
| `pacientes`     | Pacientes            | Dados cadastrais dos pacientes                 |
| `vacinas`       | Pacientes            | Histórico de vacinação por paciente            |
| `alergias`      | Pacientes            | Alergias registradas por tipo e gravidade      |
| `prontuarios`   | Prontuário           | Prontuário eletrônico (1:1 com paciente)       |
| `consultas`     | Prontuário           | Consultas médicas vinculadas ao prontuário     |
| `exames`        | Prontuário           | Exames laboratoriais e de imagem               |
| `medicamentos`  | Prontuário           | Medicamentos prescritos por consulta           |
| `atendimentos`  | Triagem              | Registro de atendimentos hospitalares          |
| `triagens`      | Triagem              | Triagens com nível de risco (Manchester)       |
| `notificacoes`  | Notificações         | Alertas gerados por eventos do sistema         |

O diagrama ER completo está disponível em `docs/diagrama-er.puml`.

---

## 8. Restrições e Premissas

### 8.1 Restrições Técnicas

- O sistema requer Docker e Docker Compose instalados na máquina host
- A porta 5432 (PostgreSQL), 9092 (Kafka), 6379 (Redis) e 8080–8085 (serviços) devem estar livres
- Imagens Docker utilizadas são compatíveis com arquitetura ARM64 (Apple Silicon) via variante `-jammy`

### 8.2 Restrições Acadêmicas

- O projeto é desenvolvido em 4 etapas de 2 semanas cada (8 semanas totais)
- O código deve ser versionado em repositório Git com histórico de commits
- Cada serviço deve ter ao menos um teste unitário demonstrável

### 8.3 Premissas

- Os microsserviços se comunicam pela rede interna Docker (`healthsys-network`) e não estão expostos diretamente à internet
- O banco de dados é compartilhado fisicamente mas isolado logicamente por tabela/schema
- O sistema é destinado a uso interno hospitalar, sem requisitos de conformidade com LGPD/HIPAA neste escopo acadêmico

### 8.4 Dependências Externas

| Dependência        | Criticidade | Observação                                           |
|--------------------|-------------|------------------------------------------------------|
| Docker Hub         | Alta        | Necessário para baixar imagens na primeira execução  |
| Maven Central      | Alta        | Necessário para build das dependências Java          |
| npm registry       | Média       | Necessário para build do frontend                    |

---

*Documento gerado pela equipe HealthSys — UNIFOR, Computação Distribuída, 2026.1*
