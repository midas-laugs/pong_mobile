const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game variables
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;
const ballRadius = 10;
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballDX = 4;
let ballDY = -4;
let score = 0;
let lives = 3;

// Gyroscope Variables
let gammaOffset = null;
let isGyroscopeActive = false;
const paddleSpeedMultiplier = 0.5;
let lastGamma = 0;

// Drawing functions
function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Score: " + score, 8, 20);
}

function drawLives() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}

// Collision detection
function collisionDetection() {
  if (ballY + ballDY < ballRadius) {
    ballDY = -ballDY;
  } else if (ballY + ballDY > canvas.height - ballRadius) {
    if (ballX > paddleX && ballX < paddleX + paddleWidth) {
      ballDY = -ballDY;
      score++;
    } else {
      lives--;
      if (!lives) {
        alert("GAME OVER! Score: " + score);
        document.location.reload();
      } else {
        ballX = canvas.width / 2;
        ballY = canvas.height - 30;
        ballDX = 2;
        ballDY = -2;
        paddleX = (canvas.width - paddleWidth) / 2;
      }
    }
  }
  if (ballX + ballDX > canvas.width - ballRadius || ballX + ballDX < ballRadius) {
    ballDX = -ballDX;
  }
}
// function to play the game on desktop-------------------------------------
function checkKeys() {
  // HOME = keyCode 36
  if (keyIsDown(36)) {
    paddleX -= 1;
  }

  // END = keyCode 35
  if (keyIsDown(35)) {
    paddleX += 1;
  }
}
// end of desktopfunction-------------------------------------------------------

// Device orientation handling
function handleOrientation(event) {
  // Get debug element
  const debugInfo = document.getElementById('debug-info');
  
  // Get gamma (left-right tilt)
  let gamma = event.gamma;
  
  // Display raw values for debugging
  if (debugInfo) {
    debugInfo.textContent = `Gamma: ${gamma ? gamma.toFixed(2) : 'null'}°`;
  }
  
  // Skip if no valid reading
  if (gamma === null || gamma === undefined) {
    return;
  }
  
  // Initialize offset on first reading
  if (gammaOffset === null) {
    gammaOffset = gamma;
    if (debugInfo) {
      debugInfo.textContent += ` | Offset: ${gammaOffset.toFixed(2)}°`;
    }
  }
  
  // Apply offset
  gamma -= gammaOffset ?? 0;
  
  // Smooth movement with previous value
  gamma = gamma * 0.7 + lastGamma * 0.3;
  lastGamma = gamma;
  
  // Move paddle based on tilt
  paddleX += gamma * paddleSpeedMultiplier;
  
  // Keep paddle within canvas boundaries
  paddleX = Math.max(0, Math.min(canvas.width - paddleWidth, paddleX));
  
  // Update debug info
  if (debugInfo) {
    debugInfo.textContent += ` | Adjusted: ${gamma.toFixed(2)}° | Paddle: ${paddleX.toFixed(0)}`;
  }
}

// Gyroscope permission
function requestGyroPermission() {
  const debugInfo = document.getElementById('debug-info');
  
  try {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      // iOS 13+ requires permission request
      DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
            isGyroscopeActive = true;
            if (debugInfo) {
              debugInfo.textContent = 'Gyroscope permission granted';
            }
          } else {
            if (debugInfo) {
              debugInfo.textContent = 'Gyroscope permission denied';
            }
            alert("Permission to use device orientation was denied. Please reload and try again.");
          }
        })
        .catch(error => {
          if (debugInfo) {
            debugInfo.textContent = 'Error requesting permission: ' + error;
          }
          console.error("Error requesting device orientation permission:", error);
          alert("Error requesting device orientation permission. Please ensure you're using a supported iOS device and browser.");
        });
    } else {
      // Non-iOS or older iOS doesn't need permission
      window.addEventListener('deviceorientation', handleOrientation);
      isGyroscopeActive = true;
      if (debugInfo) {
        debugInfo.textContent = 'Gyroscope active (no permission needed)';
      }
    }
  } catch (error) {
    if (debugInfo) {
      debugInfo.textContent = 'Error setting up gyroscope: ' + error;
    }
    console.error("Error setting up gyroscope:", error);
    alert("Error setting up gyroscope. Your device may not support this feature.");
  }
}

// Function to reset gyroscope calibration
function resetGyroscopeCalibration() {
  gammaOffset = null;
  const debugInfo = document.getElementById('debug-info');
  if (debugInfo) {
    debugInfo.textContent = 'Gyroscope calibration reset. Hold your device in playing position.';
  }
}

// Main draw loop
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall();
  drawPaddle();
  drawScore();
  drawLives();
  collisionDetection();
  checkKeys();
  ballX += ballDX;
  ballY += ballDY;
  requestAnimationFrame(draw);
}

// Initialize the game
function initGame() {
  // Set up event listeners
  document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    if (startButton) {
      startButton.addEventListener('click', () => {
        requestGyroPermission();
        draw();
        startButton.style.display = 'none'; // hide button
      });
    } else {
      console.error("Start button not found!");
    }
    
    // Add double tap to reset calibration
    document.addEventListener('dblclick', resetGyroscopeCalibration);
  });
}

// Start the game initialization
initGame();
