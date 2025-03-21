export function hash(x: string) {
  var hash = 0,
    i,
    chr;
  if (x.length === 0) return hash;
  for (i = 0; i < x.length; i++) {
    chr = x.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
export function cleanupString(x: string): string {
  while (x.startsWith(" ")) {
    x = x.slice(1);
  }
  while (x.endsWith(" ")) {
    x = x.slice(0, x.length - 1);
  }
  return x;
}
export function colorOf(player1: string, player2: string) {
  return `hsl(${(hash(JSON.stringify([player1, player2])) / 12345) * 69}deg 70% 70%)`;
}
export function rotation(nonce: string) {
  return `${Math.sin(hash(nonce) * 1.69) * 3.14}deg`;
}
export function minutesAndSeconds(time: number) {
  const allSeconds = Math.floor(time);
  const displaySeconds = allSeconds % 60;
  const minutesInSeconds = allSeconds - displaySeconds;
  const minutes = minutesInSeconds / 60;
  return `${minutes}:${displaySeconds.toString().padStart(2, "0")}`;
}
export function fromMinutesAndSeconds(time: string) {
  // basically just implement the microwave algorithm, where the hundreds place really just means multiples of 60.
  // this works well if you strip the colon, and if the user doesn't enter a colon in the first place.
  // it is weird that "95" -> 95, but "105" -> 65. This is what your microwave does too.
  const timeNumber = Number(time.replace(":", ""));
  if (timeNumber == null) {
    return undefined;
  }
  const allSeconds = Math.floor(timeNumber);
  const displaySeconds = allSeconds % 100;
  const minutesInHundreds = allSeconds - displaySeconds;
  const minutes = minutesInHundreds / 100;
  return minutes * 60 + displaySeconds;
}
