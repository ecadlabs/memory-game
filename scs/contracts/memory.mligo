(*
  This Tezos CameLIGO Smart Contract implements a simple memory game.

  Glossary of Terms:

    Attempt: The list submitted when playing a turn (could be correct or incorrect)
    Sequence: The sequence to match, generated when a new game is initialized
    Level: Starts at 0 and incremented for each successively correct Attempt
    Status: Won, Lost or Playing

  TODO:
    * Prevent further play if Status is Lost or Won

  Copyright © 2023 ECAD Labs Inc. See the LICENSE file at top-level for details.
*)

#include "./util.mligo"

module Memory = struct

    type action = NewGame of int list | PlayTurn of int list
    type status = Playing | Won | Lost

    let _status_to_string (s: status) : string =
        match s with
        | Playing -> "Playing"
        | Won -> "Won"
        | Lost -> "Lost"

    type game_state = {
        // Equates to Score, as it's only incremented with a successful `play_turn`
        level : int;
        // The memory sequence to match
        sequence : int list;
        status: status;
    }

    type storage = (address, game_state) map

    // Given an attempt and sequence, evaluate its Status
    let _calculate_status (attempt: int list) (sequence: int list) : status =
        let rec status_helper (att: int list) (seq: int list): status =
          match (att, seq) with
          | ([], []) -> Won  // attempt, sequence lists exhausted w/o mistakes: Win!
          | ([], _::_) -> Playing // done: this attempt completed without mistakes
          | (_, []) -> Lost // return! no mistakes made
          | (atth::attt, seqh::seqt) ->
              if atth <> seqh then Lost else status_helper attt seqt // heads are the same? recurse! Otherwise Lost!!
        in
        status_helper attempt sequence

    type result = operation list * storage

    [@entry]
    let init_new_game (data : address * int list) (s: storage) : result =
        let (caller, seq) = data in
        let initial_game_state = { level = 0; sequence = seq; status = Playing } in
        [], Map.add caller initial_game_state s

    [@entry]
    let play_turn (data : address * int list) (s: storage) : result =
        let (caller, attempt) = data in
        let game_state = Map.find caller s in
        let new_status = _calculate_status attempt game_state.sequence in
        let next_level = game_state.level + bool_to_int (new_status <> Lost) in
        let new_game_state = { game_state with level = next_level; status = new_status } in
        [], Map.add caller new_game_state s
end
