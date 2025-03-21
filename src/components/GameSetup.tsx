import { AddPlayers } from "./AddPlayers";
import { Players } from "./Players";

export function GameSetup({
  buzzleCounts,
  startGame,
  addPlayer,
}: {
  buzzleCounts: [string, number][];
  startGame: () => void;
  addPlayer: (player: string) => void;
}) {
  return (
    <>
      <Players buzzleCounts={buzzleCounts} hasBegun={false} />

      <AddPlayers addPlayer={addPlayer} />
      <input type="button" value="Start game" onClick={(e) => startGame()} />
    </>
  );
}
