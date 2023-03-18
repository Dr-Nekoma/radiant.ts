import { FP } from "./deps.ts";

const CANVAS_WIDTH = 1870;
const CANVAS_HEIGHT = 900;
const PLAYER_WIDTH = 200;
const PLAYER_HEIGHT = 200;
const ENEMY_WIDTH = 70;
const ENEMY_HEIGHT = 70;

// type Weapon = {
//     name: string;
//     experience: number;
// }

type Coordinates = [number, number];

type Spaceship = {
	currentCoordinates: Coordinates;
	// experience: Weapon[];
	// comboChain: [string, number];
};

type Enemy = {
	currentCoordinates: Coordinates;
	// color: string;
	// gunType: Weapon[];
};

type Projectile = {
	currentCoordinates: Coordinates;
	// color: string;
	// format: string;
	// direction: string;
};

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


function fire(state: Game): Game {
	const { player, projectiles } = state;
	const p: Projectile = { currentCoordinates: player.currentCoordinates };
	return { ...state, projectiles: [...projectiles, p] };
}


function main(): void {
	const canvas = document.querySelector("canvas") as HTMLCanvasElement;
	const context = canvas.getContext("2d") as CanvasRenderingContext2D;
	const imagePlayer = document.querySelector("#ship") as HTMLImageElement;
	const imageEnemy = document.querySelector("#enemy") as HTMLImageElement;

	let ex: Spaceship = { currentCoordinates: [10, 10] };
	let en1: Enemy = { currentCoordinates: [100, 100] };
	let gameState: Game = { projectiles: [], player: ex, enemies: [en1] };
	let input: FP.option.Option<string> = FP.option.none;

	imagePlayer.addEventListener("load", (e) => {
		context.drawImage(imagePlayer, ex.currentCoordinates[0], ex.currentCoordinates[1], 200, 200);
		document.addEventListener("keydown", (event) => {
			input = FP.option.some(event.key);
		});
		document.addEventListener("keyup", (_event) => {
			input = FP.option.none;
		});
	});

	let time = 0;
	setInterval(() => {
		context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		gameState = updateWithAction(input, gameState);
		gameState = updateProjectiles(gameState);
		context.drawImage(imagePlayer, gameState.player.currentCoordinates[0], gameState.player.currentCoordinates[1], PLAYER_WIDTH, PLAYER_HEIGHT);
		gameState = enemyMovement1(time, gameState);
		console.log(gameState.enemies[0].currentCoordinates);
		context.drawImage(imageEnemy, gameState.enemies[0].currentCoordinates[0], gameState.enemies[0].currentCoordinates[1], ENEMY_WIDTH, ENEMY_HEIGHT);
		gameState.projectiles.forEach(p => {
			context.fillStyle = "0xFF0000";
			context.fillRect(p.currentCoordinates[0], p.currentCoordinates[1], 5, 10);
		});
		time += 0.016;
	}, 16);

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

main();
