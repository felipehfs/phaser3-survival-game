import PhaserMatterCollisionPlugin from 'phaser-matter-collision-plugin'
import Phaser from 'phaser'
import MainScene from './scenes/main'

const config = {
  width: 512,
  height: 512,
  backgroundColor: '#999',
  type: Phaser.AUTO,
  parent: 'survival-game',
  scene: [MainScene],
  scale: {
    zoom: 2
  },
  physics: {
    default: 'matter',
    matter: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  plugins: {
    scene: [
      {
        plugin: PhaserMatterCollisionPlugin,
        key: 'matterCollision',
        mapping: 'matterCollision'
      }
    ]
  }
}

new Phaser.Game(config)
