import { Game, ordered } from "./game";
import useLocalStorageState from "use-local-storage-state";
import { minutesAndSeconds, fromMinutesAndSeconds } from "./minutesAndSeconds";
import "./App.css";

const minNumberPlayers = 4;

function cleanupString(x: string): string {
  while (x.startsWith(" ")) {
    x = x.slice(1);
  }
  while (x.endsWith(" ")) {
    x = x.slice(0, x.length - 1);
  }
  return x;
}

function hash(x: string) {
  var hash = 0,
    i,
    chr;
  if (x.length === 0) return hash;
  for (i = 0; i < x.length; i++) {
    chr = x.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function colorOf(player1: string, player2: string) {
  return `hsl(${(hash(JSON.stringify([player1, player2])) / 12345) * 69}deg 70% 70%)`;
}
function rotation(nonce: string) {
  return `${Math.sin(hash(nonce) * 1.69) * 3.14}deg`;
}

function Card(args: {
  playersAndTime: [string, string, number];
  rank: number;
}) {
  const [p1, p2, time] = args.playersAndTime;
  return (
    <div
      className={`card card-${args.rank}`}
      style={{
        backgroundColor: colorOf(p1, p2),
        rotate: rotation(JSON.stringify(args)),
      }}
    >
      <div className="rank">{args.rank}</div>
      <div className="times">
        <div>{p1}</div>
        <div>&</div>
        <div>{p2}</div>
      </div>
      <div className="time">{minutesAndSeconds(time)}</div>
    </div>
  );
}

function Leaderboard({ times }: { times: [string, string, number][] }) {
  return (
    <div className="leaderboard">
      <div className="card-container">
        <Card playersAndTime={times[0]} rank={1} />
      </div>
      <div className="card-container">
        <Card playersAndTime={times[1]} rank={2} />
        <Card playersAndTime={times[2]} rank={3} />
      </div>
      <div className="card-container">
        {times.slice(3).map((playersAndTime, idx) => (
          <Card playersAndTime={playersAndTime} rank={idx + 4} />
        ))}
      </div>
    </div>
  );
}

function Pairing({
  title,
  players: [player1, player2],
}: {
  title: string;
  players: readonly [string, string];
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
  upcoming: (readonly [string, string])[];
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
        <input name="player" type="text" />
        <input type="submit" value="Add player" />
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
  leaderboard,
  playRound,
  resetUpcoming,
  addPlayer,
  showExtraControls,
  setShowExtraControls,
  numberOfPlayersToShow,
  setNumberOfPlayersToShow,
  upcoming,
  setInEditMode,
}: {
  showExtraControls: boolean;
  setShowExtraControls: (x: boolean) => void;
  numberOfPlayersToShow: number | null;
  setNumberOfPlayersToShow: (x: number | null) => void;
  leaderboard: [string, string, number][];
  upcoming: (readonly [string, string])[];
  playRound: (player1: string, player2: string, time: number) => void;
  addPlayer: (player: string) => void;
  resetUpcoming: () => void;
  setInEditMode: (x: boolean) => void;
}) {
  return (
    <>
      <div className="main">
        <div className="left">
          <Upnext upcoming={upcoming} />
          <div className="controls">
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
                <input
                  name="player1"
                  type="text"
                  defaultValue={upcoming[0][0]}
                />
              </label>
              <label>
                Player 2:{" "}
                <input
                  name="player2"
                  type="text"
                  defaultValue={upcoming[0][1]}
                />
              </label>
              <label>
                Time: <input name="time" type="text" />
              </label>
              <input type="submit" value="Add time" />
            </form>
            <hr />
            <input
              type="button"
              value={showExtraControls ? "Less" : "More"}
              onClick={() => setShowExtraControls(!showExtraControls)}
            />
            {showExtraControls ? (
              <>
                <AddPlayers addPlayer={addPlayer} />{" "}
                <label>
                  Number of records to show:
                  <input
                    name="numberToShow"
                    type="number"
                    defaultValue={numberOfPlayersToShow ?? ""}
                    onChange={(e) => {
                      e.preventDefault();
                      const numberToShow = e.target.value;
                      setNumberOfPlayersToShow(
                        numberToShow == "" ? null : Number(numberToShow)
                      );
                    }}
                  />
                </label>
                <input
                  type="button"
                  value="Reset up next"
                  onClick={(e) => resetUpcoming()}
                />
                <input
                  type="button"
                  value="Enter edit mode"
                  onClick={(e) => setInEditMode(true)}
                />
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
        <Leaderboard times={leaderboard} />
      </div>
    </>
  );
}

export function EditMode({
  playerList,
  scores,
  upcoming,
  setPlayerList,
  setScores,
  setUpcoming,
  exitEditMode,
  fullReset,
}: {
  playerList: Set<string>;
  scores: Map<[string, string], number>;
  upcoming: (readonly [string, string])[];
  setPlayerList: (x: Set<string>) => void;
  setScores: (x: Map<[string, string], number>) => void;
  setUpcoming: (x: [string, string][]) => void;
  exitEditMode: () => void;
  fullReset: () => void;
}) {
  const sortedPlayerList = [...playerList];
  sortedPlayerList.sort();
  const scoresToSort = [...scores];
  scoresToSort.sort((a, b) => a[1] - b[1]);
  const formattedScores = scoresToSort.map(
    ([[a, b], t]) => `${a} & ${b} -- ${minutesAndSeconds(t)}`
  );
  const upcomingMapped = upcoming.map(([a, b]) => `${a} & ${b}`);

  return (
    <>
      <div>
        <h3>Players</h3>
        <textarea
          onChange={(change) =>
            setPlayerList(
              new Set(change.target.value.split("\n").map(cleanupString))
            )
          }
        >
          {sortedPlayerList.join("\n")}
        </textarea>
      </div>
      <div>
        <h3>Leaderboard</h3>
        <textarea
          rows={formattedScores.length}
          cols={50}
          onChange={(change) => {
            const newScores = change.target.value
              .split("\n")
              .map((row) => {
                const match = row.match(
                  /^([^\&]+)\&([^\-]+)--\s*([0-9:]+)\s*$/
                );
                if (match) {
                  return [
                    ordered([cleanupString(match[1]), cleanupString(match[2])]),
                    fromMinutesAndSeconds(match[3]),
                  ] as const;
                }
              })
              .filter((x): x is [[string, string], number] => !!x);
            setScores(new Map(newScores));
          }}
        >
          {formattedScores.join("\n")}
        </textarea>
      </div>
      <div>
        <h3>Upcoming parings</h3>
        <textarea
          rows={3}
          cols={50}
          onChange={(change) => {
            const newUpcoming = change.target.value
              .split("\n")
              .map((row) => {
                const [a, b] = row.split("&");
                if (!b) return;
                return [cleanupString(a), cleanupString(b)] as const;
              })
              .filter((x): x is [string, string] => !!x);
            setUpcoming(newUpcoming);
          }}
        >
          {upcomingMapped.join("\n")}
        </textarea>
      </div>
      <div>
        <input type="button" value="Done" onClick={(e) => exitEditMode()} />
      </div>
      <div>
        <input
          type="button"
          value="Clear leaderboard and reset game"
          onClick={(e) => fullReset()}
        />
      </div>
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
  const [inEditMode, setInEditMode] = useLocalStorageState("inEditMode", {
    defaultValue: false,
  });
  const [numberOfPlayersToShow, setNumberOfPlayersToShow] =
    useLocalStorageState<number | null>("numberOfPlayersToShow", {
      defaultValue: 10,
    });
  const [showExtraControls, setShowExtraControls] = useLocalStorageState(
    "showExtraControls",
    {
      defaultValue: false,
    }
  );

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

  if (inEditMode) {
    return (
      <EditMode
        playerList={game.players}
        scores={game.buzzles}
        upcoming={game.upcoming}
        setPlayerList={(players) => withGame((g) => (g.players = players))}
        setScores={(scores) => withGame((g) => (g.buzzles = scores))}
        setUpcoming={(upcoming) => withGame((g) => g.resetUpcoming(upcoming))}
        exitEditMode={() => setInEditMode(false)}
        fullReset={() => {
          setState(new Game().toJSON());
          setHasBegun(false);
          setInEditMode(false);
        }}
      />
    );
  } else if (!hasBegun || game.players.size < minNumberPlayers) {
    return (
      <GameSetup
        buzzleCounts={game.buzzleCounts()}
        startGame={() => {
          if (game.players.size >= minNumberPlayers) {
            withGame(() => setHasBegun(true));
          }
        }}
        addPlayer={addPlayer}
      />
    );
  } else {
    return (
      <>
        <GameActive
          showExtraControls={showExtraControls}
          setShowExtraControls={setShowExtraControls}
          numberOfPlayersToShow={numberOfPlayersToShow}
          setNumberOfPlayersToShow={setNumberOfPlayersToShow}
          leaderboard={game.leaderboard(numberOfPlayersToShow)}
          addPlayer={addPlayer}
          upcoming={game.upcoming}
          playRound={(player1, player2, time) =>
            withGame((game) => game.addRound([player1, player2], time))
          }
          resetUpcoming={() => withGame((game) => game.resetUpcoming())}
          setInEditMode={setInEditMode}
        />
      </>
    );
  }
}
