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

function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function samePoint(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
}

function radarDirectionToPoint(radar) {
    switch (radar) {
        case 'TL': return {x: 0, y: 0};
        case 'TR': return {x: 10000, y: 0};
        case 'BR': return {x: 10000, y: 10000};
        case 'BL': return {x: 0, y: 10000};
    }
}

function reversePoint(point) {
    return {
        x: -point.x,
        y: -point.y,
    }
}

function randomTarget() {
    return {
        x: Math.floor(Math.random() * 10000),
        y: Math.floor(Math.random() * 10000),
    }
}

function getBottomTarget(idx) {
    if (idx === 0) {
        return {
            x: 2500,
            y: 8000,
        }
    }
    else {
        return {
            x: 7500,
            y: 8000,
        }
    }
}

function getTopTarget(idx) {
    if (idx === 0) {
        return {
            x: 2500,
            y: 500,
        }
    }
    else {
        return {
            x: 7500,
            y: 500,
        }
    }
}

let myDrones = [];

// game loop
while (true) {

    turnId++;
    let radars = [];

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
        const droneId = parseInt(inputs[0]);
        const x = parseInt(inputs[1]);
        const y = parseInt(inputs[2]);
        const emergency = parseInt(inputs[3]);
        const battery = parseInt(inputs[4]);

        let d = myDrones.find(v => v.droneId === droneId);
        if (d) {
            d.x = x;
            d.y = y;
            d.fishesFound = 0;
        } else {
            myDrones.push({
                idx: i,
                droneId, x, y, emergency, battery,
                up: false,
                target: randomTarget(),
                fishesFound: 0,
                lastLightTurn: 0,
            });
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

        let myDrone = myDrones.find(d => d.droneId === droneId);
        if (myDrone) {
            myDrone.fishesFound++;
        }
    }

    // Créatures visibles
    let visibles = [];

    const visibleCreatureCount = parseInt(readline());
    for (let i = 0; i < visibleCreatureCount; i++) {
        var inputs = readline().split(' ');
        const creatureId = parseInt(inputs[0]);
        const x = parseInt(inputs[1]);
        const y = parseInt(inputs[2]);
        const vx = parseInt(inputs[3]);
        const vy = parseInt(inputs[4]);

        let creature = creatures[creatureId];
        visibles.push({ ...creature, x, y, vx, vy });
    }

    const radarBlipCount = parseInt(readline());
    for (let i = 0; i < radarBlipCount; i++) {
        var inputs = readline().split(' ');
        const droneId = parseInt(inputs[0]);
        const creatureId = parseInt(inputs[1]);
        const radar = inputs[2];

        let creature = creatures[creatureId];
        radars.push({
            ...creature,
            droneId,
            direction: radar,
        })
    }

    for (let d of myDrones) {


        let debug = [];

        let monsters = visibles
            .filter(c => c.type === -1)
            .filter(c => getDistance(c, d) < 2000)
            .sort((a, b) => getDistance(a, d) - getDistance(b, d))

        // console.error(d.droneId, monsters);

        // sort by distance
        let visibleFishes = visibles
            .sort((a, b) => getDistance(a, d) - getDistance(b, d))
            .map(c => c.creatureId)

        if (d.y <= 500) {
            d.fishesFound = 0;
            d.up = false;
        }
        if (d.fishesFound >=3 ) {
            d.up = true;
        }
        if (samePoint(d, getBottomTarget(d.idx))) {
            d.up = true;
        }

        // go

        let light = false;

        if (turnId - d.lastLightTurn >= 5) {
            light = true;
        }
        if (monsters.length) {
            debug.push('MONSTER');
            light = false;
        }

        let goTo = null;

        if (monsters.length) {
            let monster = monsters[0];
            // avoid monster
            goTo = {
                x: 30 * (d.x - monster.x),
                y: 30 * (d.y - monster.y),
            }
        } else {

            if (d.up) {
                debug.push('UP');
                goTo = getTopTarget(d.idx);
            } else {
                debug.push('DOWN');
                goTo = getBottomTarget(d.idx);
            }

        }

        // if (d.fuirUntilTurn >= turnId) {
        //     debug.push('FUIR');
        //     goTo = d.fuir;
        // }

        // end

        if (light) {
            debug.push('LIGHT');
            d.lastLightTurn = turnId;
        }

        console.log('MOVE ' + goTo.x + ' ' + goTo.y + ' ' + (light?1:0) + ' ' + debug.join(' '))

    }
}
