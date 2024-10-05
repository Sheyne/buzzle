function choose<T>(xs: T[]): [T, number] {
    const index = Math.floor(Math.random() * xs.length);
    return [xs[index], index]
}

function ordered(players: [string, string]) {
    const sorted: [string, string] = [...players];
    sorted.sort();
    return sorted;
}

export class Game {
    constructor(
        public players: Set<string> = new Set(),
        public buzzles: [string, string][] = []
    ) {}

    public copy(): Game {
        return new Game(new Set(this.players), [...this.buzzles]);
    }

    public addPlayer(player: string) {
        this.players.add(player);
    }

    public addRound(players: [string, string]) {
        this.buzzles.push(ordered(players));
    }

    private buzzleCounts(): [string, number][] {
        const result = new Map<string, number>([...this.players].map(p => [p, 0]));
        for (const players of this.buzzles) {
            for (const player of players) {
                result.set(player, (result.get(player) ?? 0) + 1);
            }
        }
        const counts = [...result.entries()];
        counts.sort(([_1, a], [_2, b]) => a - b);
        return counts;
    }

    private isTooRecent(player: string) {
        const mostRecentPair = this.buzzles[this.buzzles.length - 1];
        return mostRecentPair.includes(player);
    }

    private untilValid(getPlayers: () => [string, string]): [string, string] {
        let choice: [string, string];
        do {
            choice = getPlayers();
        } while (this.buzzles.find(([a, b]) => a === choice[0] && b === choice[1]));
        return choice;
    }

    public findNextPairing() {
        const counts = this.buzzleCounts().filter(([player]) => !this.isTooRecent(player));
        const secondPlayerCount = counts[1][1];
        if (secondPlayerCount == null) {
            // todo: no valid options
        }
        const playersMatchingSecond = counts
            .filter(([_, count]) => count === secondPlayerCount)
            .map(([player]) => player);
        
        if (counts[0][1] === secondPlayerCount) {
            // player 1 is the same as all the players matching second
            return this.untilValid(() => {
                // todo: if we run out, look into more played players
                const candidates = [...playersMatchingSecond];
                const [player1, index] = choose(candidates);
                candidates.splice(index, 1);
                const [player2] = choose(candidates);
                return ordered([player1, player2]);
            });
        } else {
            // player 1 is priority
            return this.untilValid(() => {
                if (playersMatchingSecond.length === 0) {
                    // todo: fetch more people
                }
                const [player, index] = choose(playersMatchingSecond);
                playersMatchingSecond.splice(index, 1);
                return ordered([counts[0][0], player]);
            });
        }
    }

    public upcoming(): [string, string][] {
        const first = this.findNextPairing();
        const next = this.copy();
        next.addRound(first);
        const second = next.findNextPairing();
        const after = next.copy();
        after.addRound(second);
        return [first, second, after.findNextPairing()];
    }
}