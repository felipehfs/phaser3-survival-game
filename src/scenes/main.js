import Phaser from 'phaser'
import Enemy from '../entities/enemy.js'
import Player from '../entities/player.js'
import Resource from '../entities/resource.js'

export default class MainScene extends Phaser.Scene {
  constructor () {
    super('MainScene')
    this.enemies = []
  }

  preload () {
    Resource.preload(this)
    Enemy.preload(this)
    Player.preload(this)
    this.load.image('tiles', 'assets/tilesets/plains.png')
    this.load.tilemapTiledJSON('map', 'assets/tilesets/map.json')
  }

  create () {
    const map = this.make.tilemap({ key: 'map' })
    this.map = map
    const tileset = map.addTilesetImage('plains', 'tiles', 16, 16, 0, 0)

    const layer1 = map.createLayer('Camada de Tiles 1', tileset)
    const layer2 = map.createLayer('Camada de Tiles 2', tileset)

    layer1.setCollisionByProperty({ collides: true })
    layer2.setCollisionByProperty({ collides: true })

    this.matter.world.convertTilemapLayer(layer1)
    this.matter.world.convertTilemapLayer(layer2)
    
    this.player = new Player({ scene: this, x: 32, y: 32, texture: 'player', frame: 'player_0' })
    this.add.existing(this.player)
    this.map.getObjectLayer('Resources').objects.forEach((resource) => {
      new Resource({
        scene: this,
        resource
      })
    })
    this.map.getObjectLayer('Enemies').objects.forEach((enemy) => {
      this.enemies.push(new Enemy({
        scene: this,
        enemy
      }))
    })

    this.player.inputKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    })

    let camera = this.cameras.main;
    camera.zoom = 2;
    camera.startFollow(this.player)
    camera.setLerp(0.1, 0.1);
    camera.setBounds(0, 0, this.game.config.width, this.game.config.height)
  }

  update() {
    this.enemies.forEach(enemy => enemy.update())
    this.player.update()
  }
}
