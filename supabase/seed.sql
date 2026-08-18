insert into public.leagues (name, sport, region, country)
values
  ('Liga BPI', 'Football', 'Portugal', 'Portugal'),
  ('Taça de Portugal Feminina', 'Football', 'Portugal', 'Portugal'),
  ('Supertaça Feminina', 'Football', 'Portugal', 'Portugal'),
  ('UEFA Women''s EURO', 'Football', 'Europa', null),
  ('UEFA Women''s Champions League', 'Football', 'Europa', null),
  ('NWSL', 'Football', 'EUA', 'United States'),
  ('EHF Champions League Women', 'Handball', 'Europa', null),
  ('World Women''s Handball Championship', 'Handball', 'Mundo', null),
  ('European Women''s Handball Championship', 'Handball', 'Europa', null)
on conflict (name) do update
set
  sport = excluded.sport,
  region = excluded.region,
  country = excluded.country;

insert into public.teams (name, sport, country)
values
  ('SL Benfica', 'Football', 'Portugal'),
  ('Sporting CP', 'Football', 'Portugal'),
  ('SC Braga', 'Football', 'Portugal'),
  ('SCU Torreense', 'Football', 'Portugal'),
  ('Racing Power FC', 'Football', 'Portugal'),
  ('SF Damaiense', 'Football', 'Portugal'),
  ('Valadares Gaia FC', 'Football', 'Portugal'),
  ('CS Marítimo', 'Football', 'Portugal'),
  ('Rio Ave FC', 'Football', 'Portugal'),
  ('Vitória SC', 'Football', 'Portugal'),
  ('Angel City FC', 'Football', 'United States'),
  ('Bay FC', 'Football', 'United States'),
  ('Boston Legacy FC', 'Football', 'United States'),
  ('Chicago Stars FC', 'Football', 'United States'),
  ('Denver Summit FC', 'Football', 'United States'),
  ('Gotham FC', 'Football', 'United States'),
  ('Houston Dash', 'Football', 'United States'),
  ('Kansas City Current', 'Football', 'United States'),
  ('North Carolina Courage', 'Football', 'United States'),
  ('Orlando Pride', 'Football', 'United States'),
  ('Portland Thorns FC', 'Football', 'United States'),
  ('Racing Louisville FC', 'Football', 'United States'),
  ('San Diego Wave FC', 'Football', 'United States'),
  ('Seattle Reign FC', 'Football', 'United States'),
  ('Utah Royals FC', 'Football', 'United States'),
  ('Washington Spirit', 'Football', 'United States'),
  ('Arsenal Women', 'Football', 'England'),
  ('Barcelona Femení', 'Football', 'Spain'),
  ('Bayern Munich Women', 'Football', 'Germany'),
  ('Chelsea Women', 'Football', 'England'),
  ('Juventus Women', 'Football', 'Italy'),
  ('Manchester United Women', 'Football', 'England'),
  ('OL Lyonnes', 'Football', 'France'),
  ('Paris Saint-Germain Women', 'Football', 'France'),
  ('Real Madrid Femenino', 'Football', 'Spain'),
  ('Roma Women', 'Football', 'Italy'),
  ('Sporting CP Women', 'Football', 'Portugal'),
  ('VfL Wolfsburg Women', 'Football', 'Germany'),
  ('Brest Bretagne Handball Women', 'Handball', 'France'),
  ('Győri Audi ETO KC Women', 'Handball', 'Hungary'),
  ('CSM București Women', 'Handball', 'Romania'),
  ('Team Esbjerg Women', 'Handball', 'Denmark'),
  ('France Handball Women', 'Handball', 'France'),
  ('Germany Handball Women', 'Handball', 'Germany'),
  ('Norway Handball Women', 'Handball', 'Norway'),
  ('Denmark Handball Women', 'Handball', 'Denmark')
on conflict (name) do update
set
  sport = excluded.sport,
  country = excluded.country;

-- Jogos, resultados e estatísticas não são semeados manualmente.
-- Devem vir de fontes ligadas ou endpoints de importação para evitar dados desatualizados.
