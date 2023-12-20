/**
 * Score points by scanning valuable fish faster than your opponent.
 **/

let creatures = [];

const creatureCount = parseInt(readline());
for (let i = 0; i < creatureCount; i++) {
    var inputs = readline().split(' ');
    const creatureId = parseInt(inputs[0]);
    const color = parseInt(inputs[1]);
    const type = parseInt(inputs[2]);

    creatures[creatureId] = {creatureId, color, type};
}

let turnId = 0;

const targets = [
    {x: 1500, y: 8500},
    {x: 5000, y: 500},
    {x: 8500, y: 8500},
    {x: 5000, y: 500},
]

function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function samePoint(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
}

let myDrones = [];

// game loop
while (true) {

    turnId++;


    const myScore = parseInt(readline());
    const foeScore = parseInt(readline());
    const myScanCount = parseInt(readline());

    // Créatures scannées et remontées
    for (let i = 0; i < myScanCount; i++) {
        const creatureId = parseInt(readline());
    }
    const foeScanCount = parseInt(readline());
    for (let i = 0; i < foeScanCount; i++) {
        const creatureId = parseInt(readline());
    }

    // Mes drones

    const myDroneCount = parseInt(readline());
    for (let i = 0; i < myDroneCount; i++) {
        var inputs = readline().split(' ');
        const id = parseInt(inputs[0]);
        const x = parseInt(inputs[1]);
        const y = parseInt(inputs[2]);
        const emergency = parseInt(inputs[3]);
        const battery = parseInt(inputs[4]);

        let d = myDrones.find(v => v.id === id);
        if (d) {
            d.x = x;
            d.y = y;
        } else {
            myDrones.push({idx: i, id, x, y, emergency, battery, goDown: true});
        }


    }

    // Ses drones
    const foeDroneCount = parseInt(readline());
    for (let i = 0; i < foeDroneCount; i++) {
        var inputs = readline().split(' ');
        const droneId = parseInt(inputs[0]);
        const droneX = parseInt(inputs[1]);
        const droneY = parseInt(inputs[2]);
        const emergency = parseInt(inputs[3]);
        const battery = parseInt(inputs[4]);

    }

    // Créatures scannées
    const droneScanCount = parseInt(readline());
    for (let i = 0; i < droneScanCount; i++) {
        var inputs = readline().split(' ');
        const droneId = parseInt(inputs[0]);
        const creatureId = parseInt(inputs[1]);
    }

    // Créatures visibles
    let monsters = [];
    const visibleCreatureCount = parseInt(readline());
    for (let i = 0; i < visibleCreatureCount; i++) {
        var inputs = readline().split(' ');
        const id = parseInt(inputs[0]);
        const x = parseInt(inputs[1]);
        const y = parseInt(inputs[2]);
        const vx = parseInt(inputs[3]);
        const vy = parseInt(inputs[4]);

        if (creatures[id].color === -1) {
            monsters.push({ id, x, y, vx, vy})
        }
    }

    console.error(monsters);

    const radarBlipCount = parseInt(readline());
    for (let i = 0; i < radarBlipCount; i++) {
        var inputs = readline().split(' ');
        const droneId = parseInt(inputs[0]);
        const creatureId = parseInt(inputs[1]);
        const radar = inputs[2];
    }

    for (let d of myDrones) {

        let goTo = '';
        let debug = [];
        let goTo = d;

        // ON est arrivé ! On change de target
        if (samePoint(d, targets[d.iTarget])) {
            debug.push('arrivé!');
            d.iTarget++;
        }

        if (d.y >= 9000) {
            d.goDown = false;
        }

        if (d.goDown) {
            goTo.y = 9000;
        } else {
            goTo.y = 500;
        }

        let monstersWithDistance = monsters.map(m => ({...m, distance: getDistance(m, d)})).filter(m => m.distance <= 1000);

        let neerestMonster = monstersWithDistance.reduce((p, monster) => {
            if (!p || monster.distance < p.distance) {
                return monster;
            }
            return p;
        }, null);

        if (neerestMonster) {
        }

        console.log('MOVE ' + goTo.x + ' ' + goTo.y + ' 1 ' + debug.join(' '))

        // Write an action using console.log()
        // To debug: console.error('Debug messages...');

        // MOVE <x> <y> <light (1|0)> | WAIT <light (1|0)>

    }
}
