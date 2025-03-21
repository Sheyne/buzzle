import { Pairing } from "./Pairing";

export function Upnext({
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
