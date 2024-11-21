import { expect, test } from "@jest/globals";
import { Game } from "./game";

test("can add players to the game", () => {
  const game = new Game();
  game.addPlayer("A");
  game.addPlayer("B");
  game.addPlayer("C");
  game.addPlayer("D");
  game.addPlayer("D");
  expect(game.players.size).toBe(4);
});
