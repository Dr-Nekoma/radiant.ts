import { FP } from "./deps.ts";

const CANVAS_WIDTH = 1870;
const CANVAS_HEIGHT = 900;
const PLAYER_WIDTH = 200;
const PLAYER_HEIGHT = 200;
const ENEMY_WIDTH = 70;
const ENEMY_HEIGHT = 70;
const PROJECTILE_WIDTH = 5;
const PROJECTILE_HEIGHT = 5;

// type Weapon = {
//     name: string;
//     experience: number;
// }

type Coordinates = [number, number];

type Spaceship = {
    width: number; 
    height: number;   
    currentCoordinates: Coordinates;
	// experience: Weapon[];
	// comboChain: [string, number];
};

type Enemy = {
    width: number; 
    height: number;       
    currentCoordinates: Coordinates;
    // movement: (arg0: Enemy) => (Enemy);
    // color: string;
    // gunType: Weapon[];
};

// TODO: There is some accumulation of the previous positions of the projectile in the game State. We should fix that.
type Projectile = {
    width: number; 
    height: number;           
    currentCoordinates: Coordinates;
	// color: string;
	// format: string;
	// direction: string;
};

function giveMe(): Projectile {
    return { width: 100, height: 100, currentCoordinates: [100,100]};
}


namespace State {
	export type Done = {
		state: "done";
	}
	export type Going = {
		state: "going";
		game: Game;
	}
}

type Game = {
    // TODO: We should make this as an option to kill the player
    // player: FP.option.Option<Spaceship>;
    player: Spaceship;
	enemies: Enemy[];
	projectiles: Projectile[];
	// enemies
	// 
}

type State = State.Done | State.Going;

namespace Spaceship {
	export function updateCoordinates(s: Spaceship, newC: Coordinates): Spaceship {
		return { ...s, currentCoordinates: newC };
	}

}

let throttleFire = throttle(20, fire);

function fire(state: Game): Game {
	const { player, projectiles } = state;
    const p: Projectile = { currentCoordinates: [player.currentCoordinates[0], player.currentCoordinates[1] - 50], width: PROJECTILE_WIDTH, height: PROJECTILE_HEIGHT };
	return { ...state, projectiles: [...projectiles, p] };
}

function main(): void {
	const canvas = document.querySelector("canvas") as HTMLCanvasElement;
	const context = canvas.getContext("2d") as CanvasRenderingContext2D;
	const imagePlayer = document.querySelector("#ship") as HTMLImageElement;
	const imageEnemy = document.querySelector("#enemy") as HTMLImageElement;
    giveMe();
    let ex: Spaceship = { currentCoordinates: [10, 10], width: PLAYER_WIDTH, height: PLAYER_HEIGHT };
    let en1: Enemy = { currentCoordinates: [100, 100], width: ENEMY_WIDTH, height: ENEMY_HEIGHT };
    let gameState: Game = { projectiles: [], player: ex, enemies: [en1] };
    let input: FP.option.Option<string> = FP.option.none;


	window.addEventListener("load", (e) => {
	    context.drawImage(imagePlayer, ex.currentCoordinates[0], ex.currentCoordinates[1], 200, 200);
	    let handler: number;
	    document.addEventListener("keydown", (event) => {
		clearTimeout(handler);
		input = FP.option.some(event.key);
		handler = setTimeout(() => input = FP.option.none, 16);
	    });
	});

	let time = 0;
	setInterval(() => {
		context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	    gameState = updateWithAction(input, gameState);	    
		gameState = updateProjectiles(gameState);
		context.drawImage(imagePlayer, gameState.player.currentCoordinates[0], gameState.player.currentCoordinates[1], PLAYER_WIDTH, PLAYER_HEIGHT);
		gameState = enemyMovement1(time, gameState);
		context.drawImage(imageEnemy, gameState.enemies[0].currentCoordinates[0], gameState.enemies[0].currentCoordinates[1], ENEMY_WIDTH, ENEMY_HEIGHT);
		gameState.projectiles.forEach(p => {
			context.fillStyle = "0xFF0000";
			context.fillRect(p.currentCoordinates[0], p.currentCoordinates[1], 5, 10);
		});
	    gameState = updatePresence(gameState);
	    time += 0.016;	    
	}, 16);

}

// TODO: Review this folding function, because it does not in fact work. We should use filters.
function updatePresence(gameState: Game) : Game {
    let nextGameState = structuredClone(gameState);
    nextGameState.projectiles = [];
    console.log(gameState.projectiles)
    return FP.array.reduce(nextGameState, (acc: Game, projectile: Projectile) => {
	let shouldRemove = false;
	if (wasHit(nextGameState.player.currentCoordinates, nextGameState.player.width, nextGameState.player.height, projectile)) {
	    shouldRemove = true;
	    console.log("You should have died bud xD");
	}
	nextGameState.enemies = FP.array.reduce([], (acc: Enemy[], enemy: Enemy) => {
	    if (wasHit(enemy.currentCoordinates, enemy.width, enemy.height, projectile)) {
		shouldRemove = true;
		console.log("You should have died bud 2 xD");
		return acc;
	    }
	    acc.push(enemy);
	    return acc;
	})(nextGameState.enemies);
	if (!shouldRemove) {
	    nextGameState.projectiles.push(projectile);
	}	
	return nextGameState;
    })(gameState.projectiles);
}

function wasHit(current: Coordinates, width: number, height: number, projectile: Projectile): boolean {
    let pointUpLeftCorner: Coordinates = projectile.currentCoordinates;
    let pointBottomRightCorner: Coordinates = [projectile.currentCoordinates[0] + projectile.width, projectile.currentCoordinates[1] + projectile.height];

    let entityUpLeftCorner = current;
    let entityBottomRightCorner: Coordinates = [current[0] + width, current[1] + height];
    
    return [pointUpLeftCorner, pointBottomRightCorner].some((point) => {
	return isPointContained(entityUpLeftCorner, entityBottomRightCorner, point);
    });
}

function isPointContained(upLeftCorner: Coordinates, bottomRightCorner: Coordinates, point: Coordinates): boolean {
    let xUpLeftCorner = upLeftCorner[0];
    let yUpLeftCorner = upLeftCorner[1];

    let xBottomRightCorner = bottomRightCorner[0];
    let yBottomRightCorner = bottomRightCorner[1];

    let xPoint = point[0];
    let yPoint = point[1];

    if (xPoint >= xUpLeftCorner && xPoint <= xBottomRightCorner && yPoint >= yUpLeftCorner && yPoint <= yBottomRightCorner){
	return true;
    }
    return false;
}

function enemyMovement1(time: number, g: Game): Game {
	g.enemies[0].currentCoordinates = [150 * Math.abs(Math.cos(time)) + 100, 75 * Math.cos(time) + 100];
	return g;
}

function enemyMovement2(time: number, g: Game): Game {
	g.enemies[0].currentCoordinates = [350 * Math.abs(Math.cos(time)) + 150, 50 * Math.cos(time) + 50];
	return g;
}

function incrementCoordinates(p: Projectile): Projectile {
	let c = p.currentCoordinates;
	return { ...p, currentCoordinates: [c[0], c[1] - 10] };
}

function updateProjectiles(g: Game): Game {
	let ps = g.projectiles;
	return { ...g, projectiles: ps.map(incrementCoordinates) };
}

function updateWithAction(optionKey: FP.option.Option<string>, g: Game): Game {
	let s = g.player;
	let xCoordinate = s.currentCoordinates[0];
	let yCoordinate = s.currentCoordinates[1];
	let newG = structuredClone(g);
	return (FP.option.match(
		() => { return g; },
		(key: string) => {
			if (key == "ArrowRight") {
				xCoordinate += 15;
			} else if (key == "ArrowDown") {
				yCoordinate += 15;
			} else if (key == "ArrowLeft") {
				xCoordinate -= 15;
			} else if (key == "ArrowUp") {
				yCoordinate -= 15;
			} else if (key == "z") {			    
				newG = fire(g);
			}
			return { ...newG, player: Spaceship.updateCoordinates(s, [xCoordinate, yCoordinate]) };
		}
	))(optionKey);
}

function throttle<A, B>(delay: number, func: (arg0: A) => B) {
    let current = Date.now();
    return (args: (A)) => {
	if(Date.now() - current > delay) {
	    func(args);
	    current = Date.now();
	}
    };
}

main();
