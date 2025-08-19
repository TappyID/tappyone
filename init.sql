-- Inicialização do banco de dados TappyOne CRM

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Função para gerar UUID v4
CREATE OR REPLACE FUNCTION gen_random_uuid() RETURNS uuid AS $$
BEGIN
    RETURN uuid_generate_v4();
END;
$$ LANGUAGE plpgsql;

-- Criar usuário admin padrão (senha: admin123)s
-- Hash gerado com bcrypt para 'admin123'
INSERT INTO usuarios (id, email, nome, tipo, ativo, senha, criado_em, atualizado_em) 
VALUES (
    gen_random_uuid(),
    'admin@tappyone.com',
    'Administrador',
    'ADMIN',
    true,
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX IF NOT EXISTS idx_contatos_numero ON contatos(numero_telefone);
CREATE INDEX IF NOT EXISTS idx_conversas_sessao ON conversas(sessao_whatsapp_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_conversa ON mensagens(conversa_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_timestamp ON mensagens(timestamp);
CREATE INDEX IF NOT EXISTS idx_atendimentos_status ON atendimentos(status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_inicio ON agendamentos(inicio_em);
CREATE INDEX IF NOT EXISTS idx_cobrancas_vencimento ON cobrancas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_cobrancas_status ON cobrancas(status);
