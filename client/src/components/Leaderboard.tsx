import { Card } from "./Card";

export function Leaderboard({ times }: { times: [string, string, number][] }) {
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
