import { ColliderComponent } from '../components/collider/collider-component.js';
import { CUSTOM_EVENTS } from '../components/events/event-bus-component.js';
import { HealthComponent } from '../components/health/health-component.js';
import { KeyboardInputComponent } from '../components/input/keyboard-input-component.js';
import { HorizontalMovementComponent } from '../components/movement/horizontal-movement-component.js';
import { WeaponComponent } from '../components/weapon/weapon-component.js';
import * as CONFIG from '../config.js';

export class Player extends Phaser.GameObjects.Container {
  #keyboardInputComponent;
  #weaponComponent;
  #horizontalMovementComponent;
  #healthComponent;
  #colliderComponent;
  #eventBusComponent;
  #playerSprite;

  constructor(scene, eventBusComponent) {
    super(scene, scene.scale.width / 2, scene.scale.height - 32, []);
    this.#eventBusComponent = eventBusComponent;

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.body.setSize(36, 36);
    this.body.setOffset(-18, -18);
    this.body.setCollideWorldBounds(true);
    this.setDepth(2);

    this.#playerSprite = scene.add.sprite(0, 0, 'man');
    this.add([this.#playerSprite]);

    this.#keyboardInputComponent = new KeyboardInputComponent(this.scene);
    this.#horizontalMovementComponent = new HorizontalMovementComponent(
      this,
      this.#keyboardInputComponent,
      CONFIG.PLAYER_MOVEMENT_HORIZONTAL_VELOCITY,
    );

    this.#weaponComponent = new WeaponComponent(this, this.#keyboardInputComponent, {
      speed: CONFIG.PLAYER_BULLET_SPEED,
      lifespan: CONFIG.PLAYER_BULLET_LIFESPAN,
      interval: CONFIG.PLAYER_BULLET_INTERVAL,
      maxCount: CONFIG.PLAYER_BULLET_MAX_COUNT,
      yOffset: -20,
      flipY: false,
    });

    this.#healthComponent = new HealthComponent(CONFIG.PLAYER_HEALTH);
    this.#colliderComponent = new ColliderComponent(this.#healthComponent);

    this.#hide();
    this.#eventBusComponent.on(CUSTOM_EVENTS.PLAYER_SPAWN, this.#spawn, this);

    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    this.once(
      Phaser.GameObjects.Events.DESTROY,
      () => {
        this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
      },
      this,
    );
  }

  get weaponGameObjectGroup() {
    return this.#weaponComponent.bulletGroup;
  }

  get weaponComponent() {
    return this.#weaponComponent;
  }

  get colliderComponent() {
    return this.#colliderComponent;
  }

  get healthComponent() {
    return this.#healthComponent;
  }

  update(timestamp, deltatime) {
    if (!this.active) {
      return;
    }

    if (this.#healthComponent.isDead) {
      this.#hide();
      this.setVisible(true);
      this.#playerSprite.play({
        key: 'explosion',
      });
      this.#eventBusComponent.emit(CUSTOM_EVENTS.PLAYER_DESTROYED);
      return;
    }

    // to add damage to the ship
    this.#playerSprite.setFrame((CONFIG.PLAYER_HEALTH - this.#healthComponent.life).toString(10));
    this.#keyboardInputComponent.update();
    this.#horizontalMovementComponent.update();
    this.#weaponComponent.update(deltatime);
  }

  #hide() {
    this.setActive(false);
    this.setVisible(false);
    this.#keyboardInputComponent.lockInput = true;
  }

  #spawn() {
    this.setActive(true);
    this.setVisible(true);
    this.#playerSprite.setTexture('man', 0);
    this.#healthComponent.reset();
    this.setPosition(this.scene.scale.width / 2, this.scene.scale.height - 32);
    this.#keyboardInputComponent.lockInput = false;
  }
}
