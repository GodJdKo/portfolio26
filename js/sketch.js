// Sound effects
let clickSound, jingleSound, antijingleSound, clacSound, ticlicSound;

// Fullscreen management
let fullscreenRequested = false;

function requestFullscreen() {
	if (fullscreenRequested) return;
	
	const elem = document.documentElement;
	if (elem.requestFullscreen) {
		elem.requestFullscreen().catch(err => console.log('Fullscreen request failed:', err));
		fullscreenRequested = true;
	} else if (elem.webkitRequestFullscreen) { // Safari
		elem.webkitRequestFullscreen();
		fullscreenRequested = true;
	} else if (elem.mozRequestFullScreen) { // Firefox
		elem.mozRequestFullScreen();
		fullscreenRequested = true;
	} else if (elem.msRequestFullscreen) { // IE/Edge
		elem.msRequestFullscreen();
		fullscreenRequested = true;
	}
}

// Images
let btnPressedImg, lightMaskImg, backUI0Img, backUIImg, extUI0Img, extUIImg;
let uiImages = {};
let firstFrameImages = [];
let noiseImages = [];

// Main canvas reference (for styling)
let mainCanvas = null;

// Video elements and states
let video, reverseVideo, video2, reverseVideo2, video3, video5;
let videoLoaded = false;
let reverseVideoLoaded = false;
let video2Loaded = false;
let reverseVideo2Loaded = false;
let video3Loaded = false;
let video5Loaded = false;

// Video4 frames (image sequence)
let video4Frames = [];
let video4FrameCount = 278; // video4-000.avif to video4-277.avif
let video4FramesLoaded = 0;
let video4Loaded = false;

// Non-iOS video4 caching policy
const VIDEO4_CACHE_RADIUS = 20; // keep at most 20 behind + 20 ahead (+ current)

// iOS ultra-light loading for video4 (prevent Safari crashes)
const VIDEO4_IOS_MAX_DIM = 768; // downscale long side to this max
const VIDEO4_IOS_LOAD_COOLDOWN = 90; // ms between starting loads
let video4IOSDesiredFrame = 0;
let video4IOSInFlightIndex = -1;
let video4IOSLastLoadStart = 0;
let video4IOSCachedIndex = -1;
let video4IOSCachedImage = null;
let playingReverseVideo = false;
let playingVideo2 = false;
let playingReverseVideo2 = false;
let playingVideo3 = false;
let playingVideo4 = false;
let playingVideo5 = false;
let isPlaying = false;

// UI Navigation
const availableImages = ['p0', 'p1', 'p2', 'p3', 'p11', 'p111', 'p112'];
let currentUIState = 'p0';
let showingUI = false;

// First frame animation
let currentFirstFrame = 0;
let lastFirstFrameChange = 0;
let firstFrameInterval = 100;

// Button states
let buttonClicked = false;
let buttonPressed = false;
let waitingForButtonClick = true;
let lastTouchX = 0;
let lastTouchY = 0;
let keyboardArrowPressed = -1; // -1 = none, 0=down, 1=left, 2=up, 3=right
let spaceKeyPressed = false; // Track spacebar for button
let enterKeyPressed = false; // Track enter key for button


// Video4 scroll control
let video4ScrollPosition = 0;
let video4CurrentFrame = 0;
let video4PrevFrame = 0;
let video4LastDisplayedFrame = 0;
let lastTouchYForScroll = 0;
let lastVideo4UpdateTime = 0;
let video4ScrollVelocity = 0;
let video4NeedsUpdate = false;
let video4LastAutoPlayTime = 0;
let video4LastScrollTime = 0;
let video4IsUserInteracting = false; // Track if user is holding mouse/touch
let video4UpKeyHeld = false; // Track if up arrow is held
let video4DownKeyHeld = false; // Track if down arrow is held
let video4LastKeyScrubTime = 0;
let video4LastWheelTime = 0; // Throttle wheel events
let video4LastTouchMoveTime = 0; // Throttle touch move events
const video4ScrollSpeed = 0.01; // Frames per scroll unit
const video4MinFrameInterval = 50; // Min 50ms between updates
let video4AutoPlaySpeed = 100; // ms per frame for auto-play (adjusted for iOS)
const video4AutoPlayDelay = 400; // Wait 1s after scroll before auto-playing
const video4KeyScrubSpeed = 50; // ms per frame when holding arrow key (faster than auto-play)
const video4WheelThrottle = 16; // Min 16ms between wheel updates (~60fps)
const video4TouchMoveThrottle = 32; // Min 32ms between touch updates on iOS (~30fps)

// Resource management - track last use times for cleanup
let lastVideo2Use = 0;
let lastVideo3Use = 0;
let lastVideo5Use = 0;
let lastReverseVideo2Use = 0;
let video4FrameLastUse = []; // Track last use time for each frame
let lastCleanupTime = 0;
const RESOURCE_TIMEOUT = 3000; // Unload resources after 3 seconds of non-use
const CLEANUP_INTERVAL = 1000; // Run cleanup every second

function preload() {
	// Setup all videos - only load essential ones initially
	video = setupVideo('img/video.mp4', () => {
		videoLoaded = true;
	});
	
	reverseVideo = setupVideo('img/reversevideo.mp4', () => {
		reverseVideoLoaded = true;
	});
	
	// Videos 2, 3, 5 will be loaded on-demand to save memory
	video2 = null;
	reverseVideo2 = null;
	video3 = null;
	video5 = null;
	
	// Video4 frames load on-demand for better performance
	video4Loaded = true;
	
	// Load sounds
	clickSound = loadSound('sound/clic.mp3');
	jingleSound = loadSound('sound/jingle.mp3');
	antijingleSound = loadSound('sound/antijingle.mp3');
	clacSound = loadSound('sound/clac.mp3');
	ticlicSound = loadSound('sound/ticlic.mp3');
	
	// Load images
	btnPressedImg = loadImage('img/btnpressed.jpg');
	lightMaskImg = loadImage('img/lightmask.png');
	backUI0Img = loadImage('img/UI/backUI0.png');
	backUIImg = loadImage('img/UI/backUI.png');
	extUI0Img = loadImage('img/UI/extUI0.png');
	extUIImg = loadImage('img/UI/extUI.png');
	
	// Load UI navigation images
	for (let imgName of availableImages) {
		uiImages[imgName] = loadImage(`img/UI/${imgName}.jpg`);
	}
	
	// Load first frame animation images
	let firstFrameLoadCount = 0;
	for (let i = 0; i < 5; i++) {
		firstFrameImages[i] = loadImage(`img/firstframe/firstframe${i}.jpg`, () => {
			firstFrameLoadCount++;
			// Trigger resize when first frame loads (Android Chrome fix)
			if (firstFrameLoadCount === 1) {
				setTimeout(() => {
					let w = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
					let h = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
					if (typeof resizeCanvas === 'function') {
						resizeCanvas(w, h);
						cachedDims = null;
						if (typeof applyNoSmoothing === 'function') applyNoSmoothing();
					}
				}, 100);
			}
		});
	}
	
	// Load noise images
	for (let i = 1; i <= 4; i++) {
		noiseImages[i - 1] = loadImage(`img/noise/noise${i}.png`);
	}
}

function setup() {
	let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
	
	// Get actual viewport dimensions (Android Chrome fix)
	let w = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
	let h = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
	
	// Ensure dimensions are reasonable (prevent GPU issues with extreme sizes)
	w = Math.min(w, 4096);
	h = Math.min(h, 4096);
	
	console.log('Creating canvas:', w, 'x', h);
	
	// Try WEBGL with multiple fallback strategies
	let canvas;
	let rendererMode = 'WEBGL';
	
	try {
		// First attempt: WEBGL with antialias disabled
		setAttributes('antialias', false);
		canvas = createCanvas(w, h, WEBGL);
		console.log('✓ Using WEBGL renderer (antialias off)');
	} catch (e) {
		console.warn('WebGL failed (antialias off):', e.message);
		try {
			// Second attempt: WEBGL with default attributes
			canvas = createCanvas(w, h, WEBGL);
			console.log('✓ Using WEBGL renderer (default attributes)');
		} catch (e2) {
			console.warn('WebGL failed (default):', e2.message);
			try {
				// Final fallback: P2D mode
				canvas = createCanvas(w, h, P2D);
				rendererMode = 'P2D';
				console.log('✓ Using P2D renderer (WebGL unavailable)');
			} catch (e3) {
				console.error('All renderers failed:', e3);
				// Show error to user
				document.body.innerHTML = '<div style="color:white;padding:40px;font-family:monospace;">Error: Unable to create canvas. Please try refreshing or use a different browser.</div>';
				throw e3;
			}
		}
	}
	
	mainCanvas = canvas;
	canvas.parent(document.body);
	canvas.style('display', 'block');
	canvas.style('position', 'fixed');
	canvas.style('top', '0');
	canvas.style('left', '0');
	canvas.style('margin', '0');
	canvas.style('padding', '0');
	applyNoSmoothing();
	
	// Optimize for iOS devices
	if (isIOS) {
		// Force lowest pixel density on iOS to prevent crashes
		pixelDensity(1);
		// Reduce frame rate on iOS for stability
		frameRate(20);
		// Slower auto-play on iOS to reduce memory pressure
		video4AutoPlaySpeed = 150;
	} else {
		frameRate(VIDEO_FRAMERATE);
		video4AutoPlaySpeed = 100;
	}
	
	if (video) video.time(0);
	
	// Auto-fix mobile stretching issues
	let checkCount = 0;
	const checkResize = setInterval(() => {
		checkCount++;
		let currentW = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
		let currentH = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
		
		// Fix if dimensions are wrong or aspect ratio is way off
		if (Math.abs(width - currentW) > 10 || Math.abs(height - currentH) > 10) {
			resizeCanvas(currentW, currentH);
			cachedDims = null;
			applyNoSmoothing();
		}
		
		// Stop checking after 3 seconds
		if (checkCount >= 15) {
			clearInterval(checkResize);
		}
	}, 200);
	
	// Prevent default touch behaviors
	document.documentElement.style.touchAction = 'none';
	document.documentElement.style.overflow = 'hidden';
	document.documentElement.style.position = 'fixed';
	document.documentElement.style.width = '100%';
	document.documentElement.style.height = '100%';
	document.documentElement.style.margin = '0';
	document.documentElement.style.padding = '0';
	
	document.body.style.touchAction = 'none';
	document.body.style.overflow = 'hidden';
	document.body.style.position = 'fixed';
	document.body.style.top = '0';
	document.body.style.left = '0';
	document.body.style.width = '100%';
	document.body.style.height = '100%';
	document.body.style.margin = '0';
	document.body.style.padding = '0';
	
	// Handle orientation changes
	window.addEventListener('orientationchange', () => {
		setTimeout(() => {
			let w = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
			let h = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
			resizeCanvas(w, h);
			cachedDims = null;
			applyNoSmoothing();
		}, 400);
	});

	// Extra resize correction hooks (helps rare stretched boot)
	document.addEventListener('visibilitychange', () => {
		if (!document.hidden) triggerSafeResizeSoon();
	});
	const oneShotResize = () => {
		triggerSafeResizeSoon();
		window.removeEventListener('touchstart', oneShotResize);
		window.removeEventListener('mousedown', oneShotResize);
		window.removeEventListener('keydown', oneShotResize);
	};
	window.addEventListener('touchstart', oneShotResize, { passive: true });
	window.addEventListener('mousedown', oneShotResize, { passive: true });
	window.addEventListener('keydown', oneShotResize, { passive: true });
	
	// Enable audio on iOS with user interaction
	if (isIOS) {
		document.addEventListener('touchstart', function enableAudio() {
			if (clickSound && clickSound.isLoaded()) {
				clickSound.setVolume(0.01);
				clickSound.play();
				clickSound.stop();
			}
			document.removeEventListener('touchstart', enableAudio);
		}, { once: true });
	}
}


// Video and canvas constants
const VIDEO_FRAMERATE = 24;
const videoOriginalWidth = 1080;
const videoOriginalHeight = 1920;

// Button positions
const buttonOriginalX = 370;
const buttonOriginalY = 1269;
const buttonW = 40;
const buttonH = 70;

const buttonOriginalX2 = 290;
const buttonOriginalY2 = 1375;
const buttonW2 = 60;
const buttonH2 = 100;

const squareButtons = [
	{ x: 550, y: 1355, size: 70 },
	{ x: 615, y: 1355, size: 70 },
	{ x: 680, y: 1355, size: 70 },
	{ x: 745, y: 1355, size: 70 }
];

// Helper function: Setup video with iOS compatibility
function setupVideo(videoPath, onLoadCallback) {
	let vid = createVideo([videoPath], onLoadCallback);
	vid.hide();
	
	if (vid.elt) {
		let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
		
		vid.elt.setAttribute('playsinline', 'true');
		vid.elt.setAttribute('webkit-playsinline', 'true');
		vid.elt.setAttribute('preload', isIOS ? 'none' : 'metadata');
		vid.elt.setAttribute('crossorigin', 'anonymous');
		vid.elt.muted = false;
		
		// Reduce quality on iOS for smoother playback
		if (isIOS) {
			vid.elt.style.imageRendering = 'auto';
		}
		
		// iOS needs user interaction to enable sound
		if (isIOS) {
			vid.elt.load();
		}
		
		vid.elt.addEventListener('loadedmetadata', () => {
			onLoadCallback();
			vid.time(0);
		});
		
		vid.elt.addEventListener('loadeddata', () => {
			onLoadCallback();
			vid.time(0);
		});
		
		vid.elt.addEventListener('error', (e) => {
			console.error(`Video load error for ${videoPath}:`, e);
		});
		
		if (vid.elt.readyState >= 1) {
			onLoadCallback();
			vid.time(0);
		}
	}
	
	return vid;
}

// Helper function: Load video on demand
function loadVideoOnDemand(videoPath, loadedFlag) {
	return new Promise((resolve) => {
		let vid = setupVideo(videoPath, () => {
			window[loadedFlag] = true;
			resolve(vid);
		});
	});
}

// Helper function: Calculate display dimensions for video/image
function getDisplayDimensions(sourceWidth, sourceHeight) {
	let aspect = sourceWidth / sourceHeight;
	let canvasAspect = width / height;
	let displayWidth, displayHeight, offsetX, offsetY;
	
	if (aspect > canvasAspect) {
		displayHeight = height;
		displayWidth = height * aspect;
		offsetX = (width - displayWidth) / 2;
		offsetY = 0;
	} else {
		displayWidth = width;
		displayHeight = width / aspect;
		offsetX = 0;
		offsetY = (height - displayHeight) / 2;
	}
	
	return { displayWidth, displayHeight, offsetX, offsetY };
}

// Helper function: Get button bounds for current video frame
function getButtonBounds() {
	let dims = getDisplayDimensions(video.width, video.height);
	let frame = Math.floor(video.time() * VIDEO_FRAMERATE);
	let bx, by, bw, bh;
	
	if (frame < 35) {
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
	
	let buttonX = dims.offsetX + (bx / videoOriginalWidth) * dims.displayWidth;
	let buttonY = dims.offsetY + (by / videoOriginalHeight) * dims.displayHeight;
	let buttonDisplayW = bw * (dims.displayWidth / videoOriginalWidth);
	let buttonDisplayH = bh * (dims.displayHeight / videoOriginalHeight);
	
	return { x: buttonX, y: buttonY, w: buttonDisplayW, h: buttonDisplayH, frame };
}

// Cache for dimension calculations
let cachedDims = null;
let lastCanvasSize = { w: 0, h: 0 };

// Helper: Draw random noise overlay
function drawNoise(dims) {
	if (noiseImages.length > 0) {
		let randomNoise = noiseImages[floor(random(noiseImages.length))];
		if (randomNoise) {
			blendMode(MULTIPLY);
			image(randomNoise, dims.offsetX, dims.offsetY, dims.displayWidth, dims.displayHeight);
			blendMode(BLEND);
		}
	}
}

function disposeVideo4Frame(frame) {
	if (!frame) return;
	try {
		if (frame.elt && frame.elt.removeAttribute) frame.elt.removeAttribute('src');
	} catch (e) {}
	try {
		if (frame.remove) frame.remove();
	} catch (e) {}
	try {
		if (frame.canvas) {
			frame.canvas.width = 1;
			frame.canvas.height = 1;
		}
	} catch (e) {}
}

function enforceVideo4CacheWindow(frameIndex, radius) {
	// Hard cap the number of decoded frames kept in memory.
	for (let i = 0; i < video4FrameCount; i++) {
		if (!video4Frames[i]) continue;
		if (Math.abs(i - frameIndex) > radius) {
			disposeVideo4Frame(video4Frames[i]);
			video4Frames[i] = null;
			video4FrameLastUse[i] = 0;
		}
	}
}

function downscaleToGraphicsIfNeeded(img, maxDim) {
	if (!img || !img.width || !img.height) return img;
	let scale = Math.min(1, maxDim / Math.max(img.width, img.height));
	if (scale >= 1) return img;

	let targetW = Math.max(1, Math.round(img.width * scale));
	let targetH = Math.max(1, Math.round(img.height * scale));
	let g = createGraphics(targetW, targetH);
	try { g.noSmooth(); } catch (e) {}
	g.image(img, 0, 0, targetW, targetH);
	disposeVideo4Frame(img);
	return g;
}

function resetVideo4IOSCache() {
	video4IOSDesiredFrame = 0;
	video4IOSInFlightIndex = -1;
	video4IOSLastLoadStart = 0;
	video4IOSCachedIndex = -1;
	if (video4IOSCachedImage) {
		disposeVideo4Frame(video4IOSCachedImage);
		video4IOSCachedImage = null;
	}
	// Always clear the video4 frame cache (all platforms) to truly free memory.
	for (let i = 0; i < video4FrameCount; i++) {
		if (video4Frames[i]) {
			disposeVideo4Frame(video4Frames[i]);
			video4Frames[i] = null;
		}
		video4FrameLastUse[i] = 0;
	}
}

function triggerSafeResizeSoon() {
	requestAnimationFrame(() => {
		setTimeout(() => {
			try {
				windowResized();
			} catch (e) {}
		}, 120);
	});
}

function applyNoSmoothing() {
	// p5-side (affects how p5 draws scaled images/textures)
	try { noSmooth(); } catch (e) {}
	try { forceWebGLNearestNeighbor(); } catch (e) {}

	// CSS-side: prevent browser filtering when the canvas is scaled
	const canvasEl = (mainCanvas && mainCanvas.elt) ? mainCanvas.elt : document.querySelector('canvas');
	if (!canvasEl) return;

	const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
	const target = isIOS ? 'crisp-edges' : 'pixelated';
	if (canvasEl.dataset && canvasEl.dataset.noSmoothingApplied === '1' && canvasEl.dataset.imageRendering === target) {
		return;
	}
	canvasEl.style.setProperty('image-rendering', target);
	canvasEl.style.setProperty('-ms-interpolation-mode', 'nearest-neighbor');
	if (canvasEl.dataset) {
		canvasEl.dataset.noSmoothingApplied = '1';
		canvasEl.dataset.imageRendering = target;
	}
}

function forceWebGLNearestNeighbor() {
	// In WEBGL, image() uses textures. WebGL defaults to LINEAR filtering,
	// which makes UI images (like backUI.png) and frame sequences look smoothed.
	const gl = (typeof drawingContext !== 'undefined') ? drawingContext : null;
	if (!gl || typeof gl.texParameteri !== 'function') return;
	if (gl.__copilotNearestPatched) return;

	const originalTexParameteri = gl.texParameteri.bind(gl);
	gl.texParameteri = (target, pname, param) => {
		if (pname === gl.TEXTURE_MIN_FILTER || pname === gl.TEXTURE_MAG_FILTER) {
			if (param === gl.LINEAR) param = gl.NEAREST;
			else if (param === gl.LINEAR_MIPMAP_LINEAR || param === gl.LINEAR_MIPMAP_NEAREST || param === gl.NEAREST_MIPMAP_LINEAR) {
				param = gl.NEAREST_MIPMAP_NEAREST;
			}
		}
		return originalTexParameteri(target, pname, param);
	};

	gl.__copilotNearestPatched = true;
}

// Helper: Clean up unused resources to free memory
function cleanupUnusedResources() {
	let currentTime = millis();
	
	// Only run cleanup every CLEANUP_INTERVAL
	if (currentTime - lastCleanupTime < CLEANUP_INTERVAL) return;
	lastCleanupTime = currentTime;
	
	let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
	
	// Determine which videos are needed for current state (to avoid premature unloading)
	let needsVideo2 = (currentUIState === 'p2' || currentUIState === 'p3') || playingVideo2;
	let needsReverseVideo2 = (currentUIState === 'p2' || currentUIState === 'p3') || playingReverseVideo2;
	let needsVideo3 = (currentUIState === 'p1' || currentUIState === 'p2') || playingVideo3;
	let needsVideo5 = (currentUIState === 'p1' || currentUIState === 'p2') || playingVideo5;
	
	// Unload video2 only if not needed and not used recently
	if (video2 && !needsVideo2 && currentTime - lastVideo2Use > RESOURCE_TIMEOUT) {
		if (video2.elt) {
			video2.elt.pause();
			video2.elt.removeAttribute('src');
			video2.remove();
		}
		video2 = null;
		video2Loaded = false;
	}
	
	// Unload reverseVideo2 only if not needed and not used recently
	if (reverseVideo2 && !needsReverseVideo2 && currentTime - lastReverseVideo2Use > RESOURCE_TIMEOUT) {
		if (reverseVideo2.elt) {
			reverseVideo2.elt.pause();
			reverseVideo2.elt.removeAttribute('src');
			reverseVideo2.remove();
		}
		reverseVideo2 = null;
		reverseVideo2Loaded = false;
	}
	
	// Unload video3 only if not needed and not used recently
	if (video3 && !needsVideo3 && currentTime - lastVideo3Use > RESOURCE_TIMEOUT) {
		if (video3.elt) {
			video3.elt.pause();
			video3.elt.removeAttribute('src');
			video3.remove();
		}
		video3 = null;
		video3Loaded = false;
	}
	
	// Unload video5 only if not needed and not used recently
	if (video5 && !needsVideo5 && currentTime - lastVideo5Use > RESOURCE_TIMEOUT) {
		if (video5.elt) {
			video5.elt.pause();
			video5.elt.removeAttribute('src');
			video5.remove();
		}
		video5 = null;
		video5Loaded = false;
	}
	
	// Clean up video4 frames: enforce strict window while video4 is active
	if (playingVideo4) {
		let frameIndex = floor(constrain(video4CurrentFrame, 0, video4FrameCount - 1));
		// Enforce a strict window to keep memory bounded.
		enforceVideo4CacheWindow(frameIndex, VIDEO4_CACHE_RADIUS);
	}
}

function draw() {
	// WebGL setup
	noSmooth();
	background(0);
	
	// Clean up unused resources periodically
	cleanupUnusedResources();
	
	// Reset WebGL transformations and use 2D-style coordinates
	// In WEBGL mode, origin is at center, so translate to top-left
	// In P2D mode, origin is already at top-left, so only translate if WEBGL
	push();
	if (drawingContext && drawingContext.canvas && drawingContext.canvas.getContext('webgl')) {
		translate(-width/2, -height/2);
	}
	
	// Cache dimensions to avoid recalculation every frame
	if (!cachedDims || lastCanvasSize.w !== width || lastCanvasSize.h !== height) {
		cachedDims = getDisplayDimensions(video.width, video.height);
		lastCanvasSize = { w: width, h: height };
	}
	let dims = cachedDims;
	
	// Fallback video load check
	if (!videoLoaded && video.width > 0 && video.elt.readyState >= 2) {
		videoLoaded = true;
		video.time(0);
	}
	
	// Render reverse video
	if (playingReverseVideo) {
		if (reverseVideoLoaded && reverseVideo && reverseVideo.elt && reverseVideo.elt.readyState >= 3) {
			image(reverseVideo, dims.offsetX, dims.offsetY, dims.displayWidth, dims.displayHeight);
			
			if (reverseVideo.time() >= reverseVideo.duration()) {
				reverseVideo.pause();
				reverseVideo.time(0);
				playingReverseVideo = false;
				video.pause();
				video.time(0);
				buttonClicked = false;
				waitingForButtonClick = true;
			}
		}
		// Fallback: keep showing the last available main video frame (avoid black flash)
		else if (videoLoaded && video && video.elt && video.elt.readyState >= 2) {
			image(video, dims.offsetX, dims.offsetY, dims.displayWidth, dims.displayHeight);
		}
		drawNoise(dims);
		return;
	}
	
	// Render reversevideo2
	if (playingReverseVideo2) {
		lastReverseVideo2Use = millis();
		if (reverseVideo2Loaded && reverseVideo2 && reverseVideo2.elt && reverseVideo2.elt.readyState >= 3) {
			// Calculate fresh dimensions for reverseVideo2
			let reverseVideo2Dims = getDisplayDimensions(reverseVideo2.width, reverseVideo2.height);
			image(reverseVideo2, reverseVideo2Dims.offsetX, reverseVideo2Dims.offsetY, reverseVideo2Dims.displayWidth, reverseVideo2Dims.displayHeight);
			
			if (reverseVideo2.time() >= reverseVideo2.duration()) {
				reverseVideo2.pause();
				reverseVideo2.time(0);
				playingReverseVideo2 = false;
				playingVideo2 = false;
				currentUIState = 'p3';
				showingUI = true;
			}
			drawNoise(reverseVideo2Dims);
		}
		// Fallback: keep showing frozen video2 (or UI) until reverseVideo2 is ready
		else {
			if (video2Loaded && video2 && video2.elt && video2.elt.readyState >= 2) {
				let video2Dims = getDisplayDimensions(video2.width, video2.height);
				image(video2, video2Dims.offsetX, video2Dims.offsetY, video2Dims.displayWidth, video2Dims.displayHeight);
				drawNoise(video2Dims);
			} else if (uiImages['p3']) {
				let img = uiImages['p3'];
				let uiDims = getDisplayDimensions(img.width, img.height);
				image(img, uiDims.offsetX, uiDims.offsetY, uiDims.displayWidth, uiDims.displayHeight);
				drawNoise(uiDims);
			}
		}
		return;
	}
	
	// Render video5 (exit transition from video4)
	if (playingVideo5) {
		lastVideo5Use = millis();
		if (video5Loaded && video5 && video5.elt && video5.elt.readyState >= 3) {
			// Calculate fresh dimensions for video5
			let video5Dims = getDisplayDimensions(video5.width, video5.height);
			image(video5, video5Dims.offsetX, video5Dims.offsetY, video5Dims.displayWidth, video5Dims.displayHeight);
			
			if (video5.time() >= video5.duration()) {
				video5.pause();
				video5.time(0);
				playingVideo5 = false;
				playingVideo4 = false;
				playingVideo3 = false;
				// Reset button states for UI interaction
				buttonPressed = false;
				buttonClicked = false;
				// Enter UI mode at p2 with buttons fully interactive
				currentUIState = 'p2';
				showingUI = true;
				// Ensure main video is paused
				if (video && video.elt) {
					video.pause();
					isPlaying = false;
				}
			}
			drawNoise(video5Dims);
		}
		// Fallback: keep showing the last video4 frame while video5 loads
		else {
			let fallbackDrawn = false;
			if (video4Frames[video4LastDisplayedFrame] && video4Frames[video4LastDisplayedFrame].width > 0) {
				image(video4Frames[video4LastDisplayedFrame], dims.offsetX, dims.offsetY, dims.displayWidth, dims.displayHeight);
				fallbackDrawn = true;
			}
			if (fallbackDrawn) drawNoise(dims);
		}
		return;
	}
	
	// Render video4 with back button (using frame sequence)
	if (playingVideo4) {
		if (video4Loaded) {
			// Auto-play frames slowly if not scrolling and not interacting
			let currentTime = millis();
			let timeSinceScroll = currentTime - video4LastScrollTime;
			
			// Handle continuous key scrubbing when arrow keys are held
			if (video4UpKeyHeld || video4DownKeyHeld) {
				let timeSinceKeyScrub = currentTime - video4LastKeyScrubTime;
				if (timeSinceKeyScrub >= video4KeyScrubSpeed) {
					if (video4UpKeyHeld) {
						video4CurrentFrame = constrain(video4CurrentFrame - 1, 0, video4FrameCount - 1);
					} else if (video4DownKeyHeld) {
						video4CurrentFrame = constrain(video4CurrentFrame + 1, 0, video4FrameCount - 1);
					}
					video4LastKeyScrubTime = currentTime;
					video4LastScrollTime = currentTime;
				}
			}
			// Else if enough time has passed since last scroll and user is not interacting, auto-play
			else if (!video4IsUserInteracting && timeSinceScroll > video4AutoPlayDelay) {
				let timeSinceAutoPlay = currentTime - video4LastAutoPlayTime;
				if (timeSinceAutoPlay >= video4AutoPlaySpeed) {
					video4CurrentFrame = constrain(video4CurrentFrame + 1, 0, video4FrameCount - 1);
					video4LastAutoPlayTime = currentTime;
				}
			}
			
			// Get current frame index
			let frameIndex = floor(constrain(video4CurrentFrame, 0, video4FrameCount - 1));
			let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
			
			if (isIOS) {
				// iOS: use the same bounded cache window as other platforms, but
				// keep only one in-flight decode and downscale frames.
				let now = millis();
				let canStart = (video4IOSInFlightIndex === -1) && (now - video4IOSLastLoadStart >= VIDEO4_IOS_LOAD_COOLDOWN);
				
				// Keep memory bounded aggressively while scrubbing.
				if (frameIndex !== video4PrevFrame) {
					enforceVideo4CacheWindow(frameIndex, VIDEO4_CACHE_RADIUS);
					video4PrevFrame = frameIndex;
				}
				
				video4IOSDesiredFrame = frameIndex;
				let desired = frameIndex;
				if (video4Frames[desired]) {
					for (let d = 1; d <= VIDEO4_CACHE_RADIUS; d++) {
						let a = frameIndex - d;
						let b = frameIndex + d;
						if (a >= 0 && !video4Frames[a] && a !== video4IOSInFlightIndex) { desired = a; break; }
						if (b < video4FrameCount && !video4Frames[b] && b !== video4IOSInFlightIndex) { desired = b; break; }
					}
				}
				
				if (!video4Frames[desired] && canStart) {
					video4IOSInFlightIndex = desired;
					video4IOSLastLoadStart = now;
					let frameNum = nf(desired, 3);
					loadImage(
						`img/video4/video4-${frameNum}.avif`,
						(img) => {
							let stored = downscaleToGraphicsIfNeeded(img, VIDEO4_IOS_MAX_DIM);
							video4Frames[desired] = stored;
							video4FrameLastUse[desired] = millis();
							video4IOSInFlightIndex = -1;
						},
						() => {
							if (video4IOSInFlightIndex === desired) video4IOSInFlightIndex = -1;
						}
					);
				}
				
				// Draw current frame if ready; otherwise keep last displayed frame.
				if (video4Frames[frameIndex] && video4Frames[frameIndex].width > 0) {
					image(video4Frames[frameIndex], dims.offsetX, dims.offsetY, dims.displayWidth, dims.displayHeight);
					video4LastDisplayedFrame = frameIndex;
					video4FrameLastUse[frameIndex] = millis();
				} else if (video4Frames[video4LastDisplayedFrame] && video4Frames[video4LastDisplayedFrame].width > 0) {
					image(video4Frames[video4LastDisplayedFrame], dims.offsetX, dims.offsetY, dims.displayWidth, dims.displayHeight);
					video4FrameLastUse[video4LastDisplayedFrame] = millis();
				}
			} else {
				// Non-iOS: prefetch and cache multiple frames
				if (frameIndex !== video4PrevFrame) {
					enforceVideo4CacheWindow(frameIndex, VIDEO4_CACHE_RADIUS);
					let preloadRadius = VIDEO4_CACHE_RADIUS;
					for (let i = 0; i <= preloadRadius; i++) {
						let preloadIndex = frameIndex + i;
						if (preloadIndex >= 0 && preloadIndex < video4FrameCount && !video4Frames[preloadIndex]) {
							let frameNum = nf(preloadIndex, 3);
							video4Frames[preloadIndex] = loadImage(`img/video4/video4-${frameNum}.avif`,
								() => {},
								() => {
									setTimeout(() => {
										if (!video4Frames[preloadIndex] || video4Frames[preloadIndex].width === 0) {
											video4Frames[preloadIndex] = loadImage(`img/video4/video4-${frameNum}.avif`);
										}
									}, 1000);
								}
							);
						}
					}
					let backRadius = Math.floor(preloadRadius / 2);
					for (let i = 1; i <= backRadius; i++) {
						let preloadIndex = frameIndex - i;
						if (preloadIndex >= 0 && preloadIndex < video4FrameCount && !video4Frames[preloadIndex]) {
							let frameNum = nf(preloadIndex, 3);
							video4Frames[preloadIndex] = loadImage(`img/video4/video4-${frameNum}.avif`);
						}
					}
					video4PrevFrame = frameIndex;
				}
				
				if (video4Frames[frameIndex] && video4Frames[frameIndex].width > 0) {
					image(video4Frames[frameIndex], dims.offsetX, dims.offsetY, dims.displayWidth, dims.displayHeight);
					video4LastDisplayedFrame = frameIndex;
					video4FrameLastUse[frameIndex] = millis();
				} else if (video4Frames[video4LastDisplayedFrame] && video4Frames[video4LastDisplayedFrame].width > 0) {
					image(video4Frames[video4LastDisplayedFrame], dims.offsetX, dims.offsetY, dims.displayWidth, dims.displayHeight);
					video4FrameLastUse[video4LastDisplayedFrame] = millis();
				}
			}
		}
		
		// Draw back button while video4 is playing (but not when video5 is playing)
		if (!playingVideo5 && backUI0Img && backUIImg) {
			let smallestSide = min(width, height);
			let btnSize = smallestSide / 5;
			let btnX = width - btnSize - 30;
			let btnY = height - btnSize - 90;
			
			let isHovered = mouseX >= btnX && mouseX <= btnX + btnSize &&
			                mouseY >= btnY && mouseY <= btnY + btnSize;
			
			document.body.style.cursor = isHovered ? 'pointer' : 'default';
			image(isHovered ? backUIImg : backUI0Img, btnX, btnY, btnSize, btnSize);
		}
		
		drawNoise(dims);
		return;
	}
	
	// Render video3 (entrance transition to video4)
	if (playingVideo3) {
		lastVideo3Use = millis();
		if (video3Loaded && video3 && video3.elt && video3.elt.readyState >= 3) {
			// Calculate fresh dimensions for video3
			let video3Dims = getDisplayDimensions(video3.width, video3.height);
			image(video3, video3Dims.offsetX, video3Dims.offsetY, video3Dims.displayWidth, video3Dims.displayHeight);
			
			if (video3.time() >= video3.duration()) {
				video3.pause();
				video3.time(video3.duration());
				playingVideo3 = false;
				// Start video4 (frame-based, ready for scroll control)
				if (video4Loaded) {
					resetVideo4IOSCache();
					playingVideo4 = true;
					video4CurrentFrame = 0;
					video4PrevFrame = 0;
					video4LastDisplayedFrame = 0;
					video4LastAutoPlayTime = millis();
					video4LastScrollTime = 0;
				}
			}
			drawNoise(video3Dims);
		}
		// Fallback: keep showing UI until video3 is ready
		else if (showingUI && uiImages[currentUIState]) {
			let img = uiImages[currentUIState];
			let uiDims = getDisplayDimensions(img.width, img.height);
			image(img, uiDims.offsetX, uiDims.offsetY, uiDims.displayWidth, uiDims.displayHeight);
			drawNoise(uiDims);
		}
		return;
	}
	
	// Render video2 with back button
	if (playingVideo2) {
		lastVideo2Use = millis();
		if (video2Loaded && video2 && video2.elt && video2.elt.readyState >= 3) {
			// Calculate fresh dimensions for video2
			let video2Dims = getDisplayDimensions(video2.width, video2.height);
			
			// Enable smoothing for video2 to preserve text legibility (especially last frame)
			push();
			try { smooth(); } catch(e) {}
			image(video2, video2Dims.offsetX, video2Dims.offsetY, video2Dims.displayWidth, video2Dims.displayHeight);
			pop();
			try { noSmooth(); } catch(e) {}
			
			// Ensure video is paused at end (iPad fix)
			if (video2.time() >= video2.duration() - 0.1) {
				video2.pause();
				video2.time(video2.duration());
			}
		}
		// Fallback: keep showing UI until video2 is ready
		else if (showingUI && uiImages[currentUIState]) {
			let img = uiImages[currentUIState];
			let uiDims = getDisplayDimensions(img.width, img.height);
			image(img, uiDims.offsetX, uiDims.offsetY, uiDims.displayWidth, uiDims.displayHeight);
			drawNoise(uiDims);
		}
		
		// Draw back button when video2 is at the end (but not when reverseVideo2 is playing)
		if (video2.time() >= video2.duration() - 0.1 && !playingReverseVideo2 && backUI0Img && backUIImg) {
			let smallestSide = min(width, height);
			let btnSize = smallestSide / 5;
			let btnX = width - btnSize - 30;
			let btnY = height - btnSize - 90;
			
			let isHovered = mouseX >= btnX && mouseX <= btnX + btnSize &&
			                mouseY >= btnY && mouseY <= btnY + btnSize;
			
			document.body.style.cursor = isHovered ? 'pointer' : 'default';
			image(isHovered ? backUIImg : backUI0Img, btnX, btnY, btnSize, btnSize);
		}
		
		if (video2Loaded && video2) {
			let video2Dims = getDisplayDimensions(video2.width, video2.height);
			drawNoise(video2Dims);
		}
		return;
	}
	
	// Render UI mode
	if (showingUI && uiImages[currentUIState]) {
		let img = uiImages[currentUIState];
		let uiDims = getDisplayDimensions(img.width, img.height);
		
		image(img, uiDims.offsetX, uiDims.offsetY, uiDims.displayWidth, uiDims.displayHeight);
		
		// Preload videos when user is in p1 or p2 state (before they need them)
		if (currentUIState === 'p1' || currentUIState === 'p2') {
			if (!video3 && !video3Loaded) {
				video3 = setupVideo('img/video3.mp4', () => { video3Loaded = true; });
				lastVideo3Use = millis();
			}
			if (!video5 && !video5Loaded) {
				video5 = setupVideo('img/video5.mp4', () => { video5Loaded = true; });
				lastVideo5Use = millis();
			}
		}
		if (currentUIState === 'p2' || currentUIState === 'p3') {
			if (!video2 && !video2Loaded) {
				video2 = setupVideo('img/video2.mp4', () => { video2Loaded = true; });
				lastVideo2Use = millis();
			}
			if (!reverseVideo2 && !reverseVideo2Loaded) {
				reverseVideo2 = setupVideo('img/reversevideo2.mp4', () => { reverseVideo2Loaded = true; });
				lastReverseVideo2Use = millis();
			}
		}
		
		// Render button press effects in UI mode
		if (buttonPressed) {
			renderButtonPressEffect(uiDims, true);
		}
		
		// Draw external link button if link is defined for current state
		const currentLink = navigationMap[currentUIState]?.link;
		if (currentLink && extUI0Img && extUIImg) {
			let smallestSide = min(width, height);
			let btnSize = smallestSide / 5;
			let btnX = 30; // Bottom left corner
			let btnY = height - btnSize - 90;
			
			let isHovered = mouseX >= btnX && mouseX <= btnX + btnSize &&
			                mouseY >= btnY && mouseY <= btnY + btnSize;
			
			if (isHovered) {
				document.body.style.cursor = 'pointer';
			}
			image(isHovered ? extUIImg : extUI0Img, btnX, btnY, btnSize, btnSize);
		}
		
		// Render arrow button press effects
		renderArrowButtonEffects(uiDims);
		
		drawNoise(uiDims);
		return;
	}
	
	// Show loading if video not ready
	if (!videoLoaded) {
		push();
		fill(255);
		textAlign(CENTER, CENTER);
		textSize(16);
		text("Loading...", 0, 0); // WebGL center
		pop();
		drawNoise(dims);
		pop(); // Close main transformation
		return;
	}
	
	image(video, dims.offsetX, dims.offsetY, dims.displayWidth, dims.displayHeight);
	
	// Render first frame animation
	if (waitingForButtonClick) {
		let now = millis();
		if (now - lastFirstFrameChange >= firstFrameInterval) {
			currentFirstFrame = (currentFirstFrame + 1) % 5;
			lastFirstFrameChange = now;
		}
		
		if (firstFrameImages[currentFirstFrame]) {
			image(firstFrameImages[currentFirstFrame], dims.offsetX, dims.offsetY, dims.displayWidth, dims.displayHeight);
		}
		
		
		if (buttonPressed && btnPressedImg) {
			image(btnPressedImg, dims.offsetX, dims.offsetY, dims.displayWidth, dims.displayHeight);
		}
		
		let bounds = getButtonBounds();
		document.body.style.cursor = (mouseX >= bounds.x && mouseX <= bounds.x + bounds.w &&
		                              mouseY >= bounds.y && mouseY <= bounds.y + bounds.h) ? 'pointer' : 'default';
		drawNoise(dims);
		return;
	}
	
	// Handle video playback - cache bounds calculation
	let bounds = getButtonBounds();
	let buttonMoved = bounds.frame >= 35;
	
	// Update cursor
	updateCursor(bounds, buttonMoved, dims);
	
	
	// Check if video ended
	if (isPlaying && video.time() >= video.duration()) {
		video.pause();
		video.time(video.duration());
		isPlaying = false;
		reverseVideo.pause();
		currentUIState = 'p0';
		showingUI = true;
	}
	
	// Reset buttonClicked when button moves
	if (buttonMoved && buttonClicked) {
		buttonClicked = false;
	}
	
	// Render button press effects
	if (buttonPressed) {
		renderButtonPressEffect(dims, buttonMoved);
	}
	
	// Render arrow button effects
	if (buttonMoved) {
		renderArrowButtonEffects(dims);
	}
	
	drawNoise(dims);
	pop(); // Close WebGL transformation
}

// Helper: Update cursor based on button/arrow hover
function updateCursor(bounds, buttonMoved, dims) {
	// Force default cursor during transition videos
	if (playingReverseVideo || playingReverseVideo2 || playingVideo3 || playingVideo4 || playingVideo5) {
		document.body.style.cursor = 'default';
		return;
	}
	
	let arrowHovered = false;
	
	if (buttonMoved) {
		let scaleFactor = dims.displayWidth / videoOriginalWidth;
		for (let btn of squareButtons) {
			let btnX = dims.offsetX + (btn.x / videoOriginalWidth) * dims.displayWidth;
			let btnY = dims.offsetY + (btn.y / videoOriginalHeight) * dims.displayHeight;
			let btnSize = btn.size * scaleFactor;
			if (mouseX >= btnX && mouseX <= btnX + btnSize &&
			    mouseY >= btnY && mouseY <= btnY + btnSize) {
				arrowHovered = true;
				break;
			}
		}
	}
	
	let onButton = (!buttonClicked || buttonMoved) && isInsideButton(mouseX, mouseY);
	document.body.style.cursor = (onButton || arrowHovered) ? 'pointer' : 'default';
}

// Helper: Render button press effects
function renderButtonPressEffect(dims, buttonMoved) {
	if (!lightMaskImg) return;
	
	if (buttonMoved) {
		let scaleX = dims.displayWidth / videoOriginalWidth;
		let scaleY = dims.displayHeight / videoOriginalHeight;
		let buttonX = dims.offsetX + (buttonOriginalX2 * scaleX);
		let buttonY = dims.offsetY + (buttonOriginalY2 * scaleY);
		let buttonDisplayW = buttonW2 * scaleX;
		let buttonDisplayH = buttonH2 * scaleY;
		let maskOffsetX = 12 * scaleX;
		let maskOffsetY = 23 * scaleY;
		let maskExtraW = 20 * scaleX;
		let maskExtraH = 39 * scaleY;
		image(lightMaskImg, buttonX - maskOffsetX, buttonY - maskOffsetY, 
		      buttonDisplayW + maskExtraW, buttonDisplayH + maskExtraH);
	} else if (btnPressedImg) {
		image(btnPressedImg, dims.offsetX, dims.offsetY, dims.displayWidth, dims.displayHeight);
	}
}

// Helper: Render arrow button press effects
function renderArrowButtonEffects(dims) {
	if (!lightMaskImg) return;
	
	let scaleFactor = dims.displayWidth / videoOriginalWidth;
	let maskInset = 10 * scaleFactor;
	
	for (let i = 0; i < squareButtons.length; i++) {
		let btn = squareButtons[i];
		let btnX = dims.offsetX + (btn.x / videoOriginalWidth) * dims.displayWidth;
		let btnY = dims.offsetY + (btn.y / videoOriginalHeight) * dims.displayHeight;
		let btnSize = btn.size * scaleFactor;
		
		let pressed = false;
		
		// Check keyboard press
		if (keyboardArrowPressed === i) {
			pressed = true;
		}
		
		// Check mouse press
		if (!pressed && mouseIsPressed && mouseButton === LEFT &&
		    mouseX >= btnX && mouseX <= btnX + btnSize &&
		    mouseY >= btnY && mouseY <= btnY + btnSize) {
			pressed = true;
		}
		
		// Check touch press
		if (!pressed && touches && touches.length > 0) {
			for (let t of touches) {
				if (t.x >= btnX && t.x <= btnX + btnSize &&
				    t.y >= btnY && t.y <= btnY + btnSize) {
					pressed = true;
					break;
				}
			}
		}
		
		if (pressed) {
			image(lightMaskImg, btnX + maskInset, btnY + maskInset, 
			      btnSize - (maskInset * 2), btnSize - (maskInset * 2));
		}
	}
}

// Helper: Check if point is inside button
function isInsideButton(px, py) {
	let bounds = getButtonBounds();
	let frame = bounds.frame;
	
	if (frame < 35 && buttonClicked) return false;
	
	return (px >= bounds.x && px <= bounds.x + bounds.w &&
	        py >= bounds.y && py <= bounds.y + bounds.h);
}

// Helper: Check if point is inside arrow button (returns index or -1)
function isInsideArrowButton(px, py) {
	let dims = getDisplayDimensions(video.width, video.height);
	let scaleFactor = dims.displayWidth / videoOriginalWidth;
	
	for (let i = 0; i < squareButtons.length; i++) {
		let btn = squareButtons[i];
		let btnX = dims.offsetX + (btn.x / videoOriginalWidth) * dims.displayWidth;
		let btnY = dims.offsetY + (btn.y / videoOriginalHeight) * dims.displayHeight;
		let btnSize = btn.size * scaleFactor;
		
		if (px >= btnX && px <= btnX + btnSize &&
		    py >= btnY && py <= btnY + btnSize) {
			return i;
		}
	}
	return -1;
}

function playClickSound() {
	if (clickSound && clickSound.isLoaded()) {
		clickSound.rate(random(0.95, 1.05));
		clickSound.play();
	}
}

// Helper: Play sound with volume control
function playSound(sound, volume = 0.2, rate = 1) {
	if (sound && sound.isLoaded()) {
		// Stop and reset to prevent overlap/crackling
		if (sound.isPlaying()) {
			sound.stop();
		}
		sound.setVolume(volume);
		sound.rate(rate);
		// Small delay on iOS to prevent crackling
		let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
		if (isIOS) {
			setTimeout(() => {
				if (sound && sound.isLoaded()) sound.play();
			}, 10);
		} else {
			sound.play();
		}
	}
}

// Helper: Stop sound
function stopSound(sound) {
	if (sound && sound.isLoaded()) {
		sound.stop();
	}
}

// Navigation functions
// Navigation map: define where each state goes for each direction
// Format: 'state': { up: 'targetState', down: 'targetState', left: 'targetState', right: 'targetState', link: 'https://example.com' }
// Use null or omit direction if it shouldn't change state
// Use 'VIDEO_3' or 'VIDEO_2' for special video transitions
// Add 'link' property to show external link button (opens in new tab)
const navigationMap = {
	'p0': { right: 'p1' },
	'p1': { left: 'p0', down: 'p2', right: 'p11' },
	'p2': { left: 'p0', up: 'p1', down: 'p3', right: 'VIDEO_3' },
	'p3': { left: 'p0', up: 'p2', right: 'VIDEO_2' },
	'p11': { left: 'p1', right: 'p111', link: 'https://github.com/godjdko/portfolio26' },
	'p111': { left: 'p11', down: 'p112', link: 'https://github.com/godjdko/portfolio26' },
	'p112': { left: 'p11', up: 'p111', link: 'https://github.com/godjdko/portfolio26' }
};

function navigateLeft() {
	const target = navigationMap[currentUIState]?.left;
	if (target && availableImages.includes(target)) {
		currentUIState = target;
	}
}

function navigateRight() {
	const target = navigationMap[currentUIState]?.right;
	
	// Handle special video transitions
	if (target === 'VIDEO_3') {
		showingUI = false;
		if (!video3) {
			video3 = setupVideo('img/video3.mp4', () => { video3Loaded = true; });
			lastVideo3Use = millis();
		}
		if (!video5) {
			video5 = setupVideo('img/video5.mp4', () => { video5Loaded = true; });
			lastVideo5Use = millis();
		}
		if (video3Loaded && video3) {
			video3.time(0);
			video3.play();
			playingVideo3 = true;
			lastVideo3Use = millis();
			cachedDims = null;
		}
		return;
	}
	
	if (target === 'VIDEO_2') {
		showingUI = false;
		if (!video2) {
			video2 = setupVideo('img/video2.mp4', () => { video2Loaded = true; });
			lastVideo2Use = millis();
		}
		if (!reverseVideo2) {
			reverseVideo2 = setupVideo('img/reversevideo2.mp4', () => { reverseVideo2Loaded = true; });
			lastReverseVideo2Use = millis();
		}
		if (video2Loaded && video2) {
			video2.time(0);
			video2.play();
			playingVideo2 = true;
			lastVideo2Use = millis();
			cachedDims = null;
		}
		return;
	}
	
	if (target && availableImages.includes(target)) {
		currentUIState = target;
	}
}

function navigateDown() {
	const target = navigationMap[currentUIState]?.down;
	if (target && availableImages.includes(target)) {
		currentUIState = target;
	}
}

function navigateUp() {
	const target = navigationMap[currentUIState]?.up;
	if (target && availableImages.includes(target)) {
		currentUIState = target;
	}
}

// Helper: Handle back button click
function handleBackButtonClick(x, y) {
	// Check external link button in UI mode
	if (showingUI) {
		const currentLink = navigationMap[currentUIState]?.link;
		if (currentLink && extUI0Img && extUIImg) {
			let smallestSide = min(width, height);
			let btnSize = smallestSide / 5;
			let btnX = 30; // Bottom left
			let btnY = height - btnSize - 90;
			
			if (x >= btnX && x <= btnX + btnSize && y >= btnY && y <= btnY + btnSize) {
				playSound(ticlicSound, 0.4);
				window.open(currentLink, '_blank');
				return true;
			}
		}
	}
	
	// Check video2 back button (iPad timing fix)
	if (playingVideo2 && video2.time() >= video2.duration() - 0.1) {
		let smallestSide = min(width, height);
		let btnSize = smallestSide / 5;
		let btnX = width - btnSize - 30;
		let btnY = height - btnSize - 90;
		
		if (x >= btnX && x <= btnX + btnSize && y >= btnY && y <= btnY + btnSize) {
			playSound(ticlicSound, 0.4);
			document.body.style.cursor = 'default';
			if (reverseVideo2Loaded && reverseVideo2) {
				reverseVideo2.time(0);
				reverseVideo2.play();
				playingReverseVideo2 = true;
				cachedDims = null; // Clear cache for reverseVideo2 dimensions
			}
			return true;
		}
	}
	
	// Check video4 back button (frame-based)
	if (playingVideo4) {
		let smallestSide = min(width, height);
		let btnSize = smallestSide / 5;
		let btnX = width - btnSize - 30;
		let btnY = height - btnSize - 90;
		
		if (x >= btnX && x <= btnX + btnSize && y >= btnY && y <= btnY + btnSize) {
			playSound(ticlicSound, 0.4);
			document.body.style.cursor = 'default';
			// Free as much memory as possible before loading video5 (iOS stability)
			resetVideo4IOSCache();
			if (video5Loaded && video5) {
				video5.time(0);
				video5.play();
				playingVideo5 = true;
				cachedDims = null; // Clear cache for video5 dimensions
			}
			return true;
		}
	}
	
	return false;
}

// Helper: Handle button press start
function handleButtonPressStart(x, y) {
	if (handleBackButtonClick(x, y)) return;
	
	// Don't allow button press when transition videos are playing
	if (playingReverseVideo || playingReverseVideo2 || playingVideo2 || playingVideo3 || playingVideo5) return;
	
	// Don't allow main button press during video4 (only back button works)
	if (playingVideo4) return;
	
	// Check if big button should be clickable (firstframe mode or frame 35+)
	let currentFrame = Math.floor(video.time() * VIDEO_FRAMERATE);
	let canPressButton = waitingForButtonClick || currentFrame >= 35;
	
	if (canPressButton && isInsideButton(x, y)) {
		playClickSound();
		buttonPressed = true;
	}
	
	// Handle arrow button press (only when not in video2)
	if (!playingVideo2) {
		let bounds = getButtonBounds();
		if (bounds.frame >= 35) {
			let arrowIdx = isInsideArrowButton(x, y);
			if (arrowIdx !== -1) {
				playSound(ticlicSound, 0.4, 1.3);
			}
		}
	}
}

// Helper: Handle button release
function handleButtonRelease(x, y) {
	// Don't allow button release during transition videos
	if (playingReverseVideo || playingReverseVideo2 || playingVideo3 || playingVideo4 || playingVideo5) {
		buttonPressed = false;
		return;
	}
	
	if (!buttonPressed) {
		return;
	}
	
	// Play clac sound when button is released
	playSound(clacSound);
	clacSound.setVolume(1.3);
	
	// Check if release is inside button area
	if (!isInsideButton(x, y)) {
		buttonPressed = false;
		return;
	}
	
	// Starting from first frame state
	if (waitingForButtonClick) {
		playSound(jingleSound);
		stopSound(antijingleSound);
		reverseVideo.pause();
		video.play();
		isPlaying = true;
		waitingForButtonClick = false;
		buttonPressed = false;
		return;
	}
	
	// Exiting UI mode
	if (showingUI) {
		showingUI = false;
		playSound(antijingleSound);
		stopSound(jingleSound);
		video.pause();
		isPlaying = false;
		if (reverseVideoLoaded && reverseVideo) {
			reverseVideo.time(0);
			reverseVideo.play();
			playingReverseVideo = true;
		}
		buttonPressed = false;
		return;
	}
	
	// During video playback
	let bounds = getButtonBounds();
	if (bounds.frame < 35 && !buttonClicked) {
		if (!isPlaying && !playingReverseVideo) {
			playSound(jingleSound);
			stopSound(antijingleSound);
			reverseVideo.pause();
			video.stop();
			video.play();
			isPlaying = true;
			buttonClicked = true;
		}
	} else {
		playSound(antijingleSound);
		stopSound(jingleSound);
		video.pause();
		isPlaying = false;
		if (reverseVideoLoaded && reverseVideo) {
			reverseVideo.time(0);
			reverseVideo.play();
			playingReverseVideo = true;
		}
	}
	
	buttonPressed = false;
}

// Helper: Handle arrow button navigation
function handleArrowNavigation(x, y) {
	// Don't allow arrow navigation during transition videos or video2
	if (playingReverseVideo || playingReverseVideo2 || playingVideo2 || playingVideo3 || playingVideo4 || playingVideo5) return;
	
	let bounds = getButtonBounds();
	if (bounds.frame < 30) return;
	
	let arrowIdx = isInsideArrowButton(x, y);
	if (arrowIdx !== -1) {
		// Always play release sound
		playSound(ticlicSound, 0.4, 0.8);
		
		// Only navigate if we're in UI mode (video has ended)
		if (showingUI) {
			const navFunctions = [navigateDown, navigateLeft, navigateUp, navigateRight];
			navFunctions[arrowIdx]();
		}
	}
}

function mousePressed() {
	// Request fullscreen on mobile on first interaction
	if (!fullscreenRequested && /iPad|iPhone|iPod|Android/i.test(navigator.userAgent)) {
		requestFullscreen();
	}
	
	if (playingVideo4) {
		video4IsUserInteracting = true;
		video4LastScrollTime = millis();
	}
	handleButtonPressStart(mouseX, mouseY);
}

function mouseReleased() {
	if (playingVideo4) {
		video4IsUserInteracting = false;
		video4LastScrollTime = millis();
	}
	handleButtonRelease(mouseX, mouseY);
	handleArrowNavigation(mouseX, mouseY);
}

function mouseWheel(event) {
	// Handle video4 scrolling with throttling
	if (playingVideo4 && video4Loaded) {
		let currentTime = millis();
		if (currentTime - video4LastWheelTime < video4WheelThrottle) {
			return false; // Throttle updates
		}
		video4LastWheelTime = currentTime;
		
		// Update frame position
		video4CurrentFrame += event.delta * video4ScrollSpeed;
		video4CurrentFrame = constrain(video4CurrentFrame, 0, video4FrameCount - 1);
		video4LastScrollTime = currentTime; // Track scroll time to pause auto-play
		return false; // Prevent page scroll
	}
}

function touchStarted() {
	if (!touches || touches.length === 0) return false;
	lastTouchX = touches[0].x;
	lastTouchY = touches[0].y;
	lastTouchYForScroll = touches[0].y;
	if (playingVideo4) {
		video4IsUserInteracting = true;
		video4LastScrollTime = millis();
	}
	handleButtonPressStart(lastTouchX, lastTouchY);
	return false;
}

function touchMoved() {
	// Handle video4 scrolling on mobile with throttling and speed limiting
	if (playingVideo4 && video4Loaded && touches && touches.length > 0) {
		let currentTime = millis();
		if (currentTime - video4LastTouchMoveTime < video4TouchMoveThrottle) {
			return false; // Throttle updates more aggressively on mobile
		}
		video4LastTouchMoveTime = currentTime;
		
		let deltaY = lastTouchYForScroll - touches[0].y;
		
		// Limit scroll speed on iOS to prevent crashes
		let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
		let scrollMultiplier = isIOS ? 0.1 : 0.2; // Slower on iOS
		let maxDelta = isIOS ? 10 : 20; // Cap maximum frame jump on iOS
		
		// Clamp delta to prevent huge jumps
		let clampedDelta = constrain(deltaY * scrollMultiplier, -maxDelta, maxDelta);
		
		// Update frame position
		video4CurrentFrame += clampedDelta;
		video4CurrentFrame = constrain(video4CurrentFrame, 0, video4FrameCount - 1);
		lastTouchYForScroll = touches[0].y;
		video4LastScrollTime = currentTime; // Track scroll time to pause auto-play
		return false; // Prevent page scroll
	}
}

function touchEnded() {
	if (playingVideo4) {
		video4IsUserInteracting = false;
		video4LastScrollTime = millis();
	}
	handleButtonRelease(lastTouchX, lastTouchY);
	handleArrowNavigation(lastTouchX, lastTouchY);
	return false;
}

function keyPressed() {
	// Handle spacebar and enter for big button (only in firstframe mode or from frame 35+)
	if ((keyCode === 32 || keyCode === ENTER) && !playingReverseVideo && !playingReverseVideo2 && !playingVideo2 && !playingVideo3 && !playingVideo4 && !playingVideo5) {
		let currentFrame = Math.floor(video.time() * VIDEO_FRAMERATE);
		let canPress = waitingForButtonClick || currentFrame >= 35;
		
		if (canPress) {
			if (keyCode === 32 && !spaceKeyPressed) {
				spaceKeyPressed = true;
				playClickSound();
				buttonPressed = true;
				return false;
			} else if (keyCode === ENTER && !enterKeyPressed) {
				enterKeyPressed = true;
				playClickSound();
				buttonPressed = true;
				return false;
			}
		}
	}
	
	// Handle video4 frame scrubbing with up/down arrows
	if (playingVideo4 && video4Loaded) {
		if (keyCode === UP_ARROW) {
			if (!video4UpKeyHeld) {
				// Initial press - move immediately
				video4CurrentFrame -= 3;
				video4CurrentFrame = constrain(video4CurrentFrame, 0, video4FrameCount - 1);
				video4UpKeyHeld = true;
				video4LastKeyScrubTime = millis();
				video4LastScrollTime = millis();
			}
			return false;
		} else if (keyCode === DOWN_ARROW) {
			if (!video4DownKeyHeld) {
				// Initial press - move immediately
				video4CurrentFrame += 3;
				video4CurrentFrame = constrain(video4CurrentFrame, 0, video4FrameCount - 1);
				video4DownKeyHeld = true;
				video4LastKeyScrubTime = millis();
				video4LastScrollTime = millis();
			}
			return false;
		}
	}
	
	// Handle left arrow for back button when video2 or video4 is active
	if (keyCode === LEFT_ARROW) {
		// Check if back button is available in video2 (frozen, and not playing reverseVideo2)
		if (playingVideo2 && video2.time() >= video2.duration() && !playingReverseVideo2) {
			playSound(clickSound, 0.2, random(0.95, 1.05));
			return false;
		}
		// Check if back button is available in video4 (and not playing video5)
		if (playingVideo4 && !playingVideo5) {
			playSound(clickSound, 0.2, random(0.95, 1.05));
			return false;
		}
	}
	
	// Handle arrow keys in UI mode or when frame >= 35
	let currentFrame = Math.floor(video.time() * VIDEO_FRAMERATE);
	let arrowsAvailable = showingUI || (!playingReverseVideo && !playingReverseVideo2 && !playingVideo2 && !playingVideo3 && !playingVideo4 && !playingVideo5 && currentFrame >= 35);
	
	if (arrowsAvailable && [37, 38, 39, 40].includes(keyCode)) {
		// Play ticlic sound at higher rate on key press
		playSound(ticlicSound, 0.4, 1.3);
		
		// Mark which arrow is pressed for visual feedback
		if (keyCode === DOWN_ARROW) keyboardArrowPressed = 0;
		else if (keyCode === LEFT_ARROW) keyboardArrowPressed = 1;
		else if (keyCode === UP_ARROW) keyboardArrowPressed = 2;
		else if (keyCode === RIGHT_ARROW) keyboardArrowPressed = 3;
		
		return false; // Prevent default scrolling
	}
}

function keyReleased() {
	// Handle spacebar and enter release for big button
	if ((keyCode === 32 || keyCode === ENTER) && !playingReverseVideo && !playingReverseVideo2 && !playingVideo3 && !playingVideo4 && !playingVideo5) {
		if (keyCode === 32 && spaceKeyPressed) {
			spaceKeyPressed = false;
			
			if (!buttonPressed) return false;
			
			// Play clac sound
			playSound(clacSound);
			clacSound.setVolume(1.3);
			
			// Starting from first frame state
			if (waitingForButtonClick) {
				playSound(jingleSound);
				stopSound(antijingleSound);
				reverseVideo.pause();
				video.play();
				isPlaying = true;
				waitingForButtonClick = false;
				buttonPressed = false;
				return false;
			}
			
			// Exiting UI mode
			if (showingUI) {
				showingUI = false;
				playSound(antijingleSound);
				stopSound(jingleSound);
				video.pause();
				isPlaying = false;
				if (reverseVideoLoaded && reverseVideo) {
					reverseVideo.time(0);
					reverseVideo.play();
					playingReverseVideo = true;
				}
				buttonPressed = false;
				return false;
			}
			
			// During video playback
			let bounds = getButtonBounds();
			if (bounds.frame < 30 && !buttonClicked) {
				if (!isPlaying && !playingReverseVideo) {
					playSound(jingleSound);
					stopSound(antijingleSound);
					reverseVideo.pause();
					video.stop();
					video.play();
					isPlaying = true;
					buttonClicked = true;
				}
			} else {
				playSound(antijingleSound);
				stopSound(jingleSound);
				video.pause();
				isPlaying = false;
				if (reverseVideoLoaded && reverseVideo) {
					reverseVideo.time(0);
					reverseVideo.play();
					playingReverseVideo = true;
				}
			}
			
			buttonPressed = false;
			return false;
		} else if (keyCode === ENTER && enterKeyPressed) {
			enterKeyPressed = false;
			
			if (!buttonPressed) return false;
			
			// Play clac sound
			playSound(clacSound);
			clacSound.setVolume(1.3);
			
			// Starting from first frame state
			if (waitingForButtonClick) {
				playSound(jingleSound);
				stopSound(antijingleSound);
				reverseVideo.pause();
				video.play();
				isPlaying = true;
				waitingForButtonClick = false;
				buttonPressed = false;
				return false;
			}
			
			// Exiting UI mode
			if (showingUI) {
				showingUI = false;
				playSound(antijingleSound);
				stopSound(jingleSound);
				video.pause();
				isPlaying = false;
				if (reverseVideoLoaded && reverseVideo) {
					reverseVideo.time(0);
					reverseVideo.play();
					playingReverseVideo = true;
				}
				buttonPressed = false;
				return false;
			}
			
			// During video playback
			let bounds = getButtonBounds();
			if (bounds.frame < 35 && !buttonClicked) {
				if (!isPlaying && !playingReverseVideo) {
					playSound(jingleSound);
					stopSound(antijingleSound);
					reverseVideo.pause();
					video.stop();
					video.play();
					isPlaying = true;
					buttonClicked = true;
				}
			} else {
				playSound(antijingleSound);
				stopSound(jingleSound);
				video.pause();
				isPlaying = false;
				if (reverseVideoLoaded && reverseVideo) {
					reverseVideo.time(0);
					reverseVideo.play();
					playingReverseVideo = true;
				}
			}
			
			buttonPressed = false;
			return false;
		}
	}
	
	// Clear video4 arrow key held states
	if (playingVideo4 && video4Loaded) {
		if (keyCode === UP_ARROW) {
			video4UpKeyHeld = false;
			return false;
		} else if (keyCode === DOWN_ARROW) {
			video4DownKeyHeld = false;
			return false;
		}
	}
	
	// Handle left arrow for back button release
	if (keyCode === LEFT_ARROW) {
		// Check if back button is available in video2 (frozen, and not playing reverseVideo2)
		if (playingVideo2 && video2.time() >= video2.duration() && !playingReverseVideo2) {
			playSound(ticlicSound, 0.4);
			if (reverseVideo2Loaded && reverseVideo2) {
				reverseVideo2.time(0);
				reverseVideo2.play();
				playingReverseVideo2 = true;
			}
			return false;
		}
		// Check if back button is available in video4 (and not playing video5)
		if (playingVideo4 && !playingVideo5) {
			playSound(ticlicSound, 0.4);
			resetVideo4IOSCache();
			if (video5Loaded && video5) {
				video5.time(0);
				video5.play();
				playingVideo5 = true;
			}
			return false;
		}
	}
	
	// Clear keyboard arrow press state
	let wasPressed = keyboardArrowPressed;
	keyboardArrowPressed = -1;
	
	// Handle arrow key release when available (UI mode or frame >= 35)
	let currentFrame = Math.floor(video.time() * VIDEO_FRAMERATE);
	let arrowsAvailable = showingUI || (!playingReverseVideo && !playingReverseVideo2 && !playingVideo2 && !playingVideo3 && !playingVideo4 && !playingVideo5 && currentFrame >= 35);
	
	if (arrowsAvailable && wasPressed !== -1 && [37, 38, 39, 40].includes(keyCode)) {
		// Play ticlic sound at lower rate on key release
		playSound(ticlicSound, 0.4, 0.8);
		
		// Execute navigation only in UI mode
		if (showingUI) {
			if (keyCode === LEFT_ARROW) navigateLeft();
			else if (keyCode === RIGHT_ARROW) navigateRight();
			else if (keyCode === UP_ARROW) navigateUp();
			else if (keyCode === DOWN_ARROW) navigateDown();
		}
		
		return false;
	}
}

function windowResized() {
	let w = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
	let h = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
	resizeCanvas(w, h);
	
	// Clear dimension cache to force recalculation
	cachedDims = null;
	applyNoSmoothing();
}


