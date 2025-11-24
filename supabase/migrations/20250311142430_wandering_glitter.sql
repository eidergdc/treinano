/*
  # Adicionar tempo de descanso aos perfis

  1. Alterações
    - Adiciona coluna `rest_time` na tabela `profiles` para armazenar o tempo de descanso em segundos
    - Valor padrão de 60 segundos (1 minuto)
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'rest_time'
  ) THEN
    ALTER TABLE profiles ADD COLUMN rest_time integer DEFAULT 60;
  END IF;
END $$;