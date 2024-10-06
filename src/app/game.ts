function choose<T>(xs: T[]): [T, number] | undefined {
    if (xs.length === 0) { return undefined; }
    const index = Math.floor(Math.random() * xs.length);
    return [xs[index]!, index]
}

function ordered(players: [string, string]) {
    const sorted: [string, string] = [...players];
    sorted.sort();
    return sorted;
}

export class GameIsOver extends Error {};

export class Game {
    constructor(
        public players: Set<string> = new Set(),
        public buzzles: [string, string][] = [],
        private upcomingPairs: [string, string][] = [],
    ) {}

    public static fromJSON(state: {players: string[], buzzles: [string, string][], upcoming: [string, string][]}) {
        return new Game(new Set(state.players), state.buzzles, state.upcoming);
    }

    public toJSON() {
        return {players: [...this.players], buzzles: this.buzzles, upcoming: this.upcomingPairs};
    }

    public addPlayer(player: string) {
        this.players.add(player);
    }

    public addRound(players?: [string, string]) {
        if (players != null) {
            this.buzzles.push(ordered(players));
        } else {
            const next = this.upcoming.shift();
            if (next == null) {
                throw new GameIsOver();
            }
            this.addRound(next);
        }
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
        return this.upcomingPairs.flat().includes(player);
    }

    private untilValid(getPlayers: () => [string, string] | undefined): [string, string] | undefined {
        for (let x = 0; x < 500 ; x += 1) {
            const choice = getPlayers();
            if (choice != null && !this.buzzles.find(([a, b]) => a === choice[0] && b === choice[1])) {
                return choice;
            }
        };
        return undefined;
    }

    private findNextPairingInternal({diameter}: {diameter: number}) {
        const counts = this.buzzleCounts().filter(([player]) => !this.isTooRecent(player));
        const secondPlayerCount = counts[1]?.[1];
        const [firstPlayer, ...otherPlayers] = counts;
        if (firstPlayer == null || secondPlayerCount == null) {
            return undefined;
        }

        const playersMatchingSecond = otherPlayers
            .filter(([_, count]) => count - diameter <= secondPlayerCount)
            .map(([player]) => player);
        
        if (firstPlayer[1] === secondPlayerCount) {
            // player 1 is the same as all the players matching second
            return this.untilValid(() => {
                const candidates = [firstPlayer[0], ...playersMatchingSecond];
                const choice = choose(candidates);
                if (!choice) return undefined;
                const [player1, index] = choice;
                candidates.splice(index, 1);
                const choice2 = choose(candidates);
                if (!choice2) return undefined;
                const [player2] = choice2;
                return ordered([player1, player2]);
            });
        } else {
            // player 1 is priority
            return this.untilValid(() => {
                const choice = choose(playersMatchingSecond);
                if (!choice) return undefined;
                const [player, index] = choice;
                playersMatchingSecond.splice(index, 1);
                return ordered([firstPlayer[0], player]);
            });
        }
    }

    private findNextPairing() {
        for (let diameter = 0; diameter < 3; diameter += 1) {
            const attempt = this.findNextPairingInternal({diameter});
            if (attempt) return attempt;
        }
    }

    private calculateUpcoming() {
        while (this.upcomingPairs.length < 3) {
            const pair = this.findNextPairing();
            if (!pair) { return; }
            this.upcomingPairs.push(pair);
        }
    }

    public get upcoming(): [string, string][] {
        this.calculateUpcoming();
        return this.upcomingPairs;
    }
}