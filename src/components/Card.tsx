import { minutesAndSeconds } from "../util/util";
import { colorOf, rotation } from "../util/util";

export function Card(args: {
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
