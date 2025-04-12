import { AddPlayers } from "./AddPlayers";
import { Leaderboard } from "./Leaderboard";
import { fromMinutesAndSeconds } from "../util/util";
import { Upnext } from "./Upnext";

export function GameActive({
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
          <div className="buzzle-party">¡Buzzle Party!</div>
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
                  defaultValue={upcoming[0]?.[0]}
                />
              </label>
              <label>
                Player 2:{" "}
                <input
                  name="player2"
                  type="text"
                  defaultValue={upcoming[0]?.[1]}
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
