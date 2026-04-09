-- ============================================================
-- HealthSys Distribuído – Schema PostgreSQL
-- UNIFOR – Computação Distribuída – 2026
-- ============================================================

-- ─── Usuários ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
    id          BIGSERIAL    PRIMARY KEY,
    nome        VARCHAR(100) NOT NULL,
    perfil      VARCHAR(50)  NOT NULL CHECK (perfil IN ('ADMIN','PROFISSIONAL_SAUDE','ATENDENTE','GESTOR')),
    email       VARCHAR(150) NOT NULL UNIQUE,
    senha       VARCHAR(255) NOT NULL,
    ativo       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ─── Pacientes ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pacientes (
    id                BIGSERIAL    PRIMARY KEY,
    nome              VARCHAR(100) NOT NULL,
    data_nascimento   DATE         NOT NULL,
    sexo              VARCHAR(20)  CHECK (sexo IN ('MASCULINO','FEMININO','OUTRO')),
    telefone          VARCHAR(20),
    cpf               VARCHAR(14)  UNIQUE,
    email             VARCHAR(150),
    endereco          VARCHAR(255),
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ─── Vacinas ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vacinas (
    id              BIGSERIAL    PRIMARY KEY,
    id_paciente     BIGINT       NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    nome_vacina     VARCHAR(100) NOT NULL,
    data_aplicacao  DATE         NOT NULL,
    lote            VARCHAR(50),
    observacoes     TEXT
);

-- ─── Prontuários ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prontuarios (
    id                   BIGSERIAL PRIMARY KEY,
    id_paciente          BIGINT    NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    data_criacao         TIMESTAMP NOT NULL DEFAULT NOW(),
    historico_clinico    TEXT,
    observacoes_gerais   TEXT,
    updated_at           TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (id_paciente)
);

-- ─── Atendimentos ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS atendimentos (
    id               BIGSERIAL    PRIMARY KEY,
    id_paciente      BIGINT       NOT NULL REFERENCES pacientes(id),
    id_prontuario    BIGINT       REFERENCES prontuarios(id),
    id_usuario       BIGINT       NOT NULL REFERENCES usuarios(id),
    tipo_atendimento VARCHAR(50)  NOT NULL CHECK (tipo_atendimento IN ('CONSULTA','EMERGENCIA','RETORNO','TELETRIAGEM')),
    data             TIMESTAMP    NOT NULL DEFAULT NOW(),
    observacoes      TEXT,
    status           VARCHAR(20)  NOT NULL DEFAULT 'ABERTO' CHECK (status IN ('ABERTO','EM_ANDAMENTO','ENCERRADO'))
);

-- ─── Triagens ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS triagens (
    id              BIGSERIAL    PRIMARY KEY,
    id_paciente     BIGINT       NOT NULL REFERENCES pacientes(id),
    id_usuario      BIGINT       NOT NULL REFERENCES usuarios(id),
    id_atendimento  BIGINT       REFERENCES atendimentos(id),
    sintomas        TEXT         NOT NULL,
    nivel_risco     VARCHAR(20)  NOT NULL CHECK (nivel_risco IN ('VERMELHO','LARANJA','AMARELO','VERDE','AZUL')),
    status          VARCHAR(20)  NOT NULL DEFAULT 'AGUARDANDO' CHECK (status IN ('AGUARDANDO','EM_ATENDIMENTO','CONCLUIDA')),
    data_triagem    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ─── Consultas ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS consultas (
    id              BIGSERIAL  PRIMARY KEY,
    id_prontuario   BIGINT     NOT NULL REFERENCES prontuarios(id) ON DELETE CASCADE,
    id_usuario      BIGINT     NOT NULL REFERENCES usuarios(id),
    data_consulta   TIMESTAMP  NOT NULL DEFAULT NOW(),
    descricao       TEXT,
    conduta         TEXT,
    diagnostico     VARCHAR(255)
);

-- ─── Exames ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exames (
    id              BIGSERIAL    PRIMARY KEY,
    id_prontuario   BIGINT       NOT NULL REFERENCES prontuarios(id) ON DELETE CASCADE,
    tipo_exame      VARCHAR(100) NOT NULL,
    data_exame      TIMESTAMP    NOT NULL DEFAULT NOW(),
    resultado       TEXT,
    arquivo_url     VARCHAR(500)
);

-- ─── Medicamentos ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS medicamentos (
    id          BIGSERIAL    PRIMARY KEY,
    id_consulta BIGINT       NOT NULL REFERENCES consultas(id) ON DELETE CASCADE,
    nome        VARCHAR(100) NOT NULL,
    dosagem     VARCHAR(50),
    frequencia  VARCHAR(50),
    duracao     VARCHAR(50),
    observacoes TEXT
);

-- ─── Alergias ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alergias (
    id              BIGSERIAL    PRIMARY KEY,
    id_paciente     BIGINT       NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    descricao       VARCHAR(200) NOT NULL,
    tipo            VARCHAR(50)  NOT NULL DEFAULT 'MEDICAMENTO' CHECK (tipo IN ('MEDICAMENTO','ALIMENTO','AMBIENTAL','OUTRO')),
    gravidade       VARCHAR(20)  NOT NULL DEFAULT 'MODERADA' CHECK (gravidade IN ('LEVE','MODERADA','GRAVE')),
    observacoes     TEXT,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ─── Notificações ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notificacoes (
    id          BIGSERIAL    PRIMARY KEY,
    id_usuario  BIGINT       NOT NULL REFERENCES usuarios(id),
    titulo      VARCHAR(200) NOT NULL,
    mensagem    TEXT,
    tipo        VARCHAR(50)  DEFAULT 'GERAL' CHECK (tipo IN ('GERAL','TRIAGEM','CONSULTA','ALERTA')),
    data_envio  TIMESTAMP    NOT NULL DEFAULT NOW(),
    lida        BOOLEAN      NOT NULL DEFAULT FALSE,
    status      VARCHAR(20)  NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE','ENVIADA','LIDA'))
);

-- ─── Índices ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pacientes_cpf          ON pacientes(cpf);
CREATE INDEX IF NOT EXISTS idx_atendimentos_paciente   ON atendimentos(id_paciente);
CREATE INDEX IF NOT EXISTS idx_triagens_paciente       ON triagens(id_paciente);
CREATE INDEX IF NOT EXISTS idx_triagens_nivel_risco    ON triagens(nivel_risco);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario    ON notificacoes(id_usuario);
CREATE INDEX IF NOT EXISTS idx_consultas_prontuario    ON consultas(id_prontuario);
CREATE INDEX IF NOT EXISTS idx_exames_prontuario       ON exames(id_prontuario);
CREATE INDEX IF NOT EXISTS idx_alergias_paciente       ON alergias(id_paciente);
