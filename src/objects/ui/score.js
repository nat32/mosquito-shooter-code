import { CUSTOM_EVENTS } from '../../components/events/event-bus-component.js';
import * as CONFIG from '../../config.js';

const ENEMY_SCORES = {
  ScoutMosquitoEnemy: CONFIG.ENEMY_SCOUT_SCORE,
  FighterMosquitoEnemy: CONFIG.ENEMY_FIGHTER_SCORE,
};

export class Score extends Phaser.GameObjects.Text {
  #eventBusComponent;
  #score;

  constructor(scene, eventBusComponent) {
    super(scene, scene.scale.width / 2, 20, '0', {
      fontSize: '32px',
      color: '#bd2e54',
    });

    this.scene.add.existing(this);
    this.#eventBusComponent = eventBusComponent;
    this.#score = 0;
    this.setOrigin(0.5);

    this.#eventBusComponent.on(CUSTOM_EVENTS.ENEMY_DESTROYED, (enemy) => {
      if (enemy.constructor.name === 'p') {
        this.#score += 100;
      } else {
        this.#score += 200;
      }
      this.setText(this.#score.toString(10));
    });
  }
}
