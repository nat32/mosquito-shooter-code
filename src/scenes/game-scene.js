import { EnemySpawnerComponent } from '../components/spawners/enemy-spawner-component.js';
import Phaser from '../lib/phaser.js';
import { FighterMosquitoEnemy } from '../objects/enemies/fighter-mosquito-enemy.js';
import { ScoutMosquitoEnemy } from '../objects/enemies/scout-mosquito-enemy.js';
import { Player } from '../objects/player.js';
import * as CONFIG from '../config.js';
import { CUSTOM_EVENTS, EventBusComponent } from '../components/events/event-bus-component.js';
import { EnemyDestroyedComponent } from '../components/spawners/enemy-destroyed-component.js';
import { Score } from '../objects/ui/score.js';
import { Lives } from '../objects/ui/lives.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.load.pack('asset_pack', 'assets/data/assets.json');
  }

  create() {
    const eventBusComponent = new EventBusComponent();
    const player = new Player(this, eventBusComponent);

    const scoutSpawner = new EnemySpawnerComponent(
      this,
      ScoutMosquitoEnemy,
      {
        interval: CONFIG.ENEMY_SCOUT_GROUP_SPAWN_INTERVAL,
        spawnAt: CONFIG.ENEMY_SCOUT_GROUP_SPAWN_START,
      },
      eventBusComponent,
    );

    const fighterSpawner = new EnemySpawnerComponent(
      this,
      FighterMosquitoEnemy,
      {
        interval: CONFIG.ENEMY_FIGHTER_GROUP_SPAWN_INTERVAL,
        spawnAt: CONFIG.ENEMY_FIGHTER_GROUP_SPAWN_START,
      },
      eventBusComponent,
    );

    new EnemyDestroyedComponent(this, eventBusComponent);

    // collisions for player and enemy groups
    this.physics.add.overlap(
      player,
      scoutSpawner.phaserGroup,
      (/** @type {Player}*/ playerGameObject, /** @type {ScoutMosquitoEnemy}*/ enemyGameObject) => {
        if (!playerGameObject.active || !enemyGameObject.active) {
          return;
        }
        playerGameObject.colliderComponent.collideWithEnemyShip();
        enemyGameObject.colliderComponent.collideWithEnemyShip();
      },
    );

    this.physics.add.overlap(
      player,
      fighterSpawner.phaserGroup,
      (/** @type {Player}*/ playerGameObject, /** @type {FighterMosquitoEnemy}*/ enemyGameObject) => {
        if (!playerGameObject.active || !enemyGameObject.active) {
          return;
        }
        playerGameObject.colliderComponent.collideWithEnemyShip();
        enemyGameObject.colliderComponent.collideWithEnemyShip();
      },
    );

    eventBusComponent.on(CUSTOM_EVENTS.ENEMY_INIT, (gameObject) => {
      if (gameObject.constructor.name !== 'FighterMosquitoEnemy') {
        return;
      }

      this.physics.add.overlap(
        player,
        gameObject.weaponGameObjectGroup,
        (
          /** @type {Player}*/ playerGameObject,
          /** @type {Phaser.Types.Physics.Arcade.SpriteWithDynamicBody}*/ projectileGameObject,
        ) => {
          if (!playerGameObject.active || !projectileGameObject.active) {
            return;
          }
          gameObject.weaponComponent.destroyBullet(projectileGameObject);
          playerGameObject.colliderComponent.collideWithEnemyProjectile();
        },
      );
    });

    // collisions for player weapons and enemy groups
    this.physics.add.overlap(
      scoutSpawner.phaserGroup,
      player.weaponGameObjectGroup,
      (
        /** @type {ScoutMosquitoEnemy}*/ enemyGameObject,
        /** @type {Phaser.Types.Physics.Arcade.SpriteWithDynamicBody}*/ projectileGameObject,
      ) => {
        if (!enemyGameObject.active || !projectileGameObject.active) {
          return;
        }
        player.weaponComponent.destroyBullet(projectileGameObject);
        enemyGameObject.colliderComponent.collideWithEnemyProjectile();
      },
    );

    this.physics.add.overlap(
      fighterSpawner.phaserGroup,
      player.weaponGameObjectGroup,
      (
        /** @type {FighterMosquitoEnemy}*/ enemyGameObject,
        /** @type {Phaser.Types.Physics.Arcade.SpriteWithDynamicBody}*/ projectileGameObject,
      ) => {
        if (!enemyGameObject.active || !projectileGameObject.active) {
          return;
        }
        player.weaponComponent.destroyBullet(projectileGameObject);
        enemyGameObject.colliderComponent.collideWithEnemyProjectile();
      },
    );

    new Score(this, eventBusComponent);
    new Lives(this, eventBusComponent);
  }
}
