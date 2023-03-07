// import { add, multiply } from "./deps.ts";

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
    projectiles: Projectile[];
    // enemies
    // 
}

type State = State.Done | State.Going;

namespace Spaceship {
    export function updateCoordinates(s: Spaceship, newC: Coordinates) : Spaceship {
	return {...s, currentCoordinates: newC};
    }
   
}


function fire(state: Game): Game {
    const { player, projectiles } = state;
    const p: Projectile = {currentCoordinates: player.currentCoordinates};
    return {...state, projectiles: [...projectiles, p]};
}


function main() : void {
    const canvas = document.querySelector("canvas")as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const image = document.querySelector("#ship") as HTMLImageElement;
    let ex: Spaceship = {currentCoordinates: [10, 10]};
    let gameState: Game = {projectiles: [], player: ex};
    let input: string | null = null;
    
    image.addEventListener("load", (e) => {
	context.drawImage(image, ex.currentCoordinates[0], ex.currentCoordinates[1], 200, 200);
	document.addEventListener("keydown", (event) => {
	    input = event.key;
	});
    });

    setInterval(() => {
	context.clearRect(0, 0, 500, 500);
	gameState = updateWithAction(input, gameState);
	gameState = updateProjectiles(gameState);
	context.drawImage(image, gameState.player.currentCoordinates[0], gameState.player.currentCoordinates[1], 200, 200);
	gameState.projectiles.forEach(p => {
		context.fillStyle = "0xFF0000";
		context.fillRect(p.currentCoordinates[0], p.currentCoordinates[1], 5, 10);
	});	
    }, 50);
    console.log(Spaceship.updateCoordinates(ex, [1,1]));

}

function incrementCoordinates(p: Projectile) : Projectile {
    let c = p.currentCoordinates;
    return {...p, currentCoordinates: [c[0], c[1] - 10]};
}

function updateProjectiles(g: Game) : Game {
    let ps = g.projectiles;
    return {...g, projectiles: ps.map(incrementCoordinates)};
}

function updateWithAction(key: string | null, g: Game) : Game {
    if(key == null) {
	return g;
    }
    let s = g.player;
    let xCoordinate = s.currentCoordinates[0];
    let yCoordinate = s.currentCoordinates[1];
    let newG = structuredClone(g);
    if(key == "ArrowRight"){
	xCoordinate += 10;
    } else if(key == "ArrowDown") {
	yCoordinate += 10;
    } else if(key == "ArrowLeft") {
	xCoordinate -= 10;	
    } else if(key == "ArrowUp") {
	yCoordinate -= 10;	
    } else if(key == "z") {
	newG = fire(g);
    }
    return {...newG, player: Spaceship.updateCoordinates(s, [xCoordinate, yCoordinate])};
}

main();
