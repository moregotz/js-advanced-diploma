import GameState from '../src/js/GameState.js';

describe('GameState', () => {
    test('base_constructor_states', () => {
        const state = new GameState();
        expect(state.level).toBe(1);
        expect(state.theme).toBe('prairie');
        expect(state.score).toBe(0);
        expect(state.maxScore).toBe(0);
        expect(state.positions).toEqual([]);
        expect(state.isGameOver).toBe(false);
        expect(state.isGameComplete).toBe(false);
    });

    test('return_state', () => {
        const object = {
            level: 3,
            theme: 'arctic',
            score: 500,
            maxScore: 1000,
            isGameOver: false,
            isGameComplete: false,
            positions: [],
        };
        const state = GameState.from(object, () => null);
        expect(state.level).toBe(3);
        expect(state.theme).toBe('arctic');
        expect(state.score).toBe(500);
        expect(state.maxScore).toBe(1000);
    });

    test('use_state', () => {
        const state = GameState.from({}, () => null);
        expect(state.level).toBe(1);
        expect(state.theme).toBe('prairie');
        expect(state.score).toBe(0);
    });

    test('chars_state', () => {
        const mockChar = {
            type: 'bowman',
            level: 2,
            health: 90,
            attack: 30,
            defence: 30,
            moveRange: 2,
            attackRange: 2,
        };
        const chars = jest.fn(() => ({ ...mockChar }));

        const object = {
            positions: [{ position: 5, character: mockChar }],
        };

        const state = GameState.from(object, chars);
        expect(chars).toHaveBeenCalledWith('bowman', 2);
        expect(state.positions).toHaveLength(1);
        expect(state.positions[0].position).toBe(5);
        expect(state.positions[0].character.health).toBe(90);
    });

    test('from() корректно обрабатывает отсутствие positions', () => {
        const state = GameState.from({}, () => null);
        expect(state.positions).toEqual([]);
    });

    test('from() корректно обрабатывает отсутствие characterFactory', () => {
        const object = {
            positions: [{ position: 5, character: { type: 'bowman', level: 2 } }],
        };
        const state = GameState.from(object, null);
        expect(state.positions).toEqual([]);
    });
});