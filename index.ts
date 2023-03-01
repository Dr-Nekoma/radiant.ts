// import { add, multiply } from "./deps.ts";

const canvas = document.querySelector("canvas")as HTMLCanvasElement;
const context = canvas.getContext("2d") as CanvasRenderingContext2D;
const image = document.querySelector("#ship") as HTMLImageElement;
let xCoordinate = 10;
let yCoordinate = 10;

function updateCoordinates(key: string) {
    if(key == "ArrowRight"){
	xCoordinate += 10;
    } else if(key == "ArrowDown") {
	yCoordinate += 10;
    } else if(key == "ArrowLeft") {
	xCoordinate -= 10;	
    } else if(key == "ArrowUp") {
	yCoordinate -= 10;	
    }
}

image.addEventListener("load", (e) => {
    context.drawImage(image, xCoordinate, yCoordinate, 200, 200);
    document.addEventListener("keydown", (event) => {
	context.clearRect(0, 0, 500, 500);
	updateCoordinates(event.key);
        context.drawImage(image, xCoordinate, yCoordinate, 200, 200);
    });
});

