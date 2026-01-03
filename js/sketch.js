let clickSound; // sound object
let clickSoundRate = 1; // for pitch variation
let jingleSound; // jingle sound
let antijingleSound; // anti-jingle sound
let clacSound; // clac sound
let btnPressedImg; // image for pressed button
let ticlicSound; // sound for arrow buttons
let lightMaskImg; // image for light mask
let video; // Declare video globally
let videoLoaded = false; // Track if video is loaded
console.log("video not loaded yet");

function preload() {
       video = createVideo(['img/video.mp4'], () => {
           console.log("Video loaded callback fired");
           videoLoaded = true;
           video.time(0);
       });
       
       if (video) {
           video.hide();
           // Use addEventListener for better reliability
           if (video.elt) {
                video.elt.addEventListener('loadeddata', () => {
                    videoLoaded = true;
                    console.log("video loaded (event listener)");
                    video.time(0);
                });
                
                video.elt.addEventListener('error', (e) => {
                    console.error("Video load error:", e);
                });

                // Fallback: check if metadata is already loaded
                if (video.elt.readyState >= 2) {
                    videoLoaded = true;
                    video.time(0);
                }
           }
       }
       
       clickSound = loadSound('sound/clic.wav');
       jingleSound = loadSound('sound/jingle.wav');
       antijingleSound = loadSound('sound/antijingle.wav');
       clacSound = loadSound('sound/clac.wav');
       btnPressedImg = loadImage('img/btnpressed.png');
       ticlicSound = loadSound('sound/ticlic.wav');
       lightMaskImg = loadImage('img/lightmask.png');
       framerate = 24; // <-- set this to your video's frame rate
}


function setup() {
	createCanvas(windowWidth, windowHeight);
	noiseGfx = createGraphics(windowWidth, windowHeight);
	noiseGfx.pixelDensity(1);
	frameRate(24); // Force 24fps for the sketch
	if (video) {
        video.time(0); // Show first frame
    }
}

// Set these to your original video/image size
const videoOriginalWidth = 1080; // replace with your actual video width
const videoOriginalHeight = 1920; // replace with your actual video height

// Set your actual video frame rate here
const VIDEO_FRAMERATE = 24; // <-- set this to your video's frame rate

// Button position in original image (before frame 95)
const buttonOriginalX = 247;
const buttonOriginalY = 1261;
const buttonW = 40;
const buttonH = 70;

// Button position in original image (from frame 95 onward)
const buttonOriginalX2 = 290; // set your new X
const buttonOriginalY2 = 1375; // set your new Y
const buttonW2 = 60; // set your new width
const buttonH2 = 100; // set your new height

// New square button definitions (original video coordinates)
const squareButtons = [
	{ x: 555,  y: 1365, size: 60 },
	{ x: 620, y: 1365, size: 60 },
	{ x: 685, y: 1365, size: 60 },
	{ x: 750, y: 1365, size: 60 }
];

let isPlaying = false;
let playingBackward = false;
let buttonClicked = false; // Track if button was clicked before it moves
let buttonPressed = false; // Track if button is being pressed
let waitingForButtonClick = true; // Show first frame until button click

function draw() {

	noSmooth();

	// Calculate aspect ratios
	let videoAspect = video.width / video.height;
	let canvasAspect = width / height;

	let displayWidth, displayHeight, offsetX, offsetY, scale;

	// Cover the entire canvas (crop on smaller sides)
	if (videoAspect > canvasAspect) {
		displayHeight = height;
		displayWidth = height * videoAspect;
		offsetX = (width - displayWidth) / 2;
		offsetY = 0;
		scale = displayHeight / video.height;
	} else {
		displayWidth = width;
		displayHeight = width / videoAspect;
		offsetX = 0;
		offsetY = (height - displayHeight) / 2;
		scale = displayWidth / video.width;
	}

	background(0); // Ensure black background
	
	// Fallback check in case event didn't fire
	if (!videoLoaded && video.width > 0 && video.elt.readyState >= 2) {
		videoLoaded = true;
		video.time(0);
	}

	if (videoLoaded) {
		image(video, offsetX, offsetY, displayWidth, displayHeight);
	} else {
		// Show loading text if video isn't ready
		fill(255);
		textAlign(CENTER, CENTER);
		textSize(16);
		text("Loading...", width/2, height/2);
	

	if (waitingForButtonClick) {
		// Only show first frame, don't run rest of draw logic
		return;
	}

	// Determine which button placement to use
	let frame = Math.floor(video.time() * VIDEO_FRAMERATE);
	let bx, by, bw, bh;
	let buttonMoved = frame >= 30; // Button moves at frame 30

	if (frame < 30) {
		bx = buttonOriginalX;
		by = buttonOriginalY;
		bw = buttonW;
		bh = buttonH;
	} else {
		bx = buttonOriginalX2;
		by = buttonOriginalY2;
		bw = buttonW2;
		bh = buttonH2;
	}

	// Map button position from original to displayed video
	let buttonX = offsetX + (bx / videoOriginalWidth) * displayWidth;
	let buttonY = offsetY + (by / videoOriginalHeight) * displayHeight;
	let buttonDisplayW = bw * (displayWidth / videoOriginalWidth);
	let buttonDisplayH = bh * (displayHeight / videoOriginalHeight);

	// control button debug
	// if (!buttonClicked || buttonMoved) {
	// 	noFill();
	// 	stroke(0, 255, 0);
	// 	rect(buttonX, buttonY, buttonDisplayW, buttonDisplayH);
	// }

	// Set cursor to pointer if mouse is over the button and it's visible, else default
	let arrowHovered = false;
	if (buttonMoved) {
		let scaleFactor = displayWidth / videoOriginalWidth;
		for (let btn of squareButtons) {
			let btnX = offsetX + (btn.x / videoOriginalWidth) * displayWidth;
			let btnY = offsetY + (btn.y / videoOriginalHeight) * displayHeight;
			let btnSize = btn.size * scaleFactor;
			if (
				mouseX >= btnX &&
				mouseX <= btnX + btnSize &&
				mouseY >= btnY &&
				mouseY <= btnY + btnSize
			) {
				arrowHovered = true;
				break;
			}
		}
	}
	if ((!buttonClicked || buttonMoved) && isInsideButton(mouseX, mouseY)) {
		document.body.style.cursor = 'pointer';
	} else if (arrowHovered) {
		document.body.style.cursor = 'pointer';
	} else {
		document.body.style.cursor = 'default';
	}

	// --- Film noise effect ---
	drawFilmNoise();

	// Forward playback: pause at last frame
	if (isPlaying && video.time() >= video.duration()) {
		video.pause();
		video.time(video.duration()); // Ensure it's at the last frame
		isPlaying = false;

	}

	// Backward playback: step back and pause at first frame
	if (playingBackward) {
		let t = video.time() - (4 / VIDEO_FRAMERATE);
		if (t <= 0) {
			video.time(0);
			video.pause();
			playingBackward = false;
		} else {
			video.time(t);
		}
	}

	// Reset buttonClicked when button moves
	if (buttonMoved && buttonClicked) {
		buttonClicked = false;
	}

	// Show btnPressedImg fullscreen, aligned with the video, if button is pressed in the first position (before it moves)
	if (buttonPressed && frame < 30 && btnPressedImg) {
		image(
			btnPressedImg,
			offsetX,
			offsetY,
			displayWidth,
			displayHeight
		);
	}

	// Render lightmask.png in front of the big button when pressed at its second position
	if (buttonPressed && frame >= 30 && lightMaskImg) {
		let bx = buttonOriginalX2;
		let by = buttonOriginalY2;
		let bw = buttonW2;
		let bh = buttonH2;
		let buttonX = offsetX + (bx / videoOriginalWidth) * displayWidth;
		let buttonY = offsetY + (by / videoOriginalHeight) * displayHeight;
		let buttonDisplayW = bw * (displayWidth / videoOriginalWidth);
		let buttonDisplayH = bh * (displayHeight / videoOriginalHeight);
		image(lightMaskImg, buttonX-20, buttonY-23, buttonDisplayW+32, buttonDisplayH+32);
	}

	// Render lightmask.png in front of each arrow button when pressed and at second position
	if (frame >= 30 && lightMaskImg) {
		let scaleFactor = displayWidth / videoOriginalWidth;
		for (let i = 0; i < squareButtons.length; i++) {
			let btn = squareButtons[i];
			let btnX = offsetX + (btn.x / videoOriginalWidth) * displayWidth;
			let btnY = offsetY + (btn.y / videoOriginalHeight) * displayHeight;
			let btnSize = btn.size * scaleFactor;
			// Check if this arrow button is currently pressed
			let pressed = false;
			// Mouse
			if (mouseIsPressed && mouseButton === LEFT &&
				mouseX >= btnX && mouseX <= btnX + btnSize &&
				mouseY >= btnY && mouseY <= btnY + btnSize) {
				pressed = true;
			}
			// Touch
			if (touches && touches.length > 0) {
				for (let t of touches) {
					if (t.x >= btnX && t.x <= btnX + btnSize &&
						t.y >= btnY && t.y <= btnY + btnSize) {
						pressed = true;
						break;
					}
				}
			}
			if (pressed) {
				image(lightMaskImg, btnX+10, btnY+10, btnSize-20, btnSize-20);
			}
		}
	}



	// Draw green stroked squares for the 4 buttons when the main button has moved
	if (buttonMoved) {
		push();
		noFill();
		stroke(0, 255, 0);
		strokeWeight(3);
		// Use the same scale for both width and height to keep squares
		let scaleFactor = displayWidth / videoOriginalWidth;
		for (let btn of squareButtons) {
			let btnX = offsetX + (btn.x / videoOriginalWidth) * displayWidth;
			let btnY = offsetY + (btn.y / videoOriginalHeight) * displayHeight;
			let btnSize = btn.size * scaleFactor;
			//rect(btnX, btnY, btnSize, btnSize);
		}
		pop();
	}
}

// Helper to check if a point is inside the button
function isInsideButton(px, py) {
	// Recalculate button position for current frame
	let videoAspect = video.width / video.height;
	let canvasAspect = width / height;
	let displayWidth, displayHeight, offsetX, offsetY;
	if (videoAspect > canvasAspect) {
		displayHeight = height;
		displayWidth = height * videoAspect;
		offsetX = (width - displayWidth) / 2;
		offsetY = 0;
	} else {
		displayWidth = width;
		displayHeight = width / videoAspect;
		offsetX = 0;
		offsetY = (height - displayHeight) / 2;
	}
	let frame = Math.floor(video.time() * VIDEO_FRAMERATE);
	let bx, by, bw, bh;
	if (frame < 30) {
		bx = buttonOriginalX;
		by = buttonOriginalY;
		bw = buttonW;
		bh = buttonH;
	} else {
		bx = buttonOriginalX2;
		by = buttonOriginalY2;
		bw = buttonW2;
		bh = buttonH2;
	}
	let buttonX = offsetX + (bx / videoOriginalWidth) * displayWidth;
	let buttonY = offsetY + (by / videoOriginalHeight) * displayHeight;
	let buttonDisplayW = bw * (displayWidth / videoOriginalWidth);
	let buttonDisplayH = bh * (displayHeight / videoOriginalHeight);

	// Only return true if button is visible
	let frameMoved = frame >= 30;
	if (frame < 30 && buttonClicked) return false;

	return (
		px >= buttonX &&
		px <= buttonX + buttonDisplayW &&
		py >= buttonY &&
		py <= buttonY + buttonDisplayH
	);
}

// Helper to check if a point is inside any arrow button (returns index or -1)
function isInsideArrowButton(px, py) {
	let videoAspect = video.width / video.height;
	let canvasAspect = width / height;
	let displayWidth, displayHeight, offsetX, offsetY;
	if (videoAspect > canvasAspect) {
		displayHeight = height;
		displayWidth = height * videoAspect;
		offsetX = (width - displayWidth) / 2;
		offsetY = 0;
	} else {
		displayWidth = width;
		displayHeight = width / videoAspect;
		offsetX = 0;
		offsetY = (height - displayHeight) / 2;
	}
	let scaleFactor = displayWidth / videoOriginalWidth;
	for (let i = 0; i < squareButtons.length; i++) {
		let btn = squareButtons[i];
		let btnX = offsetX + (btn.x / videoOriginalWidth) * displayWidth;
		let btnY = offsetY + (btn.y / videoOriginalHeight) * displayHeight;
		let btnSize = btn.size * scaleFactor;
		if (
			px >= btnX &&
			px <= btnX + btnSize &&
			py >= btnY &&
			py <= btnY + btnSize
		) {
			return i;
		}
	}
	return -1;
}

function playClickSound() {
	if (clickSound && clickSound.isLoaded()) {
		// Random pitch variation between 0.95 and 1.05
		clickSoundRate = random(0.95, 1.05);
		clickSound.rate(clickSoundRate);
		clickSound.play();
	}
}

function mousePressed() {
	if (waitingForButtonClick && isInsideButton(mouseX, mouseY)) {
		video.play();
		waitingForButtonClick = false;
		playClickSound();
		buttonPressed = true;
		return;
	}
	if (isInsideButton(mouseX, mouseY)) {
		playClickSound();
		buttonPressed = true;
	}
	// Arrow buttons
	let frame = Math.floor(video.time() * VIDEO_FRAMERATE);
	let buttonMoved = frame >= 30;
	if (buttonMoved) {
		let arrowIdx = isInsideArrowButton(mouseX, mouseY);
		if (arrowIdx !== -1 && ticlicSound && ticlicSound.isLoaded()) {
			ticlicSound.rate(1.3); // higher pitch
			ticlicSound.play();
		}
	}
}

function mouseReleased() {
	if (buttonPressed && isInsideButton(mouseX, mouseY)) {
		if (clacSound && clacSound.isLoaded()) {
			clacSound.play();
		}
		let frame = Math.floor(video.time() * VIDEO_FRAMERATE);
		let buttonMoved = frame >= 30;
		   if (frame < 30) {
			   if (!isPlaying && !playingBackward && !buttonClicked) {
				   if (jingleSound && jingleSound.isLoaded()) {
					   jingleSound.stop(); // Stop any currently playing jingle
					   jingleSound.setVolume(0.2);
					   jingleSound.play();
				   }
				   if (antijingleSound && antijingleSound.isLoaded()) {
					   antijingleSound.stop(); // Stop antijingle if playing
				   }
				   video.stop();
				   video.play();
				   isPlaying = true;
				   buttonClicked = true;
			   }
		   } else {
			   if (antijingleSound && antijingleSound.isLoaded()) {
				   antijingleSound.stop(); // Stop any currently playing antijingle
				   antijingleSound.setVolume(0.2);
				   antijingleSound.play();
			   }
			   if (jingleSound && jingleSound.isLoaded()) {
				   jingleSound.stop(); // Stop jingle if playing
			   }
			   video.time(95 / VIDEO_FRAMERATE); // Jump to frame 95
			   playingBackward = true;
			   isPlaying = false;
			   video.pause();
		   }
	}
	// Arrow buttons
	let frame = Math.floor(video.time() * VIDEO_FRAMERATE);
	let buttonMoved = frame >= 30;
	if (buttonMoved) {
		let arrowIdx = isInsideArrowButton(mouseX, mouseY);
		if (arrowIdx !== -1 && ticlicSound && ticlicSound.isLoaded()) {
			ticlicSound.setVolume(0.4);
			ticlicSound.rate(0.8); // lower pitch
			ticlicSound.play();
		}
	}
	buttonPressed = false;
}

function touchStarted() {
	if (isInsideButton(touchX, touchY)) {
		playClickSound();
		buttonPressed = true;
	}
	// Arrow buttons
	let frame = Math.floor(video.time() * VIDEO_FRAMERATE);
	let buttonMoved = frame >= 30;
	if (buttonMoved) {
		let arrowIdx = isInsideArrowButton(touchX, touchY);
		if (arrowIdx !== -1 && ticlicSound && ticlicSound.isLoaded()) {
			ticlicSound.setVolume(0.4);
			ticlicSound.rate(1.3); // higher pitch
			ticlicSound.play();
		}
	}
}

function touchEnded() {
	if (buttonPressed && isInsideButton(touchX, touchY)) {
		if (clacSound && clacSound.isLoaded()) {
			clacSound.play();
		}
		let frame = Math.floor(video.time() * VIDEO_FRAMERATE);
		let buttonMoved = frame >= 30;
		   if (frame < 30) {
			   if (!isPlaying && !playingBackward && !buttonClicked) {
				   if (jingleSound && jingleSound.isLoaded()) {
					   jingleSound.stop(); // Stop any currently playing jingle
					   jingleSound.setVolume(0.2);
					   jingleSound.play();
				   }
				   if (antijingleSound && antijingleSound.isLoaded()) {
					   antijingleSound.stop(); // Stop antijingle if playing
				   }
				   video.stop();
				   video.play();
				   isPlaying = true;
				   buttonClicked = true;
			   }
		   } else {
			   if (antijingleSound && antijingleSound.isLoaded()) {
				   antijingleSound.stop(); // Stop any currently playing antijingle
				   antijingleSound.setVolume(0.2);
				   antijingleSound.play();
			   }
			   if (jingleSound && jingleSound.isLoaded()) {
				   jingleSound.stop(); // Stop jingle if playing
			   }
			   video.time(95 / VIDEO_FRAMERATE); // Jump to frame 95
			   playingBackward = true;
			   isPlaying = false;
			   video.pause();
		   }
	}
	// Arrow buttons
	let frame = Math.floor(video.time() * VIDEO_FRAMERATE);
	let buttonMoved = frame >= 30;
	if (buttonMoved) {
		let arrowIdx = isInsideArrowButton(touchX, touchY);
		if (arrowIdx !== -1 && ticlicSound && ticlicSound.isLoaded()) {
			ticlicSound.rate(0.8); // lower pitch
			ticlicSound.play();
		}
	}
	buttonPressed = false;
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	noiseGfx = createGraphics(windowWidth, windowHeight);
	noiseGfx.pixelDensity(1);
}

// Highly optimized film noise overlay: draw sparse, large, semi-transparent dots
function drawFilmNoise() {
	noiseGfx.clear();
	noiseGfx.noStroke();
	let dotSize = 2; // Larger dots for less fill calls
	let density = 0.03; // 3% of pixels get noise
	let numDots = int(width * height * density / (dotSize * dotSize));
	for (let i = 0; i < numDots; i++) {
		let x = int(random(width));
		let y = int(random(height));
		let val = random(180, 255); // light noise
		noiseGfx.fill(val, 255 * 0.1); // slightly higher alpha for visibility
		noiseGfx.rect(x, y, dotSize, dotSize);
	}
	image(noiseGfx, 0, 0, width, height);
}

}




////////////////////////// EN FAIT //////////////////////////
//je sais comment je vais faire, pas de pdf, les projets etc interfaces seront en images
//avec une array[page1,page2 etc] pour faire des correspondance plus simples entre les images et les boutons
//genre if array[p]=[1] {
//if lowbtn=1 {
//array[p]==[p+1]}} et vice versa
//ça sera plus simple aussi pour la texture à appliquer pour incruster, ça sera direct sur les images
//et pour les animations aussi, je ferai des gifs optimisés (si possible ez avec P5 ou alors video)
