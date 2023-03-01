// import { add, multiply } from "./deps.ts";

function main() : void {
    const canvas = document.querySelector("canvas")as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const image = document.querySelector("#ship") as HTMLImageElement;
    let xCoordinate = 10;
    let yCoordinate = 10;
    
    image.addEventListener("load", (e) => {
	context.drawImage(image, xCoordinate, yCoordinate, 200, 200);
	document.addEventListener("keydown", (event) => {
	    context.clearRect(0, 0, 500, 500);
	    let coordinates = updateCoordinates(event.key, xCoordinate, yCoordinate);
	    xCoordinate = coordinates[0];
	    yCoordinate = coordinates[1];
            context.drawImage(image, xCoordinate, yCoordinate, 200, 200);
	});
    });

}

function updateCoordinates(key: string, xCoordinate: number, yCoordinate: number) : [number, number] {
    if(key == "ArrowRight"){
	xCoordinate += 10;
    } else if(key == "ArrowDown") {
	yCoordinate += 10;
    } else if(key == "ArrowLeft") {
	xCoordinate -= 10;	
    } else if(key == "ArrowUp") {
	yCoordinate -= 10;	
    }
    return [xCoordinate, yCoordinate];
}

main();
