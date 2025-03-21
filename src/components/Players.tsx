export function Players({
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
