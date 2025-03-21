import { Game } from "./game";
import useLocalStorageState from "use-local-storage-state";
import "./App.css";
import { GameSetup } from "./components/GameSetup";
import { GameActive } from "./components/GameActive";
import { EditMode } from "./components/EditMode";

const minNumberPlayers = 4;

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
