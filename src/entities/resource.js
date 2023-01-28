import MatterEntity from "./matterEntity";

export default class Resource extends MatterEntity {
    static preload(scene) {
        scene.load.atlas('resources', 'assets/obstacles/obstacles.png', 'assets/obstacles/obstacles_atlas.json')
        scene.load.audio('tree', 'assets/audios/hitHurt.wav')
        scene.load.audio('roots', 'assets/audios/hitHurt.wav')
        scene.load.audio('rock', 'assets/audios/hitHurt.wav')
        scene.load.audio('pickup', 'assets/audios/pickupCoin.wav')
    }

    constructor(data) {
        let { scene, resource } = data
        const drops = JSON.parse(resource.properties.find(p => p.name === 'drops').value)
        const depth = JSON.parse(resource.properties.find(p => p.name === 'depth').value)
        super({
            scene, x: resource.x, y: resource.y, texture: 'resources',
            frame: resource.type, drops, depth,
            health: 5,
            name: resource.type
        })
        
        let yOrigin = resource.properties.find(p => p.name === 'yOrigin').value
        this.y = this.y + this.height * (yOrigin - 0.5)
        const { Bodies } = Phaser.Physics.Matter.Matter
        const circleCollider = Bodies.circle(this.x, this.y, 12, { isSensor: false, label: 'collider' })
        this.setExistingBody(circleCollider)
        this.setStatic(true)
        this.setOrigin(0.5, yOrigin)
    }

}