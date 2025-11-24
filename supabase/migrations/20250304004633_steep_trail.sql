/*
  # Esquema inicial para aplicativo de academia

  1. Novas Tabelas
    - `user_profiles` - Perfis de usuários com estatísticas
    - `exercises` - Exercícios disponíveis
    - `user_exercises` - Exercícios dos usuários com progresso
    - `workout_history` - Histórico de treinos
    - `achievements` - Conquistas disponíveis
    - `user_achievements` - Conquistas desbloqueadas pelos usuários
    - `challenges` - Desafios disponíveis
    - `user_challenges` - Progresso dos usuários nos desafios
  
  2. Security
    - Habilitar RLS em todas as tabelas
    - Políticas para acesso seguro aos dados
*/

-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text,
  avatar_url text,
  level integer DEFAULT 1,
  experience integer DEFAULT 0,
  total_workouts integer DEFAULT 0,
  total_exercises integer DEFAULT 0,
  total_weight_lifted numeric DEFAULT 0,
  streak_days integer DEFAULT 0,
  last_workout_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de exercícios
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  image_url text,
  video_url text,
  is_custom boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Tabela de exercícios do usuário
CREATE TABLE IF NOT EXISTS user_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  exercise_id uuid REFERENCES exercises(id) NOT NULL,
  current_weight numeric DEFAULT 0,
  starting_weight numeric DEFAULT 0,
  current_sets integer DEFAULT 3,
  current_reps integer DEFAULT 8,
  progress_level integer DEFAULT 0, -- 0 = 3x8, 1 = 3x10, 2 = 3x12
  completed_workouts integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

-- Tabela de histórico de treinos
CREATE TABLE IF NOT EXISTS workout_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  duration integer, -- em segundos
  exercises jsonb,
  created_at timestamptz DEFAULT now()
);

-- Tabela de conquistas
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon_name text NOT NULL,
  category text NOT NULL,
  requirement_type text NOT NULL, -- 'workouts', 'exercises', 'weight', 'streak', etc.
  requirement_value integer NOT NULL,
  experience_reward integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela de conquistas do usuário
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  achievement_id uuid REFERENCES achievements(id) NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Tabela de desafios
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon_name text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL,
  experience_reward integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela de progresso de desafios do usuário
CREATE TABLE IF NOT EXISTS user_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  challenge_id uuid REFERENCES challenges(id) NOT NULL,
  current_progress integer DEFAULT 0,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

-- Políticas para perfis de usuário
CREATE POLICY "Usuários podem ver seus próprios perfis"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios perfis"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seus próprios perfis"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Políticas para exercícios
CREATE POLICY "Exercícios são públicos para leitura"
  ON exercises FOR SELECT
  USING (true);

CREATE POLICY "Usuários podem criar exercícios personalizados"
  ON exercises FOR INSERT
  WITH CHECK (auth.uid() = created_by AND is_custom = true);

-- Políticas para exercícios do usuário
CREATE POLICY "Usuários podem ver seus próprios exercícios"
  ON user_exercises FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios exercícios"
  ON user_exercises FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios exercícios"
  ON user_exercises FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas para histórico de treinos
CREATE POLICY "Usuários podem ver seu próprio histórico de treinos"
  ON workout_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seu próprio histórico de treinos"
  ON workout_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas para conquistas (públicas para leitura)
CREATE POLICY "Conquistas são públicas para leitura"
  ON achievements FOR SELECT
  USING (true);

-- Políticas para conquistas do usuário
CREATE POLICY "Usuários podem ver suas próprias conquistas"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias conquistas"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas para desafios (públicos para leitura)
CREATE POLICY "Desafios são públicos para leitura"
  ON challenges FOR SELECT
  USING (true);

-- Políticas para progresso de desafios do usuário
CREATE POLICY "Usuários podem ver seu próprio progresso em desafios"
  ON user_challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio progresso em desafios"
  ON user_challenges FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seu próprio progresso em desafios"
  ON user_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Inserir algumas conquistas iniciais
INSERT INTO achievements (name, description, icon_name, category, requirement_type, requirement_value, experience_reward)
VALUES
  ('Primeiro Treino', 'Complete seu primeiro treino', 'FiAward', 'iniciante', 'workouts', 1, 50),
  ('Dedicação Inicial', 'Complete 10 treinos', 'FiAward', 'iniciante', 'workouts', 10, 100),
  ('Mestre do Treino', 'Complete 50 treinos', 'FiAward', 'intermediário', 'workouts', 50, 250),
  ('Viciado em Treino', 'Complete 100 treinos', 'FiAward', 'avançado', 'workouts', 100, 500),
  ('Explorador de Exercícios', 'Adicione 5 exercícios diferentes', 'GiWeightLiftingUp', 'iniciante', 'exercises', 5, 75),
  ('Colecionador de Exercícios', 'Adicione 15 exercícios diferentes', 'GiWeightLiftingUp', 'intermediário', 'exercises', 15, 150),
  ('Mestre dos Exercícios', 'Adicione 30 exercícios diferentes', 'GiWeightLiftingUp', 'avançado', 'exercises', 30, 300),
  ('Levantador Iniciante', 'Levante um total de 1000kg', 'FiTrendingUp', 'iniciante', 'weight', 1000, 100),
  ('Levantador Intermediário', 'Levante um total de 5000kg', 'FiTrendingUp', 'intermediário', 'weight', 5000, 200),
  ('Levantador Avançado', 'Levante um total de 10000kg', 'FiTrendingUp', 'avançado', 'weight', 10000, 400),
  ('Levantador Elite', 'Levante um total de 50000kg', 'FiTrendingUp', 'elite', 'weight', 50000, 1000),
  ('Consistência Inicial', 'Mantenha uma sequência de 3 dias', 'FiCalendar', 'iniciante', 'streak', 3, 75),
  ('Consistência Intermediária', 'Mantenha uma sequência de 7 dias', 'FiCalendar', 'intermediário', 'streak', 7, 150),
  ('Consistência Avançada', 'Mantenha uma sequência de 14 dias', 'FiCalendar', 'avançado', 'streak', 14, 300),
  ('Consistência Elite', 'Mantenha uma sequência de 30 dias', 'FiCalendar', 'elite', 'streak', 30, 750);

-- Função para atualizar a experiência e nível do usuário
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
DECLARE
  xp_per_level INTEGER := 100;
  new_level INTEGER;
BEGIN
  -- Calcular o novo nível com base na experiência
  new_level := FLOOR(NEW.experience / xp_per_level) + 1;
  
  -- Atualizar o nível se for diferente
  IF NEW.level != new_level THEN
    NEW.level := new_level;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o nível quando a experiência mudar
CREATE TRIGGER trigger_update_user_level
BEFORE UPDATE OF experience ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_user_level();

-- Função para verificar conquistas após um treino
CREATE OR REPLACE FUNCTION check_workout_achievements()
RETURNS TRIGGER AS $$
DECLARE
  achievement_record RECORD;
  user_profile RECORD;
BEGIN
  -- Obter o perfil do usuário
  SELECT * INTO user_profile FROM user_profiles WHERE id = NEW.user_id;
  
  -- Se o perfil não existir, criar um
  IF NOT FOUND THEN
    INSERT INTO user_profiles (id, total_workouts, last_workout_date)
    VALUES (NEW.user_id, 1, CURRENT_DATE)
    RETURNING * INTO user_profile;
  ELSE
    -- Atualizar estatísticas do perfil
    UPDATE user_profiles
    SET 
      total_workouts = total_workouts + 1,
      last_workout_date = CURRENT_DATE,
      updated_at = now()
    WHERE id = NEW.user_id
    RETURNING * INTO user_profile;
  END IF;
  
  -- Verificar conquistas baseadas em número de treinos
  FOR achievement_record IN 
    SELECT * FROM achievements 
    WHERE requirement_type = 'workouts' 
    AND requirement_value <= user_profile.total_workouts
  LOOP
    -- Inserir conquista se ainda não tiver sido desbloqueada
    INSERT INTO user_achievements (user_id, achievement_id)
    VALUES (NEW.user_id, achievement_record.id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    
    -- Se a conquista foi inserida, adicionar experiência
    IF FOUND THEN
      UPDATE user_profiles
      SET experience = experience + achievement_record.experience_reward
      WHERE id = NEW.user_id;
    END IF;
  END LOOP;
  
  -- Verificar sequência de dias
  IF user_profile.last_workout_date = CURRENT_DATE - INTERVAL '1 day' THEN
    UPDATE user_profiles
    SET streak_days = streak_days + 1
    WHERE id = NEW.user_id;
  ELSIF user_profile.last_workout_date < CURRENT_DATE - INTERVAL '1 day' THEN
    UPDATE user_profiles
    SET streak_days = 1
    WHERE id = NEW.user_id;
  END IF;
  
  -- Verificar conquistas baseadas em sequência de dias
  FOR achievement_record IN 
    SELECT * FROM achievements 
    WHERE requirement_type = 'streak' 
    AND requirement_value <= user_profile.streak_days
  LOOP
    -- Inserir conquista se ainda não tiver sido desbloqueada
    INSERT INTO user_achievements (user_id, achievement_id)
    VALUES (NEW.user_id, achievement_record.id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    
    -- Se a conquista foi inserida, adicionar experiência
    IF FOUND THEN
      UPDATE user_profiles
      SET experience = experience + achievement_record.experience_reward
      WHERE id = NEW.user_id;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar conquistas após um treino
CREATE TRIGGER trigger_check_workout_achievements
AFTER INSERT ON workout_history
FOR EACH ROW
EXECUTE FUNCTION check_workout_achievements();