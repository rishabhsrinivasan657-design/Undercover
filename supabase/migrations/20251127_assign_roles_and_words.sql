create or replace function assign_roles_and_words(
  p_room uuid,
  p_undercover uuid,
  p_citizen_word text,
  p_undercover_word text
)
returns void
language plpgsql
security definer
as $$
begin
  update rooms
  set
    phase = 'playing',
    round = 1,
    timer = 0
  where id = p_room;

  update players
  set
    role = 'undercover',
    word = p_undercover_word
  where id = p_undercover
    and room_id = p_room;

  update players
  set
    role = 'citizen',
    word = p_citizen_word
  where room_id = p_room
    and id != p_undercover;
end;
$$;
