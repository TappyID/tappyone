-- Verificar se o atendente helio tem fila atribuída
SELECT 
    u.id,
    u.email,
    u.nome,
    u.tipo,
    u.fila_id,
    f.nome as fila_nome
FROM usuarios u
LEFT JOIN filas f ON u.fila_id = f.id
WHERE u.email = 'helio@helio.com.br';

-- Verificar todas as conexões existentes
SELECT 
    id,
    user_id,
    platform,
    status,
    session_name,
    modulation
FROM user_connections
ORDER BY updated_at DESC;

-- Verificar se há conexões com filas na modulation
SELECT 
    id,
    user_id,
    platform,
    status,
    modulation::text
FROM user_connections
WHERE modulation::jsonb ? 'selectedFilas'
ORDER BY updated_at DESC;
