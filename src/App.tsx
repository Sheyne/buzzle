import { Game } from "./game";
import useLocalStorageState from "use-local-storage-state";
import { minutesAndSeconds, fromMinutesAndSeconds } from "./minutesAndSeconds";
import "./App.css";

function Leaderboard({ times }: { times: [string, string, number][] }) {
  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>
      <ol>
        {times.map(([p1, p2, time]) => (
          <li>
            {p1} & {p2}: {minutesAndSeconds(time)}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Pairing({
  title,
  players: [player1, player2],
}: {
  title: string;
  players: [string, string];
}) {
  return (
    <div className="pairing">
      <div className="title">{title}</div>
      {player1} & {player2}
    </div>
  );
}

function Upnext({
  upcoming: [active, onDeck, inTheHole],
}: {
  upcoming: [string, string][];
}) {
  return (
    <div className="upnext">
      {active != null ? <Pairing title="Up next" players={active} /> : <></>}
      <div className="secondaries">
        {onDeck != null ? <Pairing title="On deck" players={onDeck} /> : <></>}
        {inTheHole != null ? (
          <Pairing title="In the hole" players={inTheHole} />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

function Players({
  buzzleCounts,
  hasBegun,
}: {
  buzzleCounts: [string, number][];
  hasBegun: boolean;
}) {
  return (
    <>
      <h2>Players: </h2>
      <ul>
        {buzzleCounts.map(([player, count]) => (
          <li>
            {player}
            {hasBegun ? ` has buzzled ${count} times` : ""}
          </li>
        ))}
      </ul>
    </>
  );
}

function AddPlayers({ addPlayer }: { addPlayer: (player: string) => void }) {
  return (
    <>
      <h2>Controls</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);
          const formJson = Object.fromEntries(formData.entries());
          form.querySelector("input")!.value = "";
          const player = formJson.player as string;
          if (player) {
            addPlayer(player);
          }
        }}
      >
        <label>
          Add Player: <input name="player" type="text" />
        </label>
        <input type="submit" />
      </form>
    </>
  );
}

function GameSetup({
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

function GameActive({
  buzzleCounts,
  leaderboard,
  playRound,
  resetUpcoming,
  addPlayer,
  showAddPlayers,
  upcoming,
}: {
  showAddPlayers: boolean;
  buzzleCounts: [string, number][];
  leaderboard: [string, string, number][];
  upcoming: [string, string][];
  playRound: (player1: string, player2: string, time: number) => void;
  addPlayer: (player: string) => void;
  resetUpcoming: () => void;
}) {
  return (
    <>
      <div className="main">
        <Leaderboard times={leaderboard} />
        <Upnext upcoming={upcoming} />
      </div>
      {showAddPlayers ? <AddPlayers addPlayer={addPlayer} /> : <></>}
      <form
        onSubmit={(e) => {
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
              playRound(player1, player2, timeNumber);
            }
          }
        }}
      >
        <label>
          Player 1:{" "}
          <input name="player1" type="text" defaultValue={upcoming[0][0]} />
        </label>
        <label>
          Player 2:{" "}
          <input name="player2" type="text" defaultValue={upcoming[0][1]} />
        </label>
        <label>
          Time: <input name="time" type="text" />
        </label>
        <input type="submit" />
      </form>
      <input
        type="button"
        value="Reset up next"
        onClick={(e) => resetUpcoming()}
      />
    </>
  );
}

export default function App() {
  const [hasBegun, setHasBegun] = useLocalStorageState("hasBegun", {
    defaultValue: false,
  });
  const [state, setState] = useLocalStorageState("gameState", {
    defaultValue: () => new Game().toJSON(),
  });

  const setGameState = () => {
    game.upcoming;
    setState(game.toJSON());
  };

  const withGame = (f: (game: Game) => void) => {
    f(game);
    setGameState();
  };

  const game = Game.fromJSON(state);
  const addPlayer = (player: string) =>
    withGame((game) => game.addPlayer(player));

  if (!hasBegun) {
    return (
      <GameSetup
        buzzleCounts={game.buzzleCounts()}
        startGame={() =>
          withGame(() => {
            setHasBegun(true);
          })
        }
        addPlayer={addPlayer}
      />
    );
  } else {
    return (
      <GameActive
        showAddPlayers={true}
        buzzleCounts={game.buzzleCounts()}
        leaderboard={game.leaderboard(10)}
        addPlayer={addPlayer}
        upcoming={game.upcoming}
        playRound={(player1, player2, time) =>
          withGame((game) => game.addRound([player1, player2], time))
        }
        resetUpcoming={() => withGame((game) => game.resetUpcoming())}
      />
    );
  }
}
