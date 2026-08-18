update public.teams
set country = case
  when sport = 'Handball' and name in (
    'Brest Bretagne Handball Women',
    'France Handball Women'
  ) then 'France'
  when sport = 'Handball' and name = 'Győri Audi ETO KC Women' then 'Hungary'
  when sport = 'Handball' and name = 'CSM București Women' then 'Romania'
  when sport = 'Handball' and name = 'Team Esbjerg Women' then 'Denmark'
  when sport = 'Handball' and name = 'Germany Handball Women' then 'Germany'
  when sport = 'Handball' and name = 'Norway Handball Women' then 'Norway'
  when sport = 'Handball' and name = 'Denmark Handball Women' then 'Denmark'
  when sport = 'Football' and name in (
    'SL Benfica',
    'Sporting CP',
    'SC Braga',
    'SCU Torreense',
    'Racing Power FC',
    'SF Damaiense',
    'Valadares Gaia FC',
    'CS Marítimo',
    'Rio Ave FC',
    'Vitória SC',
    'Sporting CP Women'
  ) then 'Portugal'
  when sport = 'Football' and name in (
    'Angel City FC',
    'Bay FC',
    'Boston Legacy FC',
    'Chicago Stars FC',
    'Denver Summit FC',
    'Gotham FC',
    'Houston Dash',
    'Kansas City Current',
    'North Carolina Courage',
    'Orlando Pride',
    'Portland Thorns FC',
    'Racing Louisville FC',
    'San Diego Wave FC',
    'Seattle Reign FC',
    'Utah Royals FC',
    'Washington Spirit'
  ) then 'United States'
  when sport = 'Football' and name in (
    'Arsenal Women',
    'Chelsea Women',
    'Manchester United Women'
  ) then 'England'
  when sport = 'Football' and name in (
    'Barcelona Femení',
    'Real Madrid Femenino'
  ) then 'Spain'
  when sport = 'Football' and name = 'Bayern Munich Women' then 'Germany'
  when sport = 'Football' and name = 'VfL Wolfsburg Women' then 'Germany'
  when sport = 'Football' and name = 'Juventus Women' then 'Italy'
  when sport = 'Football' and name = 'Roma Women' then 'Italy'
  when sport = 'Football' and name = 'OL Lyonnes' then 'France'
  when sport = 'Football' and name = 'Paris Saint-Germain Women' then 'France'
  else country
end;

update public.teams
set name = 'CS Marítimo'
where name = 'CS Marítimo';

update public.teams
set name = 'Vitória SC'
where name = 'Vitória SC';

update public.teams
set name = 'Barcelona Femení'
where name = 'Barcelona Femení';

update public.teams
set name = 'Győri Audi ETO KC Women'
where name = 'Győri Audi ETO KC Women';

update public.teams
set name = 'CSM București Women'
where name = 'CSM București Women';

update public.leagues
set name = 'Taça de Portugal Feminina'
where name = 'Taça de Portugal Feminina';

update public.leagues
set name = 'Supertaça Feminina'
where name = 'Supertaça Feminina';
