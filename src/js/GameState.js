import themes from './themes.js';

export default class GameState {
  constructor() {
    this.level = 1;
    const [firstTheme] = Object.keys(themes);
    this.theme = firstTheme;
    this.score = 0;
    this.maxScore = 0;
    this.positions = [];
    this.isGameOver = false;
    this.isGameComplete = false;
  }

  static from(object, characterFactory) {
    const state = new GameState();
    state.level = object.level || 1;
    state.theme = object.theme || 'prairie';
    state.score = object.score || 0;
    state.maxScore = object.maxScore || 0;
    state.isGameOver = object.isGameOver || false;
    state.isGameComplete = object.isGameComplete || false;

    if (object.positions && characterFactory) {
      state.positions = object.positions.map((pos) => {
        const data = pos.character;
        const char = characterFactory(data.type, data.level);
        char.health = data.health;
        char.attack = data.attack;
        char.defence = data.defence;
        char.moveRange = data.moveRange;
        char.attackRange = data.attackRange;
        return {
          position: pos.position,
          character: char,
        };
      });
    }
    return state;
  }
}
