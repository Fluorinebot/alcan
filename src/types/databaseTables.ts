export interface Case {
    id: number;
    guild: string;
    user: string;
    creator: string;
    type: 'ban' | 'kick' | 'timeout' | 'warn';
    reason: string;
}
