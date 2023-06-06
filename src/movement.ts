import { FP } from "../deps.ts";

declare global {
  var debug: boolean;
}

export namespace Common {
    export type Coordinates = [number, number];

    function normalizeToBottomRight(coordinates: Coordinates, width: number, height: number): Coordinates {
	return [coordinates[0] + (width / 2), coordinates[1] + (height / 2)];	
    }

    export function normalizeToUpLeft(coordinates: Coordinates, width: number, height: number): Coordinates {
	return [coordinates[0] - (width / 2), coordinates[1] - (height / 2)];	
    }
        
    export function wasHit(current: Coordinates, width: number, height: number, projectile: Projectile.Entity): boolean {
	let pointUpLeftCorner: Coordinates = projectile.currentCoordinates;
	let pointBottomRightCorner: Coordinates = [projectile.currentCoordinates[0] + projectile.width, projectile.currentCoordinates[1] + projectile.height];


	let entityUpLeftCorner = normalizeToUpLeft(current, width, height);
	let entityBottomRightCorner: Coordinates = normalizeToBottomRight(current, width, height);
	
	return [pointUpLeftCorner, pointBottomRightCorner].some((point) => {
	    return isPointContained(entityUpLeftCorner, entityBottomRightCorner, point);
	});
    }
    
    export function isPointContained(upLeftCorner: Coordinates, bottomRightCorner: Coordinates, point: Coordinates): boolean {
	// let xUpLeftCorner = upLeftCorner[0];
	// let yUpLeftCorner = upLeftCorner[1];
	const [xUpLeftCorner, yUpLeftCorner] = upLeftCorner;
	
	let xBottomRightCorner = bottomRightCorner[0];
	let yBottomRightCorner = bottomRightCorner[1];

	let xPoint = point[0];
	let yPoint = point[1];
	
	if (xPoint >= xUpLeftCorner && xPoint <= xBottomRightCorner && yPoint >= yUpLeftCorner && yPoint <= yBottomRightCorner){
	    return true;
	}
	return false;
    }

    // This is a browser not math, that means that we need conversion, a.k.a, +90 xD
    export function calculateAngle(p1: Coordinates, p2: Coordinates): number {
	const [x1, y1] = p1;
	const [x2, y2] = p2;
	return (Math.atan2(y2 - y1, x2 - x1 ) * ( 180 / Math.PI )) + 90;
    }
}

export namespace Player {
    export type Entity = {
	width: number; 
	height: number;   
	currentCoordinates: Common.Coordinates;
	weapons: Weapon.Entity[];
	// comboChain: [string, number];
    };

    export function create(): Entity {
		let wp: Weapon.Entity = { name: "Pistol", experience: 15};
		let e: Entity = { currentCoordinates: [State.INITIAL_X, State.INITIAL_Y], width: WIDTH, height: HEIGHT, weapons: [wp]};
		return e;
    }
    
    export function updateCoordinates(s: Entity, newC: Common.Coordinates): Entity {
		return { ...s, currentCoordinates: newC };
    }
	
    // TODO: change "any" by the actual type
    export function initUpdateWithAction(): any {
        const fire = throttle(Weapon.fire, 250);

        function updateWithAction(optionKey: FP.option.Option<string>, g: State.Game): State.Game {
		
            let s = g.player;
            let xCoordinate = s.currentCoordinates[0];
            let yCoordinate = s.currentCoordinates[1];
            return (FP.option.match(
                () => { return g; },
                (key: string) => {
		    if (g.status == "Going") {
			if (key == "ArrowRight") {
			    xCoordinate += 15;
			} else if (key == "ArrowDown") {
			    yCoordinate += 15;
			} else if (key == "ArrowLeft") {
			    xCoordinate -= 15;
			} else if (key == "ArrowUp") {
			    yCoordinate -= 15;
			} else if (key == "z") {			
			    const newProjectile = fire(s.currentCoordinates, s.weapons[0], FP.option.some(0), FP.option.none, "Player");
			    g = { ...g, projectiles: [...g.projectiles, ...newProjectile] };
			} else if (key == "x") {
			    g = { ...g, status: "Pause" };
			}
		    } else if (g.status == "Pause") {
			if (key == "x") {
			    console.log("I pressed X")
			    g = { ...g, status: "Going" };
			}
		    }
                    return { ...g, player: updateCoordinates(s, [xCoordinate, yCoordinate]) };
                }
            ))(optionKey);
        }

        return updateWithAction;

    } 

    export const WIDTH = 200;
    export const HEIGHT = 200;
	
}

export namespace Enemy {    
    export type Entity = {
	width: number; 
	height: number;       
	currentCoordinates: Common.Coordinates;
	movement: (time: number, en: Entity) => Entity;
	timeBetweenShots: number;
	lastTimeAttack: number;
	weapon: Weapon.Entity;
	// color: string;
	// gunType: Weapon[];
    };

    export function create(betweenShots: FP.option.Option<number>): Entity {
		let wp: Weapon.Entity = { name: "Pistol", experience: 15};
		let en: Entity = { currentCoordinates: [500, 500], 
				   width: WIDTH, height: HEIGHT, 
				   movement: movement1,
				   timeBetweenShots: FP.option.getOrElse(() => DEFAULT_TIME_BETWEEN_SHOTS)(betweenShots),
				   weapon: wp,
				   lastTimeAttack: 0};
		return en;
    }

    export function attack(coordinates: Common.Coordinates, wp: Weapon.Entity, angle: FP.option.Option<number>, speed: FP.option.Option<number>): Projectile.Entity {
	return Weapon.fire(coordinates, wp, angle, speed, "Enemy");
    }

    function movement1(time: number, en: Entity): Entity {
	en.currentCoordinates = [150 * Math.abs(Math.cos(time)) + 700, 75 * Math.cos(time) + 700];
	return en;
    }
    
    function movement2(time: number, e: Entity): Entity {
		e.currentCoordinates = [350 * Math.abs(Math.cos(time)) + 150, 50 * Math.cos(time) + 50];
		return e;
    }

    export const DEFAULT_TIME_BETWEEN_SHOTS = 5;
    export const WIDTH = 70;
    export const HEIGHT = 70;
}

function throttle(fn: (...args: any[]) => any, delay: number): any {
	let shouldWait = false;
  
	return (...args:any[]) => {
	  if (shouldWait) return [];
  
	  shouldWait = true;

	  setTimeout(() => {
		shouldWait = false
	  }, delay);

	  return [fn(...args)];
	}
  }

function updateIn(obj: any, keys: string[], value: any): any {
	if (keys.length === 0) {
		return value;
	}
    
    const [key, ...nextKeys] = keys;

    return {
        ...obj,
        [key]: updateIn(obj[key], nextKeys, value),
    };
};

export namespace Weapon {
    export type Entity = {
        name: string;
        experience: number;
    }

    export function fire(coordinates: Common.Coordinates, wp: Entity, angle: FP.option.Option<number>, speed: FP.option.Option<number>, kind: Projectile.Kind): Projectile.Entity {
	return Projectile.createProjectile(wp, coordinates, angle, speed, kind);
    }
	
}

export namespace Projectile {

    export type Kind = "Enemy" | "Player";
    
    // TODO: There is some accumulation of the previous positions of the projectile in the game State. We should fix that.
    export type Entity = {
	id: number;
	width: number; 
	height: number;           
	currentCoordinates: Common.Coordinates;
	weaponSource: Weapon.Entity;
	angle: number;
	speed: number;
	kind: Kind;
	// color: string;
	// format: string;
	// direction: string;
    };
    
    export function incrementCoordinates(p: Entity): Entity {
	let [x, y] = p.currentCoordinates;
	let newAngle = (p.angle - 90) * (Math.PI / 180);
	return { ...p, currentCoordinates: [x + Math.cos(newAngle) * p.speed, y + Math.sin(newAngle) * p.speed] };
    }

    export function createProjectile(weapon: Weapon.Entity,
				     coordinates: Common.Coordinates,
				     angle: FP.option.Option<number>,
				     speed: FP.option.Option<number>,
				     kind: Kind): Projectile.Entity {
	const p: Projectile.Entity = { currentCoordinates: [coordinates[0], coordinates[1]],
								   width: WIDTH, height: HEIGHT,
			               id: projectileCounter, weaponSource: weapon,
				       angle: FP.option.getOrElse(() => DEFAULT_ANGLE)(angle),
				       speed: FP.option.getOrElse(() => DEFAULT_SPEED)(speed),
				       kind: kind};
	projectileCounter += 1;
	return p;
    }

    let projectileCounter = 0;
    export const DEFAULT_ANGLE = 0;
    export const DEFAULT_SPEED = 5;
    export const WIDTH = 5;
    export const HEIGHT = 5;
}


export namespace State {
    
    type Status = "Done" | "Pause" | "Going";

    // TODO: Separate the projectiles from enemies and player
    export type Game = {
	// TODO: We should make this as an option to kill the player
	player: Player.Entity;
	enemies: Enemy.Entity[];
	projectiles: Projectile.Entity[];
	score: number;
	status: Status;
    }

    export function initGame(): Game {
	let p = Player.create();
	let en = Enemy.create(FP.option.none);
	let s = 0;
	let initialStatus: Status = "Going";
	globalThis.debug = Configuration.DEBUG;
	return { status: initialStatus, projectiles: [], player: p, enemies: [en], score: s };
    }

    export function draw(gameState: Game) {
	Configuration.context.clearRect(0, 0, Configuration.WIDTH, Configuration.HEIGHT);
	const playerCoords = Common.normalizeToUpLeft(gameState.player.currentCoordinates, Player.WIDTH, Player.HEIGHT);
	gameState.enemies.forEach(e => {
	    let eCoords = Common.normalizeToUpLeft(e.currentCoordinates, Enemy.WIDTH, Enemy.HEIGHT);
	    Configuration.context.drawImage(Configuration.imageEnemy, eCoords[0], eCoords[1],
					    Enemy.WIDTH, Enemy.HEIGHT);
	    if (globalThis.debug) {
		Configuration.context.strokeStyle = "black";
		Configuration.context.strokeRect(eCoords[0], eCoords[1], Enemy.WIDTH, Enemy.HEIGHT);
	    }
	})
	gameState.projectiles.forEach(p => {
	    Configuration.context.fillStyle = "0xFF0000";
	    Configuration.context.fillRect(p.currentCoordinates[0], p.currentCoordinates[1], 5, 10);
	});
	Configuration.context.drawImage(Configuration.imagePlayer, playerCoords[0], playerCoords[1],
					Player.WIDTH, Player.HEIGHT);
	if (globalThis.debug) {
	    Configuration.context.strokeStyle = "black";
	    Configuration.context.strokeRect(playerCoords[0], playerCoords[1], Player.WIDTH, Player.HEIGHT);
	}
    }

    // TODO: Include checks for only removing enemies that were hit by a player's projectiles.
    // TODO: Only count a hit on the player when it came from an enemy's projectile, a.k.a, no suicide allowed.
    export function updateProjectilePresence(gameState: Game) : Game {
	const removedProjectiles: number[] = [];
	const removedEnemies: number[] = [];
	let nextState: Status = "Going";

	gameState.projectiles.forEach((projectile, projectileIndex) => {
	    gameState.enemies.forEach((enemy, enemyIndex) => {
		if (Common.wasHit(enemy.currentCoordinates, enemy.width, enemy.height, projectile)
		    && projectile.kind != "Enemy") {
		    removedEnemies.push(enemyIndex);
		    removedProjectiles.push(projectileIndex);
		}		
	    })
	    let player = gameState.player;
	    if (Common.wasHit(player.currentCoordinates, player.width, player.height, projectile)
	       && projectile.kind != "Player") {		
		nextState = "Done";
		removedProjectiles.push(projectileIndex);
	    }
	})

	const updatedProjectiles = gameState.projectiles.filter((projectile, projectileIndex) => !removedProjectiles.includes(projectileIndex));
	const updatedEnemies = gameState.enemies.filter((enemy, enemyIndex) => !removedEnemies.includes(enemyIndex));	
	
	return {...gameState, status: nextState, enemies: updatedEnemies, projectiles: updatedProjectiles};
    }

    export function updateProjectiles(g: Game): Game {
		let ps = g.projectiles;
		return { ...g, projectiles: ps.map(Projectile.incrementCoordinates) };
    }

    export function moveEnemies(time: number, g: Game): Game {
		let es = g.enemies;
		return { ...g, enemies: es.map((e) => e.movement(time, e))};	
    }

    export function enemiesAttack(time: number, g: Game): Game {
	let es = g.enemies;
	let newProjectiles: Projectile.Entity[] = []
	let newEnemies: Enemy.Entity[] = es.map(
	    (enemy) => {
		if (time - enemy.lastTimeAttack >= enemy.timeBetweenShots) {
		    const angle = Common.calculateAngle(enemy.currentCoordinates, g.player.currentCoordinates);
		    newProjectiles.push(Enemy.attack(enemy.currentCoordinates, enemy.weapon, FP.option.some(angle), FP.option.none));
		    return {
			...enemy,
			lastTimeAttack: time
		    };	
		} else {
		    return enemy;
		}	
	    });
	let ps = g.projectiles;
	return { ...g, enemies: newEnemies, projectiles: [...ps, ...newProjectiles]};	
    }
    
    export const INITIAL_X = 10;
    export const INITIAL_Y = 10;
}

namespace Configuration {
    export const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    export const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    export const imagePlayer = document.querySelector("#ship") as HTMLImageElement;
    export const imageEnemy = document.querySelector("#enemy") as HTMLImageElement;

    export const WIDTH = 1870;
    export const HEIGHT = 900;
    export const DEBUG = false;
}
