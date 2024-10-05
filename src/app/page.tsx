import styles from "./page.module.css";
import {Game} from "./game";

export default function Home() {
  const game = new Game();
  game.addPlayer("sheyne");
  game.addPlayer("mattie");
  game.addPlayer("alex");
  game.addPlayer("amanda");
  game.addPlayer("arlee");
  game.addPlayer("joe");

  game.addRound(["sheyne", "mattie"]);

  const [active, onDeck, inTheHole] = game.upcoming();

  return (
    <div className={styles.page}>
      <ul>
      {
        [...game.players.values()].map(player => (<li>{player}</li>))
      }
      </ul>
      <ul>
        {
          game.buzzles.map(([player1, player2]) => (<li>{player1} & {player2}</li>))
        }
      </ul>

      <div>Active: {active[0]} & {active[1]}</div>
      <div>On deck: {onDeck[0]} & {onDeck[1]}</div>
      <div>In the hole: {inTheHole[0]} & {inTheHole[1]}</div>
    </div>
  );
}
