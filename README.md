# HealthSys Distribuído

Plataforma de Gestão Hospitalar Distribuída desenvolvida para a disciplina de **Computação Distribuída** – UNIFOR, 7º período.

**Equipe:** Mário Eduardo (2316157) · Luiz Eduardo (2310314) · Gregory Jereissati (2320425)

---

## Arquitetura

```
Usuário → Navegador → Frontend React → API Gateway (8080)
                                            ├── servico-usuarios    (8081)
                                            ├── servico-pacientes   (8082)
                                            ├── servico-prontuario  (8083)
                                            ├── servico-triagem     (8084)
                                            └── servico-notificacoes(8085)

Infraestrutura:
  PostgreSQL · Kafka · Redis · Prometheus · Grafana · ELK Stack
```

---

## Pré-requisitos

| Ferramenta   | Versão mínima |
|--------------|---------------|
| Docker       | 24+           |
| Docker Compose | 2.20+       |
| Java         | 17+           |
| Node.js      | 20+           |
| Maven        | 3.9+          |

---

## Como executar

### 1. Clonar o repositório

```bash
git clone https://github.com/healthsys/healthsys-distribuido.git
cd healthsys-distribuido
```

### 2. Subir toda a infraestrutura com Docker Compose

```bash
docker-compose up -d
```

### 3. Acessar o sistema

| Serviço       | URL                        |
|---------------|----------------------------|
| Frontend      | http://localhost:3000      |
| API Gateway   | http://localhost:8080      |
| Prometheus    | http://localhost:9090      |
| Grafana       | http://localhost:3001      |

### 4. Executar serviços individualmente (desenvolvimento)

```bash
# Backend - qualquer serviço
cd servico-pacientes
mvn spring-boot:run

# Frontend
cd frontend
npm install
npm run dev
```

---

## Estrutura do Projeto

```
healthsys-distribuido/
├── api-gateway/            # Spring Cloud Gateway – roteamento
├── servico-usuarios/       # Autenticação JWT e gestão de usuários
├── servico-pacientes/      # Cadastro de pacientes e vacinas
├── servico-prontuario/     # Prontuário eletrônico, consultas e exames
├── servico-triagem/        # Teletriagem e classificação de risco
├── servico-notificacoes/   # Alertas e notificações via Kafka
├── frontend/               # Interface React
└── docs/
    ├── SRS.md                   # Especificação de Requisitos de Software
    ├── schema.sql               # Schema do banco de dados PostgreSQL
    ├── diagrama-casos-uso.puml  # Diagrama de casos de uso (PlantUML)
    ├── diagrama-er.puml         # Diagrama ER (PlantUML)
    └── prometheus.yml           # Configuração do Prometheus
```

---

## Endpoints principais

| Serviço          | Endpoint base            |
|------------------|--------------------------|
| Autenticação     | POST /api/auth/login     |
| Usuários         | /api/usuarios            |
| Pacientes        | /api/pacientes           |
| Vacinas          | /api/pacientes/{id}/vacinas |
| Prontuários      | /api/prontuarios         |
| Triagens         | /api/triagens            |
| Notificações     | /api/notificacoes        |

---

## Cronograma

| Semanas | Etapa                              | Status  |
|---------|------------------------------------|---------|
| 1–2     | Planejamento e Arquitetura         | ✅ Concluído |
| 3–4     | Desenvolvimento dos Serviços Básicos | ✅ Concluído |
| 5–6     | Integração Distribuída             | ⏳ Pendente |
| 7–8     | Deploy, Monitoramento e Avaliação  | ⏳ Pendente |

---

## Tecnologias

- **Backend:** Java 17, Spring Boot 3.2, Spring Cloud Gateway
- **Frontend:** React 18, Vite, Axios
- **Banco de dados:** PostgreSQL 16
- **Mensageria:** Apache Kafka
- **Cache:** Redis
- **Containerização:** Docker, Docker Compose
- **Monitoramento:** Prometheus, Grafana
- **Segurança:** JWT (JSON Web Token)
