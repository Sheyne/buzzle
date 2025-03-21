import { ordered } from "../game";
import { fromMinutesAndSeconds } from "../util/util";
import { minutesAndSeconds } from "../util/util";
import { cleanupString } from "../util/util";

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
