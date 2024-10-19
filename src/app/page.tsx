'use client'

import styles from "./page.module.css";
import {Game} from "./game";
import useLocalStorageState from "use-local-storage-state";

export default function Home() {
  const [hasBegun, setHasBegun] = useLocalStorageState("hasBegun", {defaultValue: false});
  const [state, setState] = useLocalStorageState("gameState", {defaultValue: () => new Game().toJSON()});
  const game = Game.fromJSON(state);

  function existingParings() {
  if (hasBegun) {
    const [active, onDeck, inTheHole] = game.upcoming;
    setState(game.toJSON());
    return (
      <div>
      <h2>Who's next?</h2>
      { active != null ?  <div>Active: {active[0]} & {active[1]}</div> : ""}
      { onDeck != null ?  <div>On deck: {onDeck[0]} & {onDeck[1]}</div> : ""}
      { inTheHole != null ?  <div>In the hole: {inTheHole[0]} & {inTheHole[1]}</div> : ""}
      </div>
    )
  } else {
    return ""
  }
}

  return (
    <div className={styles.page}>
      <h2>Players: </h2>
      <ul>
      {
        [...game.players.values()].map(player => (<li>{player}</li>))
      }
      </ul>
      <h2>Finished parings: </h2>
      <ul>
        {
          game.buzzles.map(([player1, player2]) => (<li>{player1} & {player2}</li>))
        }
      </ul>

      {
        existingParings()
      }

      <h2>Controls</h2>
      <form onSubmit={(e) => {
        e.preventDefault();

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const formJson = Object.fromEntries(formData.entries());
        form.querySelector("input")!.value = "";
        const player = formJson.player as string;
        if (player) {
          game.addPlayer(player);
          setState(game.toJSON());
        }
      }}>
        <label>Add Player: <input name="player" type="text" /></label>
        <input type="submit" />
      </form>

      {hasBegun ? (
        <div>
      <input type="button" value="Apply round" onClick={(e) => {
        game.addRound();
        setState(game.toJSON());
      }}/>
      <input type="button" value="Reset up next" onClick={(e) => {
        game.resetUpcoming();
        setState(game.toJSON());
      }} />
      </div>
      ) : (
        <input type="button" value="Start game" onClick={(e) => {
          setHasBegun(true);
        }}/>
      ) }
    </div>
  );
}
