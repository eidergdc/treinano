/*
  # Insert default exercises

  This migration adds some default exercises to get users started.
*/

INSERT INTO exercises (name, description, category) VALUES
('Agachamento', 'Exercício fundamental para desenvolvimento das pernas', 'Pernas'),
('Supino Reto', 'Exercício clássico para desenvolvimento do peitoral', 'Peito'),
('Barra Fixa', 'Exercício para desenvolvimento das costas', 'Costas'),
('Rosca Direta', 'Exercício básico para bíceps', 'Bíceps'),
('Extensão Triceps', 'Exercício para desenvolvimento do tríceps', 'Tríceps'),
('Desenvolvimento', 'Exercício para ombros', 'Ombros'),
('Prancha', 'Exercício para fortalecimento do core', 'Abdômen'),
('Elevação Lateral', 'Exercício para desenvolvimento lateral dos ombros', 'Ombros'),
('Leg Press', 'Exercício para desenvolvimento das pernas', 'Pernas'),
('Remada Baixa', 'Exercício para desenvolvimento das costas', 'Costas')
ON CONFLICT (id) DO NOTHING;