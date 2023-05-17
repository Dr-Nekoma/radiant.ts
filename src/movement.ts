import { FP } from "../deps.ts";

export namespace Common {
    export type Coordinates = [number, number];

    
    export function wasHit(current: Coordinates, width: number, height: number, projectile: Projectile.Entity): boolean {
	let pointUpLeftCorner: Coordinates = projectile.currentCoordinates;
	let pointBottomRightCorner: Coordinates = [projectile.currentCoordinates[0] + projectile.width, projectile.currentCoordinates[1] + projectile.height];

	let entityUpLeftCorner = current;
	let entityBottomRightCorner: Coordinates = [current[0] + width, current[1] + height];
	
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
                if (key == "ArrowRight") {
                    xCoordinate += 15;
                } else if (key == "ArrowDown") {
                    yCoordinate += 15;
                } else if (key == "ArrowLeft") {
                    xCoordinate -= 15;
                } else if (key == "ArrowUp") {
                    yCoordinate -= 15;
                } else if (key == "z") {			
                    const newProjectile = fire(s.currentCoordinates, s.weapons[0], FP.option.none, FP.option.none);
                    g = { ...g, projectiles: [...g.projectiles, ...newProjectile] };
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
		let en: Entity = { currentCoordinates: [100, 100], 
						   width: WIDTH, height: HEIGHT, 
						   movement: movement1,
						   timeBetweenShots: FP.option.getOrElse(() => DEFAULT_TIME_BETWEEN_SHOTS)(betweenShots),
						   weapon: wp,
						   lastTimeAttack: 0};
		return en;
    }

	export function attack(coordinates: Common.Coordinates, wp: Weapon.Entity, angle: FP.option.Option<number>, speed: FP.option.Option<number>): Projectile.Entity {
		return Weapon.fire(coordinates, wp, angle, speed);
	}

    function movement1(time: number, en: Entity): Entity {
	en.currentCoordinates = [150 * Math.abs(Math.cos(time)) + 100, 75 * Math.cos(time) + 100];
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

    export function fire(coordinates: Common.Coordinates, wp: Entity, angle: FP.option.Option<number>, speed: FP.option.Option<number>): Projectile.Entity {
		return Projectile.createProjectile(wp, coordinates, angle, speed);
    }
	
}

export namespace Projectile {
    
    // TODO: There is some accumulation of the previous positions of the projectile in the game State. We should fix that.
    export type Entity = {
	id: number;
	width: number; 
	height: number;           
	currentCoordinates: Common.Coordinates;
	weaponSource: Weapon.Entity;
	angle: number;
	speed: number;
	// color: string;
	// format: string;
	// direction: string;
    };
	
	// TODO: update this function to take into account speed and angle
    export function incrementCoordinates(p: Entity): Entity {
		let c = p.currentCoordinates;
		return { ...p, currentCoordinates: [c[0], c[1] - 10] };
    }

    export function createProjectile(weapon: Weapon.Entity, coordinates: Common.Coordinates, angle: FP.option.Option<number>, speed: FP.option.Option<number>): Projectile.Entity {
	const p: Projectile.Entity = { currentCoordinates: [coordinates[0], coordinates[1] - 50],
								   width: WIDTH, height: HEIGHT,
			                       id: projectileCounter, weaponSource: weapon,
								   angle: FP.option.getOrElse(() => DEFAULT_ANGLE)(angle),
								   speed: FP.option.getOrElse(() => DEFAULT_SPEED)(speed)};
	projectileCounter += 1;
	return p;
    }

    let projectileCounter = 0;
	export const DEFAULT_ANGLE = 0;
	export const DEFAULT_SPEED = 10;
    export const WIDTH = 5;
    export const HEIGHT = 5;
}


export namespace State {
    
    //type InternalState = Done | Going;

    // TODO: Separate the projectiles from enemies and player
    export type Game = {
	// TODO: We should make this as an option to kill the player
	// player: FP.option.Option<Spaceship>;
	player: Player.Entity;
	enemies: Enemy.Entity[];
	projectiles: Projectile.Entity[];
	score: number;
    }

    export type Done = {
	state: "done";
    }
    export type Going = {
	state: "going";
	game: Game;
    }

    export function initGame(): Game {
	let p = Player.create();
	let en = Enemy.create(FP.option.none);
	let s = 0;
	return { projectiles: [], player: p, enemies: [en], score: s };
    }

    export function draw(gameState: Game) {
	Configuration.context.clearRect(0, 0, Configuration.WIDTH, Configuration.HEIGHT);
	Configuration.context.drawImage(Configuration.imagePlayer, gameState.player.currentCoordinates[0], gameState.player.currentCoordinates[1],
					Player.WIDTH, Player.HEIGHT);	
	gameState.enemies.forEach(e => {
	    Configuration.context.drawImage(Configuration.imageEnemy, e.currentCoordinates[0], e.currentCoordinates[1],
					    Enemy.WIDTH, Enemy.HEIGHT);
	})
	gameState.projectiles.forEach(p => {
	    Configuration.context.fillStyle = "0xFF0000";
	    Configuration.context.fillRect(p.currentCoordinates[0], p.currentCoordinates[1], 5, 10);
	});

    }

    // TODO: Include checks for only removing enemies that were hit by a player's projectiles.
    // TODO: Only count a hit on the player when it came from an enemy's projectile, a.k.a, no suicide allowed.
    export function updateProjectilePresence(gameState: Game) : Game {
	const removedProjectiles: number[] = [];
	const removedEnemies: number[] = [];

	gameState.projectiles.forEach((projectile, projectileIndex) => {
	    gameState.enemies.forEach((enemy, enemyIndex) => {
		if (Common.wasHit(enemy.currentCoordinates, enemy.width, enemy.height, projectile)) {
		    removedEnemies.push(enemyIndex);
		    removedProjectiles.push(projectileIndex);
		}		
	    })

	})

	const updatedProjectiles = gameState.projectiles.filter((projectile, projectileIndex) => !removedProjectiles.includes(projectileIndex));
	const updatedEnemies = gameState.enemies.filter((enemy, enemyIndex) => !removedEnemies.includes(enemyIndex));	
	
	return {...gameState, enemies: updatedEnemies, projectiles: updatedProjectiles};
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
					// TODO: calculate angle based on player's position
					newProjectiles.push(Enemy.attack(enemy.currentCoordinates, enemy.weapon, FP.option.none, FP.option.none));
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
}
