export function Pairing({
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
