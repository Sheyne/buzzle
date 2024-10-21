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

type StateJson = {players: string[], buzzles: [string, string, number][], upcoming: [string, string][]};

export class Game {
    constructor(
        public players: Set<string> = new Set(),
        public buzzles: Map<[string, string], number> = new Map(),
        private upcomingPairs: [string, string][] = [],
    ) {}

    public static fromJSON(state: StateJson) {
        return new Game(new Set(state.players), new Map(state.buzzles.map(([p1, p2, time]) => [[p1, p2], time])), state.upcoming);
    }

    public toJSON(): StateJson {
        return {players: [...this.players], buzzles: [...this.buzzles.entries()].map<[string, string, number]>(([[p1, p2], time]) => [p1, p2, time]), upcoming: this.upcomingPairs};
    }

    public addPlayer(player: string) {
        this.players.add(player);
    }

    public resetUpcoming() {
        this.upcomingPairs = [];
    }

    public addRound(players: [string, string], time: number) {
        const orderedPlayers = ordered(players);
        this.buzzles.set(orderedPlayers, time);
        const nextPlayers = this.upcoming[0];
        if (nextPlayers && nextPlayers[0] === players[0] && nextPlayers[1] === players[1]) {
            this.upcoming.shift();
        }
    }

    public buzzleCounts(): [string, number][] {
        const result = new Map<string, number>([...this.players].map(p => [p, 0]));
        for (const players of this.buzzles.keys()) {
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
            if (choice != null && ![...this.buzzles.keys()].find(([a, b]) => a === choice[0] && b === choice[1])) {
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