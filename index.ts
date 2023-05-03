import { State, Player, Enemy } from "./movement.ts";
import { FP } from "./deps.ts";

// let throttleFire = throttle(20, fire);
// function throttle<A, B>(delay: number, func: (arg0: A) => B) {
//     let current = Date.now();
//     return (args: (A)) => {
// 	if(Date.now() - current > delay) {
// 	    func(args);
// 	    current = Date.now();
// 	}
//     };
// }


/**
 * Main game loop function
 *
 * @remarks
 * This method is part of the {@link core-library#Statistics | Statistics subsystem}.
 *
 * @param x - The first input number
 * @param y - The second input number
 * @returns The arithmetic mean of `x` and `y`
 *
 * @beta
 */

function main(): void {
    
    let gameState: State.Game = State.initGame();
    let input: FP.option.Option<string> = FP.option.none;

    window.addEventListener("load", (e) => {
	State.draw(gameState);
	let handler: number;
	document.addEventListener("keydown", (event) => {
	    clearTimeout(handler);
	    input = FP.option.some(event.key);
	    handler = setTimeout(() => input = FP.option.none, 16);
	});
    });

    let time = 0;
    setInterval(() => {
	gameState = Player.updateWithAction(input, gameState);
	gameState = State.updateProjectiles(gameState);
	gameState = State.moveEnemies(time, gameState);
	gameState = State.updateProjectilePresence(gameState);
	time += 0.016;	    
	State.draw(gameState);
    }, 16);
}

main();
