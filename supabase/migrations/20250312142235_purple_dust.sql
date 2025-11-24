/*
  # Adicionar tempos de descanso ao perfil

  1. Alterações
    - Adiciona coluna `rest_time_between_sets` para descanso entre séries
    - Adiciona coluna `rest_time_between_exercises` para descanso entre exercícios
    - Remove coluna `rest_time` antiga
    - Define valores padrão
*/

-- Primeiro remover a coluna antiga se existir
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'rest_time'
  ) THEN
    ALTER TABLE profiles DROP COLUMN rest_time;
  END IF;
END $$;

-- Adicionar novas colunas
ALTER TABLE profiles 
ADD COLUMN rest_time_between_sets integer DEFAULT 45,
ADD COLUMN rest_time_between_exercises integer DEFAULT 90;