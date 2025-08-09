-- ============================================================================
-- SQL скрипт для проверки Row Level Security (RLS) политик
-- Проверяет все таблицы и их политики безопасности
-- ============================================================================

-- 1. ПРОВЕРКА ВКЛЮЧЕНИЯ RLS ДЛЯ ВСЕХ ТАБЛИЦ
-- ============================================================================
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS включен'
        ELSE '❌ RLS отключен'
    END as status
FROM pg_tables 
WHERE tablename IN (
    'user_profiles', 
    'subscriptions', 
    'payments', 
    'export_history', 
    'usage_quotas',
    'paypal_webhooks'
)
ORDER BY tablename;

-- 2. ПРОВЕРКА СУЩЕСТВУЮЩИХ ПОЛИТИК RLS
-- ============================================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN (
    'user_profiles', 
    'subscriptions', 
    'payments', 
    'export_history', 
    'usage_quotas',
    'paypal_webhooks'
)
ORDER BY tablename, policyname;

-- 3. ДЕТАЛЬНАЯ ПРОВЕРКА ПОЛИТИК ПО ТАБЛИЦАМ
-- ============================================================================

-- Проверка политик для user_profiles
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as policies_count,
    STRING_AGG(policyname, ', ') as policy_names
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Проверка политик для subscriptions
SELECT 
    'subscriptions' as table_name,
    COUNT(*) as policies_count,
    STRING_AGG(policyname, ', ') as policy_names
FROM pg_policies 
WHERE tablename = 'subscriptions';

-- Проверка политик для payments
SELECT 
    'payments' as table_name,
    COUNT(*) as policies_count,
    STRING_AGG(policyname, ', ') as policy_names
FROM pg_policies 
WHERE tablename = 'payments';

-- Проверка политик для export_history
SELECT 
    'export_history' as table_name,
    COUNT(*) as policies_count,
    STRING_AGG(policyname, ', ') as policy_names
FROM pg_policies 
WHERE tablename = 'export_history';

-- Проверка политик для usage_quotas
SELECT 
    'usage_quotas' as table_name,
    COUNT(*) as policies_count,
    STRING_AGG(policyname, ', ') as policy_names
FROM pg_policies 
WHERE tablename = 'usage_quotas';

-- Проверка политик для paypal_webhooks
SELECT 
    'paypal_webhooks' as table_name,
    COUNT(*) as policies_count,
    STRING_AGG(policyname, ', ') as policy_names
FROM pg_policies 
WHERE tablename = 'paypal_webhooks';

-- 4. СОЗДАНИЕ НЕДОСТАЮЩИХ ПОЛИТИК
-- ============================================================================

-- Политики для payments (если отсутствуют)
DO $$
BEGIN
    -- Проверяем существование политики для payments
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'payments' 
        AND policyname = 'Users can view payments for their subscriptions'
    ) THEN
        CREATE POLICY "Users can view payments for their subscriptions" ON payments
        FOR SELECT USING (
            subscription_id IN (
                SELECT id FROM subscriptions WHERE user_id = auth.uid()
            )
        );
    END IF;
    
    -- Политика для service_role доступа к payments
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'payments' 
        AND policyname = 'Service role can manage payments'
    ) THEN
        CREATE POLICY "Service role can manage payments" ON payments
        USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Политики для usage_quotas (если отсутствуют)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'usage_quotas' 
        AND policyname = 'Users can update their own usage quotas'
    ) THEN
        CREATE POLICY "Users can update their own usage quotas" ON usage_quotas
        FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'usage_quotas' 
        AND policyname = 'Users can insert their own usage quotas'
    ) THEN
        CREATE POLICY "Users can insert their own usage quotas" ON usage_quotas
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    -- Service role доступ для usage_quotas
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'usage_quotas' 
        AND policyname = 'Service role can manage usage quotas'
    ) THEN
        CREATE POLICY "Service role can manage usage quotas" ON usage_quotas
        USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Политики для subscriptions (дополнительные)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subscriptions' 
        AND policyname = 'Service role can manage subscriptions'
    ) THEN
        CREATE POLICY "Service role can manage subscriptions" ON subscriptions
        USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Убедимся что RLS включен для paypal_webhooks
ALTER TABLE paypal_webhooks ENABLE ROW LEVEL SECURITY;

-- Политика для paypal_webhooks (если отсутствует)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'paypal_webhooks' 
        AND policyname = 'Service role can access paypal webhooks'
    ) THEN
        CREATE POLICY "Service role can access paypal webhooks" ON paypal_webhooks
        USING (auth.role() = 'service_role');
    END IF;
END $$;

-- 5. ФИНАЛЬНАЯ ПРОВЕРКА ПОСЛЕ СОЗДАНИЯ ПОЛИТИК
-- ============================================================================
SELECT 
    'ФИНАЛЬНАЯ ПРОВЕРКА RLS ПОЛИТИК' as check_type,
    '' as details;

SELECT 
    t.table_name,
    CASE WHEN t.rls_enabled THEN '✅' ELSE '❌' END as rls_status,
    COALESCE(p.policies_count, 0) as policies_count,
    CASE 
        WHEN t.rls_enabled AND COALESCE(p.policies_count, 0) > 0 THEN '✅ Настроено корректно'
        WHEN t.rls_enabled AND COALESCE(p.policies_count, 0) = 0 THEN '⚠️ RLS включен, но нет политик'
        WHEN NOT t.rls_enabled THEN '❌ RLS отключен'
        ELSE '❓ Неизвестное состояние'
    END as overall_status
FROM (
    SELECT 
        tablename as table_name,
        rowsecurity as rls_enabled
    FROM pg_tables 
    WHERE tablename IN (
        'user_profiles', 'subscriptions', 'payments', 
        'export_history', 'usage_quotas', 'paypal_webhooks'
    )
) t
LEFT JOIN (
    SELECT 
        tablename as table_name,
        COUNT(*) as policies_count
    FROM pg_policies 
    WHERE tablename IN (
        'user_profiles', 'subscriptions', 'payments', 
        'export_history', 'usage_quotas', 'paypal_webhooks'
    )
    GROUP BY tablename
) p ON t.table_name = p.table_name
ORDER BY t.table_name;

-- 6. ПРОВЕРКА ФУНКЦИЙ И ТРИГГЕРОВ
-- ============================================================================
SELECT 
    'ПРОВЕРКА ФУНКЦИЙ И ТРИГГЕРОВ' as check_type,
    '' as details;

-- Проверка существования функций
SELECT 
    routine_name,
    routine_type,
    CASE 
        WHEN routine_name IS NOT NULL THEN '✅ Существует'
        ELSE '❌ Отсутствует'
    END as status
FROM information_schema.routines 
WHERE routine_name IN ('handle_new_user', 'update_updated_at_column')
AND routine_schema = 'public';

-- Проверка триггеров
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    '✅ Активен' as status
FROM information_schema.triggers 
WHERE trigger_name LIKE '%updated_at%' 
OR trigger_name LIKE '%new_user%'
ORDER BY event_object_table, trigger_name;