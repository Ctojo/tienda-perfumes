-- ==============================================================================
-- SINCRONIZACIÓN DE PERFUMES Y STOCK REAL EN SUPABASE (AURA HAUTE PARFUMERIE)
-- ==============================================================================
-- Ejecutá este script en el SQL Editor de tu proyecto en Supabase (icono >_ a la izquierda).
-- Limpia los perfumes de prueba anteriores, inserta los 8 perfumes reales actuales
-- y habilita los permisos (RLS) para que el stock se descuente en tiempo real al comprar
-- o al modificarlo desde el Panel Admin (/admin).

-- 1. Vaciar la tabla de perfumes antiguos
DELETE FROM perfumes;

-- 2. Insertar los 8 perfumes reales con su stock y fotos oficiales
INSERT INTO perfumes (
  id,
  name,
  brand,
  gender,
  family,
  price,
  volume,
  rating,
  image,
  description,
  featured,
  stock
) VALUES
  (
    'cdn-urban-man-elixir',
    'Club de Nuit Urban Man Elixir',
    'Armaf',
    'Hombre',
    'Amaderado Especiado',
    68000,
    '105 ml',
    4.9,
    '/images/perfumes/urban-man-elixir.jpg',
    'Una composición magnética y seductora que combina el frescor cítrico especiado con un fondo ahumado y ambarino intenso. Alta fijación y proyección extraordinaria.',
    true,
    8
  ),
  (
    'paradise-garden',
    'Le Beau Paradise Garden',
    'Jean Paul Gaultier',
    'Hombre',
    'Verde Acuático Tropical',
    160000,
    '125 ml',
    5.0,
    '/images/perfumes/paradise-garden.jpg',
    'Fragancia de edición especial sellada en lata ornamental. Un edén olfativo acuático y tropical con una explosión de coco fresco, higo verde y maderas sensuales.',
    true,
    5
  ),
  (
    'vulcan-feu',
    'Vulcan Feu',
    'French Avenue',
    'Hombre',
    'Amaderado Oriental',
    75000,
    '100 ml',
    4.8,
    '/images/perfumes/vulcan-feu.jpg',
    'Presentación exclusiva con estética de serpiente dorada y azul. Una fragancia ardiente que evoca la fuerza de la tierra volcánica y las resinas nobles de Oriente.',
    false,
    6
  ),
  (
    'hawas-malibu',
    'Hawas Malibu for Him',
    'Rasasi',
    'Hombre',
    'Cítrico Marino Aromático',
    65000,
    '100 ml',
    4.8,
    '/images/perfumes/hawas-malibu.jpg',
    'Inspirado en la brisa oceánica y el sol radiante de Malibú. Notas acuáticas cristalinas, cítricos efervescentes y una base almizclada de gran permanencia.',
    true,
    9
  ),
  (
    'rome-paradox',
    'Rome Paradox Eau de Parfum',
    'MP (Mian Perfume)',
    'Mujer',
    'Floral Ámbar',
    65000,
    '100 ml',
    4.9,
    '/images/perfumes/rome-paradox.jpg',
    'Frasco texturado en rosa pastel. Una sinfonía floral blanca envolvente que contrasta la frescura del azahar con la calidez del ámbar y la dulzura de la vainilla.',
    false,
    7
  ),
  (
    'rome-ivory',
    'Rome Ivory Eau de Parfum',
    'MP (Mian Perfume)',
    'Mujer',
    'Floral Amaderado',
    65000,
    '100 ml',
    4.7,
    '/images/perfumes/rome-ivory.jpg',
    'Elegancia en frasco blanco marfil. Una estela limpia, distinguida y etérea, con acordes de maderas blancas y un delicado bouquet floral primaveral.',
    false,
    6
  ),
  (
    'lady-million-royal',
    'Lady Million Royal (Tester)',
    'Paco Rabanne',
    'Mujer',
    'Floral Frutal Amaderado',
    130000,
    '80 ml',
    4.9,
    '/images/perfumes/lady-million-royal.jpg',
    'Icónico frasco diamante en cristal rubí y corona dorada. Formato tester original con concentración Eau de Parfum. Manifiesto de feminidad empoderada y magnética.',
    true,
    4
  ),
  (
    'shakira-amarillo',
    'S by Shakira Eau Florale',
    'Shakira',
    'Mujer',
    'Floral Gourmand',
    40000,
    '80 ml',
    4.6,
    '/images/perfumes/shakira-amarillo.jpg',
    'Frasco facetado con tapón radiante dorado. Una fragancia chispeante y alegre que combina flores exóticas con una dulzura gourmand adictiva.',
    false,
    12
  );

-- 3. Configurar políticas de seguridad (Row Level Security)
ALTER TABLE perfumes ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública de perfumes
DROP POLICY IF EXISTS "Lectura pública de perfumes" ON perfumes;
CREATE POLICY "Lectura pública de perfumes" ON perfumes
FOR SELECT USING (true);

-- Permitir que tanto el Checkout como el panel Admin puedan actualizar el stock
DROP POLICY IF EXISTS "Permitir actualizar stock" ON perfumes;
CREATE POLICY "Permitir actualizar stock" ON perfumes
FOR UPDATE USING (true) WITH CHECK (true);

-- Permitir inserción
DROP POLICY IF EXISTS "Permitir inserción de perfumes" ON perfumes;
CREATE POLICY "Permitir inserción de perfumes" ON perfumes
FOR INSERT WITH CHECK (true);
