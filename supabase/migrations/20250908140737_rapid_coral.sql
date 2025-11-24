/*
  # Expandir campos do perfil do usuário

  1. Alterações
    - Adiciona campos pessoais: altura, peso, idade, objetivo
    - Adiciona campos de preferências: gostos, motivação, horário preferido
    - Adiciona campos de experiência: tempo de treino, nível de experiência
    - Adiciona campos de metas: meta de peso, meta de treinos por semana

  2. Campos Adicionados
    - height (numeric) - Altura em cm
    - weight (numeric) - Peso atual em kg
    - target_weight (numeric) - Meta de peso em kg
    - age (integer) - Idade
    - goal (text) - Objetivo principal
    - experience_level (text) - Nível de experiência
    - training_time (text) - Há quanto tempo treina
    - preferred_time (text) - Horário preferido para treinar
    - favorite_exercises (text[]) - Exercícios favoritos
    - motivation (text) - O que mais motiva
    - weekly_goal (integer) - Meta de treinos por semana
    - bio (text) - Biografia/descrição pessoal
*/

-- Adicionar novos campos ao perfil
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS height numeric,
ADD COLUMN IF NOT EXISTS weight numeric,
ADD COLUMN IF NOT EXISTS target_weight numeric,
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS goal text,
ADD COLUMN IF NOT EXISTS experience_level text,
ADD COLUMN IF NOT EXISTS training_time text,
ADD COLUMN IF NOT EXISTS preferred_time text,
ADD COLUMN IF NOT EXISTS favorite_exercises text[],
ADD COLUMN IF NOT EXISTS motivation text,
ADD COLUMN IF NOT EXISTS weekly_goal integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS bio text;