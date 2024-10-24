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
