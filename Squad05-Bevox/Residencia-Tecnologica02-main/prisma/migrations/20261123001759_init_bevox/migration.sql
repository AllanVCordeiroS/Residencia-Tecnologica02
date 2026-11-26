-- CreateTable
CREATE TABLE "empresa" (
    "id" UUID NOT NULL,
    "razao_social" VARCHAR(150) NOT NULL,
    "nome_fantasia" VARCHAR(120) NOT NULL,
    "cnpj" CHAR(14) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "telefone" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ATIVA',
    "data_cadastro" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidade" (
    "id" UUID NOT NULL,
    "empresa_id" UUID NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "cnpj" CHAR(14) NOT NULL,
    "endereco" VARCHAR(200) NOT NULL,
    "cidade" VARCHAR(100) NOT NULL,
    "estado" CHAR(2) NOT NULL,
    "telefone" VARCHAR(20),
    "status" VARCHAR(20) NOT NULL DEFAULT 'ATIVA',

    CONSTRAINT "unidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfil_acesso" (
    "id" UUID NOT NULL,
    "empresa_id" UUID NOT NULL,
    "nome" VARCHAR(80) NOT NULL,
    "descricao" VARCHAR(255),

    CONSTRAINT "perfil_acesso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissao" (
    "id" UUID NOT NULL,
    "nome" VARCHAR(80) NOT NULL,
    "descricao" VARCHAR(255),
    "modulo" VARCHAR(60) NOT NULL,

    CONSTRAINT "permissao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfil_permissao" (
    "perfil_acesso_id" UUID NOT NULL,
    "permissao_id" UUID NOT NULL,
    "data_atribuicao" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "perfil_permissao_pkey" PRIMARY KEY ("perfil_acesso_id","permissao_id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" UUID NOT NULL,
    "empresa_id" UUID NOT NULL,
    "perfil_acesso_id" UUID NOT NULL,
    "unidade_principal_id" UUID,
    "nome" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "senha" VARCHAR(255) NOT NULL,
    "telefone" VARCHAR(20),
    "status" VARCHAR(25) NOT NULL DEFAULT 'ATIVO',
    "data_cadastro" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimo_acesso" TIMESTAMPTZ,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_unidade" (
    "usuario_id" UUID NOT NULL,
    "unidade_id" UUID NOT NULL,
    "data_vinculacao" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_unidade_pkey" PRIMARY KEY ("usuario_id","unidade_id")
);

-- CreateTable
CREATE TABLE "tipo_documento" (
    "id" UUID NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "descricao" VARCHAR(255),
    "exige_validade" BOOLEAN NOT NULL DEFAULT true,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ATIVO',

    CONSTRAINT "tipo_documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documento" (
    "id" UUID NOT NULL,
    "unidade_id" UUID NOT NULL,
    "tipo_documento_id" UUID NOT NULL,
    "responsavel_id" UUID,
    "titulo" VARCHAR(180) NOT NULL,
    "descricao" TEXT,
    "data_emissao" DATE NOT NULL,
    "data_validade" DATE,
    "status" VARCHAR(30) NOT NULL DEFAULT 'PENDENTE',
    "data_cadastro" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documento_arquivo" (
    "id" UUID NOT NULL,
    "documento_id" UUID NOT NULL,
    "enviado_por_id" UUID NOT NULL,
    "nome_arquivo" VARCHAR(255) NOT NULL,
    "referencia_armazenamento" TEXT NOT NULL,
    "tipo_arquivo" VARCHAR(100) NOT NULL,
    "tamanho" BIGINT NOT NULL,
    "hash_sha256" CHAR(64),
    "versao" INTEGER NOT NULL DEFAULT 1,
    "versao_atual" BOOLEAN NOT NULL DEFAULT true,
    "data_envio" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documento_arquivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documento_alerta" (
    "id" UUID NOT NULL,
    "documento_id" UUID NOT NULL,
    "descricao" VARCHAR(255) NOT NULL,
    "data_alerta" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'AGENDADO',
    "tipo_alerta" VARCHAR(40) NOT NULL,

    CONSTRAINT "documento_alerta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "licenca" (
    "id" UUID NOT NULL,
    "documento_id" UUID NOT NULL,
    "numero" VARCHAR(80) NOT NULL,
    "orgao_emissor" VARCHAR(150) NOT NULL,
    "categoria_governanca" VARCHAR(120) NOT NULL,
    "responsavel_tecnico" VARCHAR(150) NOT NULL,
    "bloqueio_cautelar" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "licenca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarefa" (
    "id" UUID NOT NULL,
    "unidade_id" UUID NOT NULL,
    "criador_id" UUID NOT NULL,
    "titulo" VARCHAR(100) NOT NULL,
    "descricao" VARCHAR(500) NOT NULL,
    "prioridade" VARCHAR(20) NOT NULL,
    "status" VARCHAR(25) NOT NULL DEFAULT 'A_FAZER',
    "data_criacao" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_inicio" DATE NOT NULL,
    "prazo" DATE NOT NULL,
    "data_conclusao" TIMESTAMPTZ,

    CONSTRAINT "tarefa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarefa_responsavel" (
    "tarefa_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "data_atribuicao" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "principal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tarefa_responsavel_pkey" PRIMARY KEY ("tarefa_id","usuario_id")
);

-- CreateTable
CREATE TABLE "tarefa_subtarefa" (
    "id" UUID NOT NULL,
    "tarefa_id" UUID NOT NULL,
    "titulo" VARCHAR(100) NOT NULL,
    "descricao" VARCHAR(300),
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    "prazo" DATE,

    CONSTRAINT "tarefa_subtarefa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarefa_checklist" (
    "id" UUID NOT NULL,
    "tarefa_id" UUID NOT NULL,
    "concluido_por_id" UUID,
    "descricao" VARCHAR(150) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    "ordem" INTEGER NOT NULL,
    "data_conclusao" TIMESTAMPTZ,

    CONSTRAINT "tarefa_checklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarefa_arquivo" (
    "id" UUID NOT NULL,
    "tarefa_id" UUID NOT NULL,
    "nome_arquivo" VARCHAR(255) NOT NULL,
    "referencia_armazenamento" TEXT NOT NULL,
    "tipo_arquivo" VARCHAR(100) NOT NULL,
    "data_envio" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tarefa_arquivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categoria_financeira" (
    "id" UUID NOT NULL,
    "categoria_pai_id" UUID,
    "nome" VARCHAR(120) NOT NULL,
    "descricao" VARCHAR(255),
    "tipo" VARCHAR(15) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ATIVA',

    CONSTRAINT "categoria_financeira_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "centro_custo" (
    "id" UUID NOT NULL,
    "unidade_id" UUID NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "descricao" VARCHAR(255),
    "status" VARCHAR(20) NOT NULL DEFAULT 'ATIVO',

    CONSTRAINT "centro_custo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lancamento_financeiro" (
    "id" UUID NOT NULL,
    "unidade_id" UUID NOT NULL,
    "categoria_id" UUID NOT NULL,
    "centro_custo_id" UUID,
    "criado_por_id" UUID NOT NULL,
    "descricao" VARCHAR(200) NOT NULL,
    "valor" DECIMAL(14,2) NOT NULL,
    "tipo" VARCHAR(15) NOT NULL,
    "data_vencimento" DATE NOT NULL,
    "data_pagamento" DATE,
    "status" VARCHAR(25) NOT NULL DEFAULT 'PENDENTE',
    "data_criacao" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lancamento_financeiro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracao_financeira" (
    "id" UUID NOT NULL,
    "empresa_id" UUID NOT NULL,
    "moeda_padrao" CHAR(3) NOT NULL DEFAULT 'BRL',
    "configuracoes_vencimento" JSONB NOT NULL,
    "configuracoes_cobranca" JSONB NOT NULL,
    "preferencias_financeiras" JSONB,

    CONSTRAINT "configuracao_financeira_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preferencia_notificacao" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "canal_sistema_ativo" BOOLEAN NOT NULL DEFAULT true,
    "horario_preferencial" TIME,
    "dias_envio" VARCHAR(50),

    CONSTRAINT "preferencia_notificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preferencia_evento" (
    "id" UUID NOT NULL,
    "preferencia_notificacao_id" UUID NOT NULL,
    "tipo_evento" VARCHAR(80) NOT NULL,
    "frequencia" VARCHAR(30) NOT NULL DEFAULT 'IMEDIATO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "preferencia_evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacao" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "titulo" VARCHAR(160) NOT NULL,
    "mensagem" TEXT NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "data_criacao" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status_leitura" BOOLEAN NOT NULL DEFAULT false,
    "lida_em" TIMESTAMPTZ,

    CONSTRAINT "notificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacao_envio" (
    "id" UUID NOT NULL,
    "notificacao_id" UUID NOT NULL,
    "canal" VARCHAR(20) NOT NULL DEFAULT 'SISTEMA',
    "statusEnvio" VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    "tentativa" INTEGER NOT NULL DEFAULT 1,
    "data_tentativa" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mensagem_erro" TEXT,

    CONSTRAINT "notificacao_envio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro_auditoria" (
    "id" UUID NOT NULL,
    "empresa_id" UUID NOT NULL,
    "usuario_id" UUID,
    "unidade_id" UUID,
    "acao_realizada" VARCHAR(50) NOT NULL,
    "entidade_afetada" VARCHAR(80) NOT NULL,
    "registro_afetado_id" VARCHAR(80),
    "descricao" TEXT NOT NULL,
    "data_hora" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dados_anteriores" JSONB,
    "dados_posteriores" JSONB,

    CONSTRAINT "registro_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresa_cnpj_key" ON "empresa"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "unidade_empresa_id_cnpj_key" ON "unidade"("empresa_id", "cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "perfil_acesso_empresa_id_nome_key" ON "perfil_acesso"("empresa_id", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "permissao_modulo_nome_key" ON "permissao"("modulo", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_empresa_id_email_key" ON "usuario"("empresa_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_documento_nome_key" ON "tipo_documento"("nome");

-- CreateIndex
CREATE INDEX "documento_unidade_id_status_idx" ON "documento"("unidade_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "licenca_documento_id_key" ON "licenca"("documento_id");

-- CreateIndex
CREATE INDEX "tarefa_unidade_id_status_idx" ON "tarefa"("unidade_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "centro_custo_unidade_id_codigo_key" ON "centro_custo"("unidade_id", "codigo");

-- CreateIndex
CREATE INDEX "lancamento_financeiro_unidade_id_status_data_vencimento_idx" ON "lancamento_financeiro"("unidade_id", "status", "data_vencimento");

-- CreateIndex
CREATE UNIQUE INDEX "configuracao_financeira_empresa_id_key" ON "configuracao_financeira"("empresa_id");

-- CreateIndex
CREATE UNIQUE INDEX "preferencia_notificacao_usuario_id_key" ON "preferencia_notificacao"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "preferencia_evento_preferencia_notificacao_id_tipo_evento_key" ON "preferencia_evento"("preferencia_notificacao_id", "tipo_evento");

-- CreateIndex
CREATE INDEX "notificacao_usuario_id_data_criacao_idx" ON "notificacao"("usuario_id", "data_criacao");

-- CreateIndex
CREATE INDEX "registro_auditoria_empresa_id_data_hora_idx" ON "registro_auditoria"("empresa_id", "data_hora");

-- AddForeignKey
ALTER TABLE "unidade" ADD CONSTRAINT "unidade_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_acesso" ADD CONSTRAINT "perfil_acesso_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_permissao" ADD CONSTRAINT "perfil_permissao_perfil_acesso_id_fkey" FOREIGN KEY ("perfil_acesso_id") REFERENCES "perfil_acesso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_permissao" ADD CONSTRAINT "perfil_permissao_permissao_id_fkey" FOREIGN KEY ("permissao_id") REFERENCES "permissao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_perfil_acesso_id_fkey" FOREIGN KEY ("perfil_acesso_id") REFERENCES "perfil_acesso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_unidade_principal_id_fkey" FOREIGN KEY ("unidade_principal_id") REFERENCES "unidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_unidade" ADD CONSTRAINT "usuario_unidade_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_unidade" ADD CONSTRAINT "usuario_unidade_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documento" ADD CONSTRAINT "documento_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documento" ADD CONSTRAINT "documento_tipo_documento_id_fkey" FOREIGN KEY ("tipo_documento_id") REFERENCES "tipo_documento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documento" ADD CONSTRAINT "documento_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documento_arquivo" ADD CONSTRAINT "documento_arquivo_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "documento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documento_arquivo" ADD CONSTRAINT "documento_arquivo_enviado_por_id_fkey" FOREIGN KEY ("enviado_por_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documento_alerta" ADD CONSTRAINT "documento_alerta_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "documento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "licenca" ADD CONSTRAINT "licenca_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "documento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefa" ADD CONSTRAINT "tarefa_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefa" ADD CONSTRAINT "tarefa_criador_id_fkey" FOREIGN KEY ("criador_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefa_responsavel" ADD CONSTRAINT "tarefa_responsavel_tarefa_id_fkey" FOREIGN KEY ("tarefa_id") REFERENCES "tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefa_responsavel" ADD CONSTRAINT "tarefa_responsavel_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefa_subtarefa" ADD CONSTRAINT "tarefa_subtarefa_tarefa_id_fkey" FOREIGN KEY ("tarefa_id") REFERENCES "tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefa_checklist" ADD CONSTRAINT "tarefa_checklist_tarefa_id_fkey" FOREIGN KEY ("tarefa_id") REFERENCES "tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefa_checklist" ADD CONSTRAINT "tarefa_checklist_concluido_por_id_fkey" FOREIGN KEY ("concluido_por_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefa_arquivo" ADD CONSTRAINT "tarefa_arquivo_tarefa_id_fkey" FOREIGN KEY ("tarefa_id") REFERENCES "tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categoria_financeira" ADD CONSTRAINT "categoria_financeira_categoria_pai_id_fkey" FOREIGN KEY ("categoria_pai_id") REFERENCES "categoria_financeira"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "centro_custo" ADD CONSTRAINT "centro_custo_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamento_financeiro" ADD CONSTRAINT "lancamento_financeiro_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamento_financeiro" ADD CONSTRAINT "lancamento_financeiro_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categoria_financeira"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamento_financeiro" ADD CONSTRAINT "lancamento_financeiro_centro_custo_id_fkey" FOREIGN KEY ("centro_custo_id") REFERENCES "centro_custo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamento_financeiro" ADD CONSTRAINT "lancamento_financeiro_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracao_financeira" ADD CONSTRAINT "configuracao_financeira_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preferencia_notificacao" ADD CONSTRAINT "preferencia_notificacao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preferencia_evento" ADD CONSTRAINT "preferencia_evento_preferencia_notificacao_id_fkey" FOREIGN KEY ("preferencia_notificacao_id") REFERENCES "preferencia_notificacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacao" ADD CONSTRAINT "notificacao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacao_envio" ADD CONSTRAINT "notificacao_envio_notificacao_id_fkey" FOREIGN KEY ("notificacao_id") REFERENCES "notificacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_auditoria" ADD CONSTRAINT "registro_auditoria_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_auditoria" ADD CONSTRAINT "registro_auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_auditoria" ADD CONSTRAINT "registro_auditoria_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- =========================================================
-- CONSTRAINTS DE DOMÍNIO (CHECK)
-- =========================================================

ALTER TABLE "documento"
  ADD CONSTRAINT "chk_documento_validade"
  CHECK ("data_validade" IS NULL OR "data_validade" > "data_emissao");

ALTER TABLE "documento_arquivo"
  ADD CONSTRAINT "chk_documento_arquivo_tamanho" CHECK ("tamanho" >= 0),
  ADD CONSTRAINT "chk_documento_arquivo_versao" CHECK ("versao" >= 1);

ALTER TABLE "tarefa"
  ADD CONSTRAINT "chk_tarefa_prazo" CHECK ("prazo" >= "data_inicio");

ALTER TABLE "tarefa_checklist"
  ADD CONSTRAINT "chk_checklist_ordem" CHECK ("ordem" >= 1);

ALTER TABLE "lancamento_financeiro"
  ADD CONSTRAINT "chk_lancamento_valor" CHECK ("valor" > 0),
  ADD CONSTRAINT "chk_lancamento_tipo" CHECK ("tipo" IN ('RECEITA', 'DESPESA'));

ALTER TABLE "categoria_financeira"
  ADD CONSTRAINT "chk_categoria_auto_ref" CHECK ("categoria_pai_id" IS NULL OR "categoria_pai_id" <> "id");

ALTER TABLE "notificacao_envio"
  ADD CONSTRAINT "chk_notificacao_tentativa" CHECK ("tentativa" >= 1),
  ADD CONSTRAINT "chk_notificacao_canal" CHECK ("canal" = 'SISTEMA');

-- =========================================================
-- TRIGGERS DE INTEGRIDADE COMPLEXA
-- =========================================================

-- 1. Limite máximo de 2 níveis em CATEGORIA_FINANCEIRA
CREATE OR REPLACE FUNCTION fn_validar_hierarquia_categoria()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.categoria_pai_id IS NOT NULL THEN
    -- Verifica se o pai já é uma subcategoria (possui pai)
    IF EXISTS (
      SELECT 1 FROM "categoria_financeira"
      WHERE "id" = NEW.categoria_pai_id AND "categoria_pai_id" IS NOT NULL
    ) THEN
      RAISE EXCEPTION 'Hierarquia máxima de 2 níveis excedida em categoria_financeira.';
    END IF;

    -- Impede que uma categoria pai com filhas vire subcategoria
    IF TG_OP = 'UPDATE' AND EXISTS (
      SELECT 1 FROM "categoria_financeira" WHERE "categoria_pai_id" = NEW.id
    ) THEN
      RAISE EXCEPTION 'Categoria principal com subcategorias não pode ser rebaixada.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hierarquia_categoria
BEFORE INSERT OR UPDATE ON "categoria_financeira"
FOR EACH ROW EXECUTE FUNCTION fn_validar_hierarquia_categoria();

-- 2. Isolamento Multi-Tenant em USUARIO_UNIDADE (mesma empresa)
CREATE OR REPLACE FUNCTION fn_validar_usuario_unidade_empresa()
RETURNS TRIGGER AS $$
DECLARE
  emp_usuario UUID;
  emp_unidade UUID;
BEGIN
  SELECT "empresa_id" INTO emp_usuario FROM "usuario" WHERE "id" = NEW.usuario_id;
  SELECT "empresa_id" INTO emp_unidade FROM "unidade" WHERE "id" = NEW.unidade_id;

  IF emp_usuario IS DISTINCT FROM emp_unidade THEN
    RAISE EXCEPTION 'Usuário e Unidade devem pertencer à mesma empresa.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuario_unidade_empresa
BEFORE INSERT OR UPDATE ON "usuario_unidade"
FOR EACH ROW EXECUTE FUNCTION fn_validar_usuario_unidade_empresa();

-- 3. Coerência de Unidade em LANCAMENTO_FINANCEIRO <-> CENTRO_CUSTO
CREATE OR REPLACE FUNCTION fn_validar_lancamento_centro_custo()
RETURNS TRIGGER AS $$
DECLARE
  unid_cc UUID;
BEGIN
  IF NEW.centro_custo_id IS NOT NULL THEN
    SELECT "unidade_id" INTO unid_cc FROM "centro_custo" WHERE "id" = NEW.centro_custo_id;
    IF unid_cc IS DISTINCT FROM NEW.unidade_id THEN
      RAISE EXCEPTION 'O centro de custo selecionado não pertence à unidade do lançamento.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lancamento_centro_custo
BEFORE INSERT OR UPDATE ON "lancamento_financeiro"
FOR EACH ROW EXECUTE FUNCTION fn_validar_lancamento_centro_custo();