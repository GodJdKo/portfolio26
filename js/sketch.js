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
let reverseVideo; // Reverse video
let reverseVideoLoaded = false; // Track if reverse video is loaded
let playingReverseVideo = false; // Track if reverse video is playing
let video2; // Second video
let video2Loaded = false; // Track if video2 is loaded
let playingVideo2 = false; // Track if video2 is playing
let reverseVideo2; // Reverse video 2
let reverseVideo2Loaded = false; // Track if reverse video2 is loaded
let playingReverseVideo2 = false; // Track if reverse video2 is playing
let backUI0Img; // Back button default image
let backUIImg; // Back button hover image

// UI Navigation system
const availableImages = ['p0', 'p1', 'p2', 'p3'];
let uiImages = {}; // Store loaded images
let currentUIState = 'p0'; // Track current image being displayed
let showingUI = false; // Track if we're in UI mode

// First frame animation cycle
let firstFrameImages = [];
let currentFirstFrame = 0;
let lastFirstFrameChange = 0;
let firstFrameInterval = 50; // ms between frames (customizable)

function preload() {
       console.log("Preload starting, attempting to load video...");
       
       video = createVideo(['img/video.mp4'], () => {
           console.log("Video loaded callback fired");
           videoLoaded = true;
           if (video && video.elt) {
               video.time(0);
               console.log("Video duration:", video.duration(), "Video size:", video.width, "x", video.height);
           }
       });
       
       if (video) {
           video.hide();
           console.log("Video element created");
           
           // Use addEventListener for better reliability
           if (video.elt) {
                video.elt.addEventListener('loadeddata', () => {
                    videoLoaded = true;
                    console.log("video loaded (event listener) - readyState:", video.elt.readyState);
                    video.time(0);
                });
                
                video.elt.addEventListener('error', (e) => {
                    console.error("Video load error:", e, "Error code:", video.elt.error ? video.elt.error.code : 'unknown');
                });
                
                video.elt.addEventListener('loadstart', () => {
                    console.log("Video load started");
                });
                
                video.elt.addEventListener('progress', () => {
                    console.log("Video loading progress...");
                });

                // Fallback: check if metadata is already loaded
                if (video.elt.readyState >= 2) {
                    videoLoaded = true;
                    video.time(0);
                    console.log("Video already loaded (readyState check)");
                }
           }
       } else {
           console.error("Failed to create video element!");
       }
       
       // Load reverse video
       reverseVideo = createVideo(['img/reversevideo.mp4'], () => {
           console.log("Reverse video loaded callback fired");
           reverseVideoLoaded = true;
           if (reverseVideo && reverseVideo.elt) {
               reverseVideo.time(0);
               console.log("Reverse video duration:", reverseVideo.duration());
           }
       });
       
       if (reverseVideo) {
           reverseVideo.hide();
           console.log("Reverse video element created");
           
           if (reverseVideo.elt) {
               reverseVideo.elt.addEventListener('loadeddata', () => {
                   reverseVideoLoaded = true;
                   console.log("Reverse video loaded (event listener)");
                   reverseVideo.time(0);
               });
               
               reverseVideo.elt.addEventListener('error', (e) => {
                   console.error("Reverse video load error:", e);
               });
               
               if (reverseVideo.elt.readyState >= 2) {
                   reverseVideoLoaded = true;
                   reverseVideo.time(0);
                   console.log("Reverse video already loaded");
               }
           }
       } else {
           console.error("Failed to create reverse video element!");
       }
       
       // Load video2
       video2 = createVideo(['img/video2.mp4'], () => {
           console.log("Video2 loaded callback fired");
           video2Loaded = true;
           if (video2 && video2.elt) {
               video2.time(0);
               console.log("Video2 duration:", video2.duration());
           }
       });
       
       if (video2) {
           video2.hide();
           console.log("Video2 element created");
           
           if (video2.elt) {
               video2.elt.addEventListener('loadeddata', () => {
                   video2Loaded = true;
                   console.log("Video2 loaded (event listener)");
                   video2.time(0);
               });
               
               video2.elt.addEventListener('error', (e) => {
                   console.error("Video2 load error:", e);
               });
               
               if (video2.elt.readyState >= 2) {
                   video2Loaded = true;
                   video2.time(0);
                   console.log("Video2 already loaded");
               }
           }
       } else {
           console.error("Failed to create video2 element!");
       }
       
       // Load reverse video2
       reverseVideo2 = createVideo(['img/reversevideo2.mp4'], () => {
           console.log("ReverseVideo2 loaded callback fired");
           reverseVideo2Loaded = true;
           if (reverseVideo2 && reverseVideo2.elt) {
               reverseVideo2.time(0);
               console.log("ReverseVideo2 duration:", reverseVideo2.duration());
           }
       });
       
       if (reverseVideo2) {
           reverseVideo2.hide();
           console.log("ReverseVideo2 element created");
           
           if (reverseVideo2.elt) {
               reverseVideo2.elt.addEventListener('loadeddata', () => {
                   reverseVideo2Loaded = true;
                   console.log("ReverseVideo2 loaded (event listener)");
                   reverseVideo2.time(0);
               });
               
               reverseVideo2.elt.addEventListener('error', (e) => {
                   console.error("ReverseVideo2 load error:", e);
               });
               
               if (reverseVideo2.elt.readyState >= 2) {
                   reverseVideo2Loaded = true;
                   reverseVideo2.time(0);
                   console.log("ReverseVideo2 already loaded");
               }
           }
       } else {
           console.error("Failed to create reverseVideo2 element!");
       }
       
       clickSound = loadSound('sound/clic.wav');
       jingleSound = loadSound('sound/jingle.wav');
       antijingleSound = loadSound('sound/antijingle.wav');
       clacSound = loadSound('sound/clac.wav');
       btnPressedImg = loadImage('img/btnpressed.jpg');
       ticlicSound = loadSound('sound/ticlic.wav');
       lightMaskImg = loadImage('img/lightmask.png');
       backUI0Img = loadImage('img/UI/backUI0.png');
       backUIImg = loadImage('img/UI/backUI.png');
       
       // Preload UI navigation images
       for (let imgName of availableImages) {
           uiImages[imgName] = loadImage(`img/UI/${imgName}.jpg`);
       }
       
       // Preload first frame animation images
       for (let i = 0; i < 4; i++) {
           firstFrameImages[i] = loadImage(`img/firstframe/firstframe${i}.jpg`);
       }
       
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
const buttonOriginalX = 370;
const buttonOriginalY = 1269;
const buttonW = 40;
const buttonH = 70;

// Button position in second image (from frame 95 onward)
const buttonOriginalX2 = 290; // set your new X
const buttonOriginalY2 = 1375; // set your new Y
const buttonW2 = 60; // set your new width
const buttonH2 = 100; // set your new height

// New square button definitions (original video coordinates)
const squareButtons = [
	{ x: 550,  y: 1355, size: 70 },
	{ x: 615, y: 1355, size: 70 },
	{ x: 680, y: 1355, size: 70 },
	{ x: 745, y: 1355, size: 70 }
];

let isPlaying = false;
let buttonClicked = false; // Track if button was clicked before it moves
let buttonPressed = false; // Track if button is being pressed
let waitingForButtonClick = true; // Show first frame until button click
let lastTouchX = 0;
let lastTouchY = 0;

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
	
	// Check if playing reverse video
	if (playingReverseVideo) {
		if (reverseVideoLoaded && reverseVideo) {
			image(reverseVideo, offsetX, offsetY, displayWidth, displayHeight);
			
			// Check if reverse video finished
			if (reverseVideo.time() >= reverseVideo.duration()) {
				reverseVideo.pause();
				reverseVideo.time(0);
				playingReverseVideo = false;
				video.pause(); // Ensure main video is paused
				video.time(0); // Reset main video to start
				buttonClicked = false; // Reset button state
				waitingForButtonClick = true;
			}
		}
		drawFilmNoise();
		return; // Don't render anything else
	}

	// Check if playing reversevideo2
	if (playingReverseVideo2) {
		if (reverseVideo2Loaded && reverseVideo2) {
			image(reverseVideo2, offsetX, offsetY, displayWidth, displayHeight);
			
			// Check if reversevideo2 finished
			if (reverseVideo2.time() >= reverseVideo2.duration()) {
				reverseVideo2.pause();
				reverseVideo2.time(0);
				playingReverseVideo2 = false;
				playingVideo2 = false;
				// Return to p3 UI
				currentUIState = 'p3';
				showingUI = true;
			}
		}
		drawFilmNoise();
		return; // Don't render anything else
	}

	// Check if playing video2
	if (playingVideo2) {
		if (video2Loaded && video2) {
			image(video2, offsetX, offsetY, displayWidth, displayHeight);
			
			// Check if video2 finished - freeze on last frame
			if (video2.time() >= video2.duration()) {
				video2.pause();
				video2.time(video2.duration()); // Stay at last frame
			}
		}
		drawFilmNoise();
		
		// Draw back button when video2 is frozen
		if (video2.time() >= video2.duration() && backUI0Img && backUIImg) {
			let smallestSide = min(width, height);
			let btnSize = smallestSide / 6;
			let btnX = width - btnSize - 20; // 20px padding from right
			let btnY = height - btnSize - 20; // 20px padding from bottom
			
			// Check if mouse is over back button
			let isHovered = mouseX >= btnX && mouseX <= btnX + btnSize &&
			                mouseY >= btnY && mouseY <= btnY + btnSize;
			
			if (isHovered) {
				document.body.style.cursor = 'pointer';
				image(backUIImg, btnX, btnY, btnSize, btnSize);
			} else {
				image(backUI0Img, btnX, btnY, btnSize, btnSize);
			}
		}
		
		return; // Don't render anything else
	}

	// Display UI image if in UI mode
	if (showingUI && uiImages[currentUIState]) {
		let img = uiImages[currentUIState];
		
		// Calculate aspect ratios for the UI image
		let imgAspect = img.width / img.height;
		let canvasAspect = width / height;
		
		let displayWidth, displayHeight, offsetX, offsetY;
		
		// Cover the entire canvas
		if (imgAspect > canvasAspect) {
			displayHeight = height;
			displayWidth = height * imgAspect;
			offsetX = (width - displayWidth) / 2;
			offsetY = 0;
		} else {
			displayWidth = width;
			displayHeight = width / imgAspect;
			offsetX = 0;
			offsetY = (height - displayHeight) / 2;
		}
		
		image(img, offsetX, offsetY, displayWidth, displayHeight);
		
		// Render lightmask on big button when pressed in UI mode
		if (buttonPressed && lightMaskImg) {
			let bx = buttonOriginalX2;
			let by = buttonOriginalY2;
			let bw = buttonW2;
			let bh = buttonH2;
			// Use the same scale factor calculation as the rest of the code
			let scaleX = displayWidth / videoOriginalWidth;
			let scaleY = displayHeight / videoOriginalHeight;
			let buttonX = offsetX + (bx * scaleX);
			let buttonY = offsetY + (by * scaleY);
			let buttonDisplayW = bw * scaleX;
			let buttonDisplayH = bh * scaleY;
			// Scale the offset proportionally
			let maskOffsetX = 12 * scaleX;
			let maskOffsetY = 23 * scaleY;
			let maskExtraW = 20 * scaleX;
			let maskExtraH = 39 * scaleY;
			image(lightMaskImg, buttonX - maskOffsetX, buttonY - maskOffsetY, buttonDisplayW + maskExtraW, buttonDisplayH + maskExtraH);
		}
		
		// Render lightmask on arrow buttons when pressed in UI mode
		if (lightMaskImg) {
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
					// Scale the inset proportionally
					let maskInset = 10 * scaleFactor;
					image(lightMaskImg, btnX + maskInset, btnY + maskInset, btnSize - (maskInset * 2), btnSize - (maskInset * 2));
				}
			}
		}
		
		// Draw film noise on UI
		drawFilmNoise();
		
		return; // Don't render video when showing UI
	}

	if (videoLoaded) {
		image(video, offsetX, offsetY, displayWidth, displayHeight);
	} else {
		// Show loading text if video isn't ready
		fill(255);
		textAlign(CENTER, CENTER);
		textSize(16);
		text("Loading...", width/2, height/2);
		return;
	}

	if (waitingForButtonClick) {
		// Cycle through first frame animation
		let now = millis();
		if (now - lastFirstFrameChange >= firstFrameInterval) {
			currentFirstFrame = (currentFirstFrame + 1) % 4;
			lastFirstFrameChange = now;
		}
		
		// Display current firstframe image
		if (firstFrameImages[currentFirstFrame]) {
			let img = firstFrameImages[currentFirstFrame];
			image(img, offsetX, offsetY, displayWidth, displayHeight);
		}
		
		// Draw button hitbox even when waiting
		let frame = Math.floor(video.time() * VIDEO_FRAMERATE);
		let bx = buttonOriginalX;
		let by = buttonOriginalY;
		let bw = buttonW;
		let bh = buttonH;
		
		let buttonX = offsetX + (bx / videoOriginalWidth) * displayWidth;
		let buttonY = offsetY + (by / videoOriginalHeight) * displayHeight;
		let buttonDisplayW = bw * (displayWidth / videoOriginalWidth);
		let buttonDisplayH = bh * (displayHeight / videoOriginalHeight);
		
		// Draw noise texture BEFORE button elements
		drawFilmNoise();
		
		// Render lightmask on big button when pressed at first frame
		if (buttonPressed && btnPressedImg) {
			image(btnPressedImg, offsetX, offsetY, displayWidth, displayHeight);
		}
		
		/////////////////////////////////// Debug visualization
		noFill();
		stroke(0, 255, 0);
		strokeWeight(2);
		//rect(buttonX, buttonY, buttonDisplayW, buttonDisplayH);
		
		// Check for button hover
		if (mouseX >= buttonX && mouseX <= buttonX + buttonDisplayW &&
		    mouseY >= buttonY && mouseY <= buttonY + buttonDisplayH) {
			document.body.style.cursor = 'pointer';
		} else {
			document.body.style.cursor = 'default';
		}
		
		return; // Don't run rest of draw logic
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

	// Forward playback: pause at last frame and show UI
	if (isPlaying && video.time() >= video.duration()) {
		video.pause();
		video.time(video.duration()); // Ensure it's at the last frame
		isPlaying = false;
		reverseVideo.pause(); // Ensure reverse video is paused
		// Show main menu
		currentUIState = 'p0';
		showingUI = true;
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
		// Use the same scale factor calculation as the rest of the code
		let scaleX = displayWidth / videoOriginalWidth;
		let scaleY = displayHeight / videoOriginalHeight;
		let buttonX = offsetX + (bx * scaleX);
		let buttonY = offsetY + (by * scaleY);
		let buttonDisplayW = bw * scaleX;
		let buttonDisplayH = bh * scaleY;
		// Scale the offset proportionally
		let maskOffsetX = 12 * scaleX;
		let maskOffsetY = 23 * scaleY;
		let maskExtraW = 20 * scaleX;
		let maskExtraH = 39 * scaleY;
		image(lightMaskImg, buttonX - maskOffsetX, buttonY - maskOffsetY, buttonDisplayW + maskExtraW, buttonDisplayH + maskExtraH);
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
				// Scale the inset proportionally
				let maskInset = 10 * scaleFactor;
				image(lightMaskImg, btnX + maskInset, btnY + maskInset, btnSize - (maskInset * 2), btnSize - (maskInset * 2));
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

// Navigation functions
function getDepth(state) {
	return state.replace('p', '').length;
}

function navigateLeft() {
	let depth = getDepth(currentUIState);
	
	if (depth === 1) {
		// At top level
		if (currentUIState === 'p1') {
			// p1 -> p0
			currentUIState = 'p0';
		}
		// p0, p2, p3 don't have left navigation at top level
	} else {
		// At deeper levels: navigate between siblings
		let base = currentUIState.slice(0, -1);
		let lastDigit = parseInt(currentUIState.slice(-1));
		let newDigit = lastDigit - 1;
		
		if (newDigit >= 1) {
			let newState = base + newDigit;
			if (availableImages.includes(newState)) {
				currentUIState = newState;
			}
		}
	}
}

function navigateRight() {
	let depth = getDepth(currentUIState);
	
	if (depth === 1) {
		// At top level
		if (currentUIState === 'p0') {
			// p0 -> p1
			currentUIState = 'p1';
		} else if (currentUIState === 'p3') {
			// p3 -> play video2
			showingUI = false;
			if (video2Loaded && video2) {
				video2.time(0);
				video2.play();
				playingVideo2 = true;
			}
		}
		// p1, p2 don't have right navigation at top level (only deeper levels do)
	} else {
		// At deeper levels: navigate between siblings
		let base = currentUIState.slice(0, -1);
		let lastDigit = parseInt(currentUIState.slice(-1));
		let newDigit = lastDigit + 1;
		let newState = base + newDigit;
		
		if (availableImages.includes(newState)) {
			currentUIState = newState;
		}
	}
}

function navigateDown() {
	let depth = getDepth(currentUIState);
	
	if (depth === 1) {
		// At top level: handle p1->p2->p3 cycle
		if (currentUIState === 'p0') {
			// p0 doesn't cycle, only goes right to p1
			return;
		} else if (currentUIState === 'p1') {
			currentUIState = 'p2';
		} else if (currentUIState === 'p2') {
			currentUIState = 'p3';
		}
		// p3 stays at p3 when pressing down
	} else if (depth < 3) {
		// Go deeper: p1 -> p11, p11 -> p111
		let newState = currentUIState + '1';
		if (availableImages.includes(newState)) {
			currentUIState = newState;
			showingUI = true;
			// Pause video to save resources
			if (video && video.elt) {
				video.pause();
			}
		}
	}
}

function navigateUp() {
	let depth = getDepth(currentUIState);
	
	if (depth === 1) {
		// At top level: handle p3->p2->p1 cycle
		if (currentUIState === 'p0') {
			// p0 doesn't cycle, only goes right to p1
			return;
		} else if (currentUIState === 'p3') {
			currentUIState = 'p2';
		} else if (currentUIState === 'p2') {
			currentUIState = 'p1';
		}
		// p1 stays at p1 when pressing up
	} else if (depth > 1) {
		// Go back up: p111 -> p11, p11 -> p1
		let newState = currentUIState.slice(0, -1);
		if (availableImages.includes(newState)) {
			currentUIState = newState;
		}
	}
}

function mousePressed() {
	// Check if back button is clicked when video2 is frozen
	if (playingVideo2 && video2.time() >= video2.duration()) {
		let smallestSide = min(width, height);
		let btnSize = smallestSide / 6;
		let btnX = width - btnSize - 20;
		let btnY = height - btnSize - 20;
		
		if (mouseX >= btnX && mouseX <= btnX + btnSize &&
		    mouseY >= btnY && mouseY <= btnY + btnSize) {
			if (ticlicSound && ticlicSound.isLoaded()) {
				ticlicSound.play();
			}
			if (reverseVideo2Loaded && reverseVideo2) {
				reverseVideo2.time(0);
				reverseVideo2.play();
				playingReverseVideo2 = true;
			}
			return;
		}
	}
	
	if (waitingForButtonClick && isInsideButton(mouseX, mouseY)) {
		reverseVideo.pause(); // Ensure reverse video is paused
		video.play();
		waitingForButtonClick = false;
		playClickSound();
		buttonPressed = true;
		return;
	}
	// Check if in UI mode and button pressed
	if (showingUI && isInsideButton(mouseX, mouseY)) {
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
		
		// Check if in UI mode - exit and play reverse video
		if (showingUI) {
			showingUI = false;
			if (antijingleSound && antijingleSound.isLoaded()) {
				antijingleSound.stop();
				antijingleSound.setVolume(0.2);
				antijingleSound.play();
			}
			if (jingleSound && jingleSound.isLoaded()) {
				jingleSound.stop();
			}
			video.pause(); // Ensure main video is paused
			isPlaying = false;
			if (reverseVideoLoaded && reverseVideo) {
				reverseVideo.time(0);
				reverseVideo.play();
				playingReverseVideo = true;
			}
			buttonPressed = false;
			return;
		}
		
		let frame = Math.floor(video.time() * VIDEO_FRAMERATE);
		let buttonMoved = frame >= 30;
		   if (frame < 30 && !buttonClicked) {
			   if (!isPlaying && !playingReverseVideo) {
				   if (jingleSound && jingleSound.isLoaded()) {
					   jingleSound.stop(); // Stop any currently playing jingle
					   jingleSound.setVolume(0.2);
					   jingleSound.play();
				   }
				   if (antijingleSound && antijingleSound.isLoaded()) {
					   antijingleSound.stop(); // Stop antijingle if playing
			   }
			   reverseVideo.pause(); // Ensure reverse video is paused
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
			   video.pause(); // Stop main video
			   isPlaying = false;
			   if (reverseVideoLoaded && reverseVideo) {
				   reverseVideo.time(0);
				   reverseVideo.play();
				   playingReverseVideo = true;
			   }
		   }
	}
	// Arrow buttons
	let frame = Math.floor(video.time() * VIDEO_FRAMERATE);
	let buttonMoved = frame >= 30;
	if (buttonMoved) {
		let arrowIdx = isInsideArrowButton(mouseX, mouseY);
		if (arrowIdx !== -1) {
			// Handle navigation based on arrow button (order: down, left, up, right)
			if (arrowIdx === 0) navigateDown();
			else if (arrowIdx === 1) navigateLeft();
			else if (arrowIdx === 2) navigateUp();
			else if (arrowIdx === 3) navigateRight();
			
			if (ticlicSound && ticlicSound.isLoaded()) {
				ticlicSound.setVolume(0.4);
				ticlicSound.rate(0.8); // lower pitch
				ticlicSound.play();
			}
		}
	}
	buttonPressed = false;
}

function touchStarted() {
	// Check if touches exist and store coordinates
	if (!touches || touches.length === 0) return false;
	
	lastTouchX = touches[0].x;
	lastTouchY = touches[0].y;
	
	// Check if back button is clicked when video2 is frozen
	if (playingVideo2 && video2.time() >= video2.duration()) {
		let smallestSide = min(width, height);
		let btnSize = smallestSide / 6;
		let btnX = width - btnSize - 20;
		let btnY = height - btnSize - 20;
		
		if (lastTouchX >= btnX && lastTouchX <= btnX + btnSize &&
		    lastTouchY >= btnY && lastTouchY <= btnY + btnSize) {
			if (ticlicSound && ticlicSound.isLoaded()) {
				ticlicSound.play();
			}
			if (reverseVideo2Loaded && reverseVideo2) {
				reverseVideo2.time(0);
				reverseVideo2.play();
				playingReverseVideo2 = true;
			}
			return false;
		}
	}
	
	if (waitingForButtonClick && isInsideButton(lastTouchX, lastTouchY)) {
		reverseVideo.pause(); // Ensure reverse video is paused
		video.play();
		waitingForButtonClick = false;
		playClickSound();
		buttonPressed = true;
		return false; // Prevent default
	}
	// Check if in UI mode and button pressed
	if (showingUI && isInsideButton(lastTouchX, lastTouchY)) {
		playClickSound();
		buttonPressed = true;
		return false;
	}
	if (isInsideButton(lastTouchX, lastTouchY)) {
		playClickSound();
		buttonPressed = true;
	}
	// Arrow buttons
	let frame = Math.floor(video.time() * VIDEO_FRAMERATE);
	let buttonMoved = frame >= 30;
	if (buttonMoved) {
		let arrowIdx = isInsideArrowButton(lastTouchX, lastTouchY);
		if (arrowIdx !== -1 && ticlicSound && ticlicSound.isLoaded()) {
			ticlicSound.setVolume(0.4);
			ticlicSound.rate(1.3); // higher pitch
			ticlicSound.play();
		}
	}
	return false; // Prevent default
}

function touchEnded() {
	// Use stored touch coordinates from touchStarted
	if (buttonPressed && isInsideButton(lastTouchX, lastTouchY)) {
		if (clacSound && clacSound.isLoaded()) {
			clacSound.play();
		}
		
		// Check if in UI mode - exit and play reverse video
		if (showingUI) {
			showingUI = false;
			if (antijingleSound && antijingleSound.isLoaded()) {
				antijingleSound.stop();
				antijingleSound.setVolume(0.2);
				antijingleSound.play();
			}
			if (jingleSound && jingleSound.isLoaded()) {
				jingleSound.stop();
			}
			video.pause(); // Ensure main video is paused
			isPlaying = false;
			if (reverseVideoLoaded && reverseVideo) {
				reverseVideo.time(0);
				reverseVideo.play();
				playingReverseVideo = true;
			}
			buttonPressed = false;
			return false;
		}
		
		let frame = Math.floor(video.time() * VIDEO_FRAMERATE);
		let buttonMoved = frame >= 30;
		   if (frame < 30 && !buttonClicked) {
			   if (!isPlaying && !playingReverseVideo) {
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
			   video.pause(); // Stop main video
			   isPlaying = false;
			   if (reverseVideoLoaded && reverseVideo) {
				   reverseVideo.time(0);
				   reverseVideo.play();
				   playingReverseVideo = true;
			   }
		   }
	}
	// Arrow buttons
	let frame = Math.floor(video.time() * VIDEO_FRAMERATE);
	let buttonMoved = frame >= 30;
	if (buttonMoved) {
		let arrowIdx = isInsideArrowButton(lastTouchX, lastTouchY);
		if (arrowIdx !== -1) {
			// Handle navigation based on arrow button (order: down, left, up, right)
			if (arrowIdx === 0) navigateDown();
			else if (arrowIdx === 1) navigateLeft();
			else if (arrowIdx === 2) navigateUp();
			else if (arrowIdx === 3) navigateRight();
			
			if (ticlicSound && ticlicSound.isLoaded()) {
				ticlicSound.rate(0.8); // lower pitch
				ticlicSound.play();
			}
		}
	}
	buttonPressed = false;
	return false; // Prevent default
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
	// Use lighter noise in first frame mode, heavier in video playing mode
	let density = waitingForButtonClick ? 0.015 : 0.03;
	let alpha = waitingForButtonClick ? 0.05 : 0.1;
	let numDots = int(width * height * density / (dotSize * dotSize));
	for (let i = 0; i < numDots; i++) {
		let x = int(random(width));
		let y = int(random(height));
		let val = random(180, 255); // light noise
		noiseGfx.fill(val, 255 * alpha);
		noiseGfx.rect(x, y, dotSize, dotSize);
	}
	image(noiseGfx, 0, 0, width, height);
}






////////////////////////// EN FAIT //////////////////////////
//je sais comment je vais faire, pas de pdf, les projets etc interfaces seront en images
//avec une array[page1,page2 etc] pour faire des correspondance plus simples entre les images et les boutons
//genre if array[p]=[1] {
//if lowbtn=1 {
//array[p]==[p+1]}} et vice versa
//ça sera plus simple aussi pour la texture à appliquer pour incruster, ça sera direct sur les images
//et pour les animations aussi, je ferai des gifs optimisés (si possible ez avec P5 ou alors video)
