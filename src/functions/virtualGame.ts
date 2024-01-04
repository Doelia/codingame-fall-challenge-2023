import {CreatureInvisible, CreatureVisible, Game, VirtualMonster} from "../types";
import {fn} from "./utils";
import {fnFuture} from "./fnFuture";

let virtualCreatures: CreatureInvisible[] = [];

export const fnVirtualGame = {

    jaiVuEnVrai: (c: CreatureVisible, turn: number) => {
        virtualCreatures = virtualCreatures.filter(m => m.creatureId !== c.creatureId);
        virtualCreatures.push({
            ...c,
            lastTurnSeen: turn
        });
    },

    getCreatures(): CreatureInvisible[] {
        return virtualCreatures;
    },

    beginTurn(game: Game) {
        for (let c of game.creaturesVisibles) {
            fnVirtualGame.jaiVuEnVrai(c, game.turnId);
        }
    },

    endTurn(game: Game) {
        for (let c of virtualCreatures) {
            fnFuture.computeFutureAngle(c, [...game.myDrones, ...game.vsDrones], virtualCreatures);
        }
        virtualCreatures = virtualCreatures.filter(c => !fnFuture.vaDispaitre(c));
        for (let c of virtualCreatures) {
            fnFuture.applyNextPosition(c);
        }
    }

}
