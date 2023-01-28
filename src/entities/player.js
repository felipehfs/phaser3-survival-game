import Phaser from 'phaser'
import MatterEntity from './matterEntity.js';

// 48x48
export default class Player extends MatterEntity {

  constructor(data) {
    super({
      ...data,
      health: 20,
      drops: [],
      name: 'player' 
    })

    this.x = 20
    this.y = 20

    // Weapon
    this.spriteWeapon = new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'items', 162)
    this.spriteWeapon.setScale(0.8)
    this.spriteWeapon.setOrigin(0.25, 0.75)
    this.scene.add.existing(this.spriteWeapon)
    this.touching = []

    const { Bodies, Body } = Phaser.Physics.Matter.Matter
    const playerCollider = Bodies.circle(this.x, this.y, 12, { isSensor: false, label: 'playerCollider' })
    const playerSensor = Bodies.circle(this.x, this.y, 24, { isSensor: true, label: 'playerSensor' })
    const compoundBody = Body.create({
      parts: [playerCollider, playerSensor],
      frictionAir: 0.35
    })

    this.setExistingBody(compoundBody)
    this.setFixedRotation()
    this.createMiningCollisions(playerSensor)
    this.createPickupCollision(playerCollider)
    this.scene.input.on('pointermove', pointer => { if (!this.dead) this.setFlipX(pointer.worldX < this.x) })
  }
 

  static preload(scene) {
    scene.load.audio('player', 'assets/audios/boom_x.wav')
    scene.load.atlas('player', 'assets/characters/player.png', 'assets/characters/player_atlas.json')
    scene.load.animation('player_anim', 'assets/characters/player_anim.json')
    scene.load.spritesheet('items', 'assets/objects/items.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
  }

  onDeath = () => {
    this.anims.stop()
    this.setTexture('items', 0)
    this.setOrigin(0.5)
    this.spriteWeapon.destroy()
  }


  update() {
    if (this.dead) return;
    const speed = 2.5
    const playerVelocity = new Phaser.Math.Vector2()
    if (this.inputKeys.left.isDown) {
      playerVelocity.x = -1
    } else if (this.inputKeys.right.isDown) {
      playerVelocity.x = 1
    }

    if (this.inputKeys.up.isDown) {
      playerVelocity.y = -1
    } else if (this.inputKeys.down.isDown) {
      playerVelocity.y = 1
    }
    playerVelocity.normalize()
    playerVelocity.scale(speed)
    this.setVelocity(playerVelocity.x, playerVelocity.y)
    if (Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.y) > 0.1) {
      this.anims.play('player_right', true)
    } else {
      this.anims.play('idle', true)
    }

    this.spriteWeapon.setPosition(this.x, this.y);
    this.weaponRotate();
  }

  weaponRotate() {
    let pointer = this.scene.input.activePointer;
    if (pointer.isDown) {
      this.weaponRotation += 6;
    } else {
      this.weaponRotation = 0;
    }
    if (this.weaponRotation > 100) {
      this.whackStuff();
      this.weaponRotation = 0;
    }

    if (this.flipX) {
      this.spriteWeapon.setAngle(-this.weaponRotation - 90);
    } else {
      this.spriteWeapon.setAngle(this.weaponRotation);
    }

  }

  createMiningCollisions(playerSensor) {
    this.scene.matterCollision.addOnCollideStart({
      objectA: [playerSensor],
      callback: other => {
        if (other.bodyB.isSensor) return;
        this.touching.push(other.gameObjectB)
      },
      context: this.scene
    }) 

    this.scene.matterCollision.addOnCollideEnd({
      objectA: [playerSensor],
      callback: other => {
        this.touching = this.touching.filter(gameObject => gameObject !== other.gameObjectB)
      },
      context: this.scene
    })
  }
  
  whackStuff() {
    this.touching = this.touching.filter(gameObject => gameObject.hit && !gameObject.dead);
    this.touching.forEach(gameObject => {
      gameObject.hit();
      if (gameObject.dead) gameObject.destroy();
    })
  }

  createPickupCollision(playerCollider) {
    this.scene.matterCollision.addOnCollideStart({
      objectA: [playerCollider],
      callback: other => {
        if (other.gameObjectB && other.gameObjectB.pickup) other.gameObjectB.pickup();
      },
      context: this.scene
    }) 

    this.scene.matterCollision.addOnCollideActive({
      objectA: [playerCollider],
      callback: other => {
        if (other.gameObjectB && other.gameObjectB.pickup) other.gameObjectB.pickup();
      },
      context: this.scene
    })
  }
  
}
