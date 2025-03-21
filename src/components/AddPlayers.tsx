export function AddPlayers({
  addPlayer,
}: {
  addPlayer: (player: string) => void;
}) {
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);
          const formJson = Object.fromEntries(formData.entries());
          form.querySelector("input")!.value = "";
          const player = formJson.player as string;
          if (player) {
            addPlayer(player);
          }
        }}
      >
        <input name="player" type="text" />
        <input type="submit" value="Add player" />
      </form>
    </>
  );
}
