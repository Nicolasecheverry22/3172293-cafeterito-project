-- Seed de proveedores (datos tomados del mock frontend providers.js).
-- Idempotente: ON CONFLICT evita duplicados al reejecutar.
INSERT INTO providers (id, nit, provider_name, provider_email, provider_phone, provider_address, product_service, is_active) VALUES
(1,  '900100001-1', 'Alimentos del Norte S.A.S',       'contacto@alimentosnorte.com',    '3101000001', 'Carrera 5 # 12-34, Cali, Valle del Cauca',          'Productos alimenticios y víveres',                  true),
(2,  '900100002-2', 'Distribuciones Andinas Ltda',     'ventas@andinas.com',             '3101000002', 'Calle 18 # 7-45, Medellín, Antioquia',              'Distribución de productos de consumo masivo',       true),
(3,  '900100003-3', 'Tecnología Global S.A',           'info@tecglobal.com',             '3101000003', 'Carrera 15 # 82-20, Bogotá D.C.',                   'Equipos tecnológicos y soluciones informáticas',   false),
(4,  '900100004-4', 'Suministros Industriales SAS',    'contacto@suministrosind.com',    '3101000004', 'Calle 32 # 10-18, Barranquilla, Atlántico',         'Suministros y materiales industriales',             true),
(5,  '900100005-5', 'Logística Express S.A.S',         'soporte@logisticaexpress.com',   '3101000005', 'Carrera 40 # 25-60, Cali, Valle del Cauca',         'Servicios de transporte y logística',               true),
(6,  '900100006-6', 'Papelería Central Ltda',          'ventas@papeleriacentral.com',    '3101000006', 'Calle 14 # 9-27, Pereira, Risaralda',               'Papelería y útiles de oficina',                     false),
(7,  '900100007-7', 'Construcciones del Caribe',       'info@constructcaribe.com',       '3101000007', 'Carrera 21 # 45-12, Cartagena, Bolívar',            'Materiales y servicios de construcción',            true),
(8,  '900100008-8', 'Ferretería Industrial SAS',       'contacto@ferreindustrial.com',   '3101000008', 'Calle 52 # 30-16, Medellín, Antioquia',             'Herramientas y equipos de ferretería',              true),
(9,  '900100009-9', 'Servicios Integrales Ltda',       'admin@serviciosint.com',         '3101000009', 'Carrera 8 # 19-42, Manizales, Caldas',              'Servicios generales y mantenimiento',               false),
(10, '900100010-0', 'Importaciones del Pacífico',      'ventas@importpacifico.com',      '3101000010', 'Avenida 6N # 24-35, Cali, Valle del Cauca',         'Importación de mercancías y productos',             true),
(11, '900100011-1', 'Comercializadora Bogotá SAS',     'info@combogota.com',             '3101000011', 'Calle 72 # 11-35, Bogotá D.C.',                     'Comercialización de productos nacionales',          true),
(12, '900100012-2', 'Soluciones Tecnológicas Ltda',    'soporte@solutec.com',            '3101000012', 'Carrera 33 # 48-25, Bucaramanga, Santander',        'Soporte técnico y servicios tecnológicos',          true),
(13, '900100013-3', 'Agroinsumos del Valle',           'ventas@agrovalle.com',           '3101000013', 'Calle 10 # 6-50, Palmira, Valle del Cauca',         'Insumos agrícolas y fertilizantes',                 false),
(14, '900100014-4', 'Textiles Nacionales SAS',         'contacto@textilesnac.com',       '3101000014', 'Carrera 52 # 38-17, Medellín, Antioquia',           'Telas y productos textiles',                        true),
(15, '900100015-5', 'Plásticos Industriales Ltda',     'info@plasticosind.com',          '3101000015', 'Calle 25 # 18-40, Cali, Valle del Cauca',           'Productos plásticos industriales',                  true),
(16, '900100016-6', 'Equipos Médicos Colombia',        'ventas@equiposmed.com',          '3101000016', 'Carrera 13 # 63-28, Bogotá D.C.',                   'Equipos e insumos médicos',                         false),
(17, '900100017-7', 'Seguridad Privada Integral',      'admin@seguridadint.com',         '3101000017', 'Calle 41 # 27-15, Barranquilla, Atlántico',         'Servicios de vigilancia y seguridad privada',       true),
(18, '900100018-8', 'Transporte Nacional SAS',         'contacto@transnacional.com',     '3101000018', 'Carrera 68 # 17-90, Bogotá D.C.',                   'Transporte terrestre de mercancías',                true),
(19, '900100019-9', 'Consultoría Empresarial Ltda',    'info@consultemp.com',            '3101000019', 'Calle 9 # 4-22, Cali, Valle del Cauca',             'Consultoría y asesoría empresarial',                false),
(20, '900100020-0', 'Marketing Digital Pro SAS',       'ventas@marketingpro.com',        '3101000020', 'Carrera 11 # 93-15, Bogotá D.C.',                   'Servicios de marketing y publicidad digital',       true)
ON CONFLICT (id) DO NOTHING;

-- Ajusta la secuencia del id para evitar colisiones en próximos INSERT.
SELECT setval(pg_get_serial_sequence('providers', 'id'), (SELECT COALESCE(MAX(id), 1) FROM providers));
