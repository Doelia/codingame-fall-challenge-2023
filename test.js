
let fn = {
    getDistance: (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)),
    samePoint: (p1, p2) => p1.x === p2.x && p1.y === p2.y,
    radarDirectionToAngle: function (radar) {
        switch (radar) {
            case 'TL': return 45 + 90*2;
            case 'TR': return 45 + 90*3;
            case 'BR': return 45;
            case 'BL': return 45 + 90;
        }
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
    inGameLimits(position, paddingX=800) {
        return position.x > paddingX && position.x < 10000 - paddingX;
    }
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

    // TODO essayer de rester un peu plus loin, si possible
    bestAngleAvoiding(monsters, d, angleWanted) {

        function isGoodAngle(angle) {
            if (getDangerours(monsters, d, angle).length > 0) {
                return false;
            }
            let myNextPosition = fn.forward(d, angle, 600);
            if (!fn.inGameLimits(myNextPosition)) {
                // return false;
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
                    if (distance <= 500) {
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
    // retourne 'L' ou 'R' s'il la créature est à gauche ou a droite du drone
    getSideOfFishOnRadars(creatureId, droneId) {
        let radar = game.radars.find(r => r.creatureId === creatureId && r.droneId === droneId)
        if (!radar) return '?';
        return radar.direction.slice(-1);
    },
    getFishesWithSides() {
        return [...game.creaturesMetas.values()].map(c => {
            let side1 = fn2.getSideOfFishOnRadars(c.creatureId, game.myDrones[0].droneId);
            let side2 = fn2.getSideOfFishOnRadars(c.creatureId, game.myDrones[1].droneId);
            if (side1 !== side2) {
                return {...c, side: 'MIDDLE'};
            }
            if (side1 === 'L' && side2 === 'L') {
                return {...c, side: 'LEFT'};
            }
            if (side1 === 'R' && side2 === 'R') {
                return {...c, side: 'RIGHT'};
            }
            return {...c, side: '??'};
        });
    }
}

console.log(fn.turnAtMost(90, 40, 20), 110);
console.log(fn.moduloAngle(fn.turnAtMost(0, -10, 20)), 350);
console.log(fn.moduloAngle(fn.turnAtMost(350, 40, 20)), 10);
console.log(fn.moduloAngle(fn.moveToAngleAtMost(0, 90, 45)), 45);
console.log(fn.moduloAngle(fn.moveToAngleAtMost(90, 0, 45)), 45);
console.log(fn.moduloAngle(fn.moveToAngleAtMost(90, -20, 360)), 340);

let m = {
    x: 6441,
    y: 6423,
};

let d = {
    x: 6230,
    y: 6879,
}

m.nextAngle =  fn.moduloAngle(fn.angleTo(m, d));
m.nextDistance = 540;
console.log(fn.forward(m, m.nextAngle, m.nextDistance));
