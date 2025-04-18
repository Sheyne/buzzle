import { Pairing } from "./Pairing";

export function Upnext({
  upcoming: [active, onDeck, inTheHole],
}: {
  upcoming: (readonly [string, string])[];
}) {
  return (
    <div className="upnext">
      <div className="puzzle-part" />
      <div style={{ overflow: "hidden" }}>
        <div className="stack">
          {active != null ? (
            <Pairing title="UP NEXT" players={active} />
          ) : (
            <></>
          )}
          <div className="secondaries">
            {onDeck != null ? (
              <Pairing title="ON DECK" players={onDeck} />
            ) : (
              <></>
            )}
            {inTheHole != null ? (
              <Pairing title="IN THE HOLE" players={inTheHole} />
            ) : (
              <></>
            )}
          </div>
        </div>
        <div className="puzzle-part" />
      </div>
    </div>
  );
}
