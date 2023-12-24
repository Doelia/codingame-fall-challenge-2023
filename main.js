const game = {
    turnId: 0,
    myDrones: [],
    vsDrones: [],
    creaturesMetas: new Map(),
    creaturesVisibles: [],
    creaturesScanned: [],
    creaturesValidated: [],
    radars: [],
    nMonsters: 0,
}

let fn = {
    getDistance: (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)),
    samePoint: (p1, p2) => p1.x === p2.x && p1.y === p2.y,
    fishTypeToMinMaxY: (fishType) => {
        if (fishType === 0) return [2500, 5000];
        if (fishType === 1) return [5000, 7500];
        if (fishType === 2) return [7500, 10000];
    },
    translatePositionToFishType(position, fishType) {
        const [min, max] = fn.fishTypeToMinMaxY(fishType);
        return {
            x: position.x,
            y: Math.min(Math.max(position.y, min), max),
        }
    },
    radarDirectionToTarget: function(direction) {
        const PADDING = 500;
        switch (direction) {
            case 'TL': return {x: PADDING, y: 0 };
            case 'TR': return {x: 10000 - PADDING, y: 0};
            case 'BR': return {x: 10000 - PADDING, y: 10000};
            case 'BL': return {x: PADDING, y: 10000};
        }
    },
    radarToPosition: function (d, radar) {
        let target = fn.radarDirectionToTarget(radar.direction);
        let fishType = game.creaturesMetas.get(radar.creatureId).type;
        return fn.translatePositionToFishType(target, fishType);
    },
    radarToAngle: function (d, radar) {
        const target = fn.radarToPosition(d, radar);
        return fn.angleTo(d, target);
    },
    reversePoint: function(p) {
        return { x: -p.x, y: -p.y, }
    },
    toRadians: (degrees) => degrees * Math.PI / 180,
    toDegrees: (radians)  => radians * 180 / Math.PI,
    cos: (degrees) => Math.cos(fn.toRadians(degrees)),
    sin: (degrees) =>  Math.sin(fn.toRadians(degrees)),
    turnAtMost(angle, turn, max=360) {
        if (Math.abs(turn) > max) {
            return angle + (turn > 0 ? max : -max);
        } else {
            return angle + turn;
        }
    },
    moveToAngleAtMost(angle, angleTarget, max=360) {
        let sub = fn.substrateAngles(angleTarget, angle);
        return fn.turnAtMost(angle, sub, max);
    },
    angleTo: (from, to) => fn.toDegrees(Math.atan2(to.y - from.y, to.x - from.x)),
    forward: (p, angle, dist= 600) => ({
        x: Math.max(0, Math.min(9999, Math.round(p.x + fn.cos(angle) * dist))),
        y: Math.max(0, Math.min(9999, Math.round(p.y + fn.sin(angle) * dist))),
    }),
    wiggle: (angle, maxAngle) => fn.moduloAngle(angle + (Math.random() * maxAngle) - (Math.random() * maxAngle)),
    moduloAngle: (angle) => (angle % 360) > 0 ? (angle % 360) : (angle % 360) + 360,
    substrateAngles(h1, h2) {
        if (h1 < 0 || h1 >= 360) {
            h1 = (h1 % 360 + 360) % 360;
        }
        if (h2 < 0 || h2 >= 360) {
            h2 = (h2 % 360 + 360) % 360;
        }
        var diff = h1 - h2;
        if (diff > -180 && diff <= 180) {
            return diff;
        } else if (diff > 0) {
            return diff - 360;
        } else {
            return diff + 360;
        }
    },
}

let fn2 = {
    sortRadars(radars) {
        let monsterPerDirection = { TL: 0, TR: 0, BR: 0, BL: 0, };
        for (let r of radars) {
            if (game.creaturesMetas.get(r.creatureId).type === -1) {
                monsterPerDirection[r.direction]++;
            }
        }
        return radars.sort((a, b) => monsterPerDirection[a.direction] - monsterPerDirection[b.direction]);
    },

    getFutureMonsterPosition(monster, projection=1) {
        return fn.forward(monster, monster.nextAngle, projection*monster.nextDistance);
    },

    bestAngleAvoiding(monsters, d, angleWanted) {

        function isGoodAngle(angle) {
            if (getDangerours(monsters, d, angle).length > 0) {
                return false;
            }
            return true;
        }

        // ILs sont dangereux s'ils sont capables de me manger au prochain tour
        function getDangerours(monsters, d, angle) {
            let PAS = 100;
            return monsters.filter(monster => {
                for (let i = 0; i <= PAS; i++) {
                    let nextMyPosition = fn.forward(d, angle, i/PAS * 600);
                    let nextPositionMonster = fn2.getFutureMonsterPosition(monster, i/PAS)
                    let distance = fn.getDistance(nextPositionMonster, nextMyPosition);
                    if (distance <= 510) {
                        return true;
                    }
                }
                return false;
            });
        }

        for (let i = 0; i <= 180; i++) {
            let angle = fn.moduloAngle(angleWanted + i);
            if (isGoodAngle(angle)) {
                return angle;
            }
            angle = fn.moduloAngle(angleWanted - i);
            if (isGoodAngle(angle)) {
                return angle;
            }
        }

        return angleWanted;
    },
}
function initGame() {
    const creatureCount = parseInt(readline());
    for (let i = 0; i < creatureCount; i++) {
        const inputs = readline().split(' ');
        const creatureId = parseInt(inputs[0]);
        const color = parseInt(inputs[1]);
        const type = parseInt(inputs[2]);

        game.creaturesMetas.set(creatureId, {creatureId, color, type});
    }

    game.nMonsters = [...game.creaturesMetas.values()].filter(v => v.type === -1).length;
}

function readInputs() {

    game.turnId++;

    const myScore = parseInt(readline());
    const foeScore = parseInt(readline());

    // Créatures validées
    const myScanCount = parseInt(readline());
    for (let i = 0; i < myScanCount; i++) {
        const creatureId = parseInt(readline());
        if (!game.creaturesValidated.includes(creatureId)) {
            game.creaturesValidated.push(creatureId);
        }
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

        let d = game.myDrones.find(v => v.droneId === droneId);
        if (d) {
            d.x = x;
            d.y = y;
            d.emergency = emergency;
            d.battery = battery;
        } else {
            game.myDrones.push({
                idx: i,
                droneId, x, y, emergency, battery,
                lastLightTurn: 0,
                angle: 90,
                idCreatureTarget: null,
                creaturesScanned: [],
                state: 'DOWN',
            });
        }

        if (emergency) {
            d.creaturesScanned = [];
        }

    }

    // Ses drones
    const foeDroneCount = parseInt(readline());
    for (let i = 0; i < foeDroneCount; i++) {
        var inputs = readline().split(' ');
        const droneId = parseInt(inputs[0]);
        const x = parseInt(inputs[1]);
        const y = parseInt(inputs[2]);
        const emergency = parseInt(inputs[3]);
        const battery = parseInt(inputs[4]);

        let d = game.vsDrones.find(v => v.droneId === droneId);
        if (d) {
            d.x = x;
            d.y = y;
            d.emergency = emergency;
            d.battery = battery;
        } else {
            game.vsDrones.push({ idx: i, droneId, x, y, emergency, battery, });
        }
    }

    // Créatures scannées
    const droneScanCount = parseInt(readline());
    for (let i = 0; i < droneScanCount; i++) {
        var inputs = readline().split(' ');
        const droneId = parseInt(inputs[0]);
        const creatureId = parseInt(inputs[1]);

        let myDrone = game.myDrones.find(d => d.droneId === droneId);
        if (myDrone) {
            if (!myDrone.creaturesScanned.includes(creatureId)) {
                myDrone.creaturesScanned.push(creatureId);
            }
        }

    }

    // Créatures visibles
    game.creaturesVisibles = [];
    const visibleCreatureCount = parseInt(readline());
    for (let i = 0; i < visibleCreatureCount; i++) {
        var inputs = readline().split(' ');
        const creatureId = parseInt(inputs[0]);
        const x = parseInt(inputs[1]);
        const y = parseInt(inputs[2]);
        const vx = parseInt(inputs[3]);
        const vy = parseInt(inputs[4]);

        let creature = game.creaturesMetas.get(creatureId);
        game.creaturesVisibles.push({ ...creature, x, y, vx, vy });
    }

    const radarBlipCount = parseInt(readline());
    game.radars = [];
    for (let i = 0; i < radarBlipCount; i++) {
        var inputs = readline().split(' ');
        const droneId = parseInt(inputs[0]);
        const creatureId = parseInt(inputs[1]);
        const radar = inputs[2];

        let creature = game.creaturesMetas.get(creatureId);
        game.radars.push({
            ...creature,
            droneId,
            direction: radar,
        })
    }
}

function compute() {

    for (let d of game.myDrones) {
        if (d.y <= 500) {
            d.creaturesScanned = [];
            d.idCreatureTarget = null;
        }
    }

    // Compute nextAngle and nextDistance for monsters
    for (let m of game.creaturesVisibles.filter(c => c.type === -1)) {

        const allDrones = [...game.myDrones, ...game.vsDrones];

        let neerestDrone = allDrones
            .filter(d => !d.emergency)
            .filter(d => {
                let lightPuissance = d.lastLightTurn === game.turnId - 1 ? 2000 : 800;
                return fn.getDistance(d, m) < lightPuissance
            })
            .sort((a, b) => fn.getDistance(a, m) - fn.getDistance(b, m))[0];

        if (!neerestDrone) {
            m.nextAngle = fn.moduloAngle(fn.angleTo(m, { x: m.x + m.vx, y: m.y + m.vy }));
            m.nextDistance = Math.sqrt(Math.pow(m.vx, 2) + Math.pow(m.vy, 2));
        } else {
            m.nextAngle =  fn.moduloAngle(fn.angleTo(m, neerestDrone));
            m.nextDistance = 540;
            m.neerestDrone = neerestDrone.droneId;
            // console.error('nerest drone', neerestDrone);
        }

        // console.error('monster', m, fn.forward(m, m.nextAngle, m.nextDistance));

    }

}

initGame();

while (true) {

    readInputs();
    compute();

    let dontScanIt = [
        ...game.myDrones[0].creaturesScanned,
        ...game.myDrones[1].creaturesScanned,
        ...game.creaturesValidated,
    ];

    for (let d of game.myDrones) {

        let debug = [];

        let monstersVisibles = game.creaturesVisibles
            .filter(c => c.type === -1)
            .filter(c => fn.getDistance(c, d) < 2000)
            .sort((a, b) => fn.getDistance(a, d) - fn.getDistance(b, d))

        // Poissons à scanner
        let toCatch = game.radars
            .filter(r => r.droneId === d.droneId)
            .filter(r => game.creaturesMetas.get(r.creatureId).color !== -1)
            .filter(r => !dontScanIt.includes(r.creatureId))
            .filter(r => !game.myDrones.filter(v => v.droneId !== d.droneId).map(v => v.idCreatureTarget).includes(r.creatureId)) // Pas déjà pris par un autre drone
            .sort((a, b) => {
                let pa = fn.radarToPosition(d, a);
                let pb = fn.radarToPosition(d, b);
                return fn.getDistance(pa, d) - fn.getDistance(pb, d);
            })

        // compute state

        if (d.state === 'DOWN' && d.y >= 8000) {
            d.state = 'UP';
        }

        if (d.state === 'UP' && d.y <= 500) {
            d.state = 'SEARCH';
            d.angle = 90;
        }

        if (!toCatch.length) {
            d.state = 'FINISHED';
        }

        // Compute angle

        if (d.state === 'DOWN') {
            d.idCreatureTarget = null;
            d.angle = 90;
            debug.push('DOWN');
        }

        if (d.state === 'UP') {
            d.idCreatureTarget = null;
            d.angle = 270;
            debug.push('UP')
        }

        if (d.state === 'SEARCH') {
            if (
                !d.idCreatureTarget // Plus de target
                || dontScanIt.includes(d.idCreatureTarget)
                || !game.radars.map(v => v.creatureId).includes(d.idCreatureTarget) // on le trouve plus sur la map
            ) {
                if (toCatch[0]) {
                    d.idCreatureTarget = toCatch[0]?.creatureId;
                }
            }

            let radarOfTarget = toCatch.find(r => r.creatureId === d.idCreatureTarget);
            if (radarOfTarget) {
                let angleToTarget = fn.radarToAngle(d, radarOfTarget);
                d.angle = fn.moduloAngle(fn.moveToAngleAtMost(d.angle, angleToTarget, 45));
            }
            debug.push('T=' + d.idCreatureTarget);
        }

        if (d.state === 'FINISHED') {
            debug.push('FINISHED');
            d.angle = 270;
        }

        d.angle = fn2.bestAngleAvoiding(monstersVisibles, d, d.angle);

        // Compute light

        let light = false;

        // On allume la light si ça fait longtemps
        if (game.turnId - d.lastLightTurn >= 2 && d.state !== 'FINISHED') {
            if (d.y > 2000) {
                light = true;
            }
        }

        // SENDING

        let goTo = fn.forward(d, d.angle, 600);

        if (light) {
            debug.push('LIGHT');
            d.lastLightTurn = game.turnId;
        }

        console.log('MOVE ' + goTo.x + ' ' + goTo.y + ' ' + (light?1:0) + ' ' + debug.join(' '))

    }
}
