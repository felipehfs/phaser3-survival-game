import MatterEntity from "./matterEntity";

export default class Enemy extends MatterEntity {

    static preload(scene) {
        scene.load.atlas('enemies', 'assets/enemies/enemies.png', 'assets/enemies/enemies_atlas.json')
        scene.load.animation('enemies_anim', 'assets/enemies/enemies_anim.json')
        scene.load.audio('bear', 'assets/audios/bear.wav')
        scene.load.audio('wolf', 'assets/audios/wolf.wav')
        scene.load.audio('ent', 'assets/audios/ent.wav')
    }

    constructor(data) {
        let { scene, enemy } = data
        const drops = JSON.parse(enemy.properties.find(p => p.name === 'drops').value)
        const health = JSON.parse(enemy.properties.find(p => p.name === 'health').value)
        super({
            scene, x: enemy.x, y: enemy.y, texture: 'enemies', frame: `${enemy.name}_idle_1`,
            drops, health, name: enemy.name
        })

        this.attackTimer = null;
        const { Bodies, Body } = Phaser.Physics.Matter.Matter
        const enemyCollider = Bodies.circle(this.x, this.y, 12, { isSensor: false, label: 'enemyCollider' })
        const enemySensor = Bodies.circle(this.x, this.y, 80, { isSensor: true, label: 'enemySensor' })
        const compoundBody = Body.create({
          parts: [enemyCollider, enemySensor],
          frictionAir: 0.35
        })
    
        this.setExistingBody(compoundBody)
        this.setFixedRotation()
        this.scene.matterCollision.addOnCollideStart({
            objectA: [enemySensor],
            callback: other => {
                if (other.gameObjectB && other.gameObjectB.name === 'player') {
                    this.attacking = other.gameObjectB
                } 
            },
            context: this.scene,
        })
    }

    attack = (target) => {
        if (target.dead || this.dead) {
            clearInterval(this.attackTimer);
            return;
        }
        target.hit();
    }

    update() {
        if (this.dead) return
        if (this.attacking) {
            let direction = this.attacking.position.subtract(this.position)
            if (direction.length() > 24) {
                let v = direction.normalize()
                this.setVelocityX(v.x)
                this.setVelocityY(v.y)
                
                if (this.attackTimer) {
                    clearInterval(this.attackTimer)
                    this.attackTimer = null
                }

            } else {
                if (this.attackTimer === null) {
                    this.attackTimer = setInterval(this.attack, 500, this.attacking)
                }
            }

        }
        
        this.setFlipX(this.velocity.x < 0)
        if (Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.y) > 0.1) {
              this.anims.play(`${this.name}_walk`, true)
        } else {
              this.anims.play(`${this.name}_idle`, true)
        }
    }
}