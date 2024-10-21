
import {Game} from "./game";
import useLocalStorageState from "use-local-storage-state";

function minutesAndSeconds(time: number) {
  const allSeconds = Math.floor(time);
  const displaySeconds = allSeconds % 60;
  const minutesInSeconds = allSeconds - displaySeconds;
  const minutes = minutesInSeconds / 60;
  return `${minutes}:${displaySeconds.toString().padStart(2, '0')}`;
}

function fromMinutesAndSeconds(time: string) {
  // basically just implement the microwave algorithm, where the hundreds place really just means multiples of 60.
  // this works well if you strip the colon, and if the user doesn't enter a colon in the first place.
  // it is weird that "95" -> 95, but "105" -> 65. This is what your microwave does too.
  const timeNumber = Number(time.replace(":", ""));
  if (timeNumber == null) {
    return undefined;
  }
  const allSeconds = Math.floor(timeNumber);
  const displaySeconds = allSeconds % 100;
  const minutesInHundreds = allSeconds - displaySeconds;
  const minutes = minutesInHundreds / 100;
  return minutes * 60 + displaySeconds;
}

export default function App() {
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
    <div>
      <h2>Players: </h2>
      <ul>
      {
        game.buzzleCounts().map(([player, count]) => (<li>{player}{hasBegun ? ` has buzzled ${count} times` : ''}</li>))
      }
      </ul>
      <h2>Finished parings: </h2>
      <ul>
        {
          [...game.buzzles.entries()].map(([[player1, player2], time]) => (<li>{player1} & {player2}: {minutesAndSeconds(time)}</li>))
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
          <form onSubmit={(e) => {
            e.preventDefault();

            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            const formJson = Object.fromEntries(formData.entries());
            form.reset();
            const player1 = formJson.player1 as string | undefined;
            const player2 = formJson.player2 as string | undefined;
            const time = formJson.time as string;
            if (time && player1 && player2) {
              const timeNumber = fromMinutesAndSeconds(time);
              if (timeNumber) {
                game.addRound([player1, player2], timeNumber);
                setState(game.toJSON());
              }
            }
          }}>
        <label>Player 1: <input name="player1" type="text" defaultValue={game.upcoming[0]![0]} /></label>
        <label>Player 2: <input name="player2" type="text" defaultValue={game.upcoming[0]![1]} /></label>
        <label>Time: <input name="time" type="text" /></label>
        <input type="submit" />
      </form>

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
