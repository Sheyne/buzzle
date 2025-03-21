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

test("can generate a bunch of rounds", () => {
  const game = new Game();
  game.addPlayer("A");
  game.addPlayer("B");
  game.addPlayer("C");
  game.addPlayer("D");
  game.addPlayer("E");
  game.addPlayer("F");
  game.addPlayer("G");
  game.addPlayer("H");
  game.addPlayer("I");
  game.addPlayer("J");
  game.addPlayer("K");
  game.addPlayer("L");
  game.addPlayer("M");
  game.addPlayer("N");

  for (let iteration = 0; iteration < 100; iteration++) {
    if (game.upcoming.length !== 3) {
      console.log("oops");
    }
    expect(game.upcoming.length).toBe(3);
    console.log(iteration);
    game.addRound(game.upcoming[0], 100);
  }
});
