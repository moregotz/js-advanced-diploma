export default class GameStateService {
  constructor(storage) {
    this.storage = storage;
  }

  save(state) {
    this.storage.setItem('state', JSON.stringify(state));
  }

  saveManual(state) {
    this.storage.setItem('state-save', JSON.stringify(state));
  }

  load() {
    try {
      return JSON.parse(this.storage.getItem('state'));
    } catch (e) {
      throw new Error('Invalid state');
    }
  }

  loadManual() {
    try {
      return JSON.parse(this.storage.getItem('state-save'));
    } catch (e) {
      throw new Error('Invalid state');
    }
  }
}
