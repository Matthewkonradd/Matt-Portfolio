var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

// Function to resize the canvas to fit the screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Call the function initially
resizeCanvas();

// Update the canvas size whenever the window is resized
window.addEventListener('resize', resizeCanvas);

var balls;
var support;
var center = new Vector2D(700, 1000);
var g = 10;
var kDamping = 20;
var kSpring = 500;
var springLength = 20;
var spacing = 70;
var numBalls = 15;
var pull = false;
var pfac = 50;
var t0, dt;
var acc, force;
var animId;
var mouseX;
var mouseY;
var isAnimating = false;

// Load images
var img = new Image();
img.src = 'headphone.png';

var targetBottomImg = new Image();
targetBottomImg.src = 'TargetBottom.png';

var targetTopImg = new Image();
targetTopImg.src = 'TargetTop.png';

// Set the scale for the target images
var targetWidth = 100; // Width of the target images
var targetHeight = 200; // Height of the target images

window.onload = init;

function init() {
    // Create a support ball and position it off-screen to the left
    support = new Ball(2, '#000000');
    support.pos2D = new Vector2D(-100, 100); // Position the support ball off-screen
    support.draw(context);

    // Create a bunch of balls extending from the support ball
    balls = new Array();
    for (var i = 0; i < numBalls; i++) {
        var ball = new Ball(2, '#000000', 1, 0, true);
        ball.pos2D = new Vector2D(support.pos2D.x + spacing * (i + 1), support.pos2D.y);
        balls.push(ball);
    }

    // Set the last ball's position at the bottom center of the screen
    var lastBall = balls[balls.length - 1];
    lastBall.pos2D = new Vector2D(canvas.width / 2, canvas.height);

    addEventListener('mousedown', onDown, false);
    t0 = new Date().getTime();
    animFrame();
}

function onDown(evt) {
    if (isAnimating) return; // Prevent dragging if animation is in progress
    pull = true;
    mouseX = evt.clientX;
    mouseY = evt.clientY;
    addEventListener('mousemove', onMouseMove, false);
    addEventListener('mouseup', onUp, false);
}

function onMouseMove(evt) {
    mouseX = evt.clientX;
    mouseY = evt.clientY;
}

function onUp(evt) {
    pull = false;
    removeEventListener('mousemove', onMouseMove, false);
    removeEventListener('mouseup', onUp, false);
}

function animFrame() {
    animId = requestAnimationFrame(animFrame);
    onTimer();
}

function onTimer() {
    var t1 = new Date().getTime();
    dt = 0.001 * (t1 - t0);
    t0 = t1;
    if (dt > 0.2) { dt = 0; }
    move();
}

function move() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawTargetBottom();  // Draw target bottom first
    drawSpring();
    for (var i = 0; i < numBalls; i++) {
        var ball = balls[i];
        moveObject(ball);
        calcForce(ball, i);
        updateAccel(ball.mass);
        updateVelo(ball);
    }
    drawImageAtLastBall();  // Draw the headphone next
    drawTargetTop();  // Draw target top last
    checkCollision();
}
 function createMusicalNotes() {
    for (let i = 0; i < 150; i++) {
        // Create a musical note element
        let note = document.createElement('div');
        note.textContent = ['♪', '♫', '♬'][Math.floor(Math.random() * 3)];
        note.style.position = 'absolute';
        note.style.color = ['#ff69b4', '#ff4500', '#1e90ff', '#32cd32', '#ffff00'][Math.floor(Math.random() * 5)];
        note.style.fontSize = `${Math.floor(Math.random() * 30) + 10}px`;
        note.style.left = `${window.innerWidth / 2}px`; // Start at center of screen
        note.style.top = `${window.innerHeight / 2}px`; // Start at center of screen
        note.style.zIndex = '20';
        document.body.appendChild(note);

        // Animate the note
        let angle = Math.random() * 2 * Math.PI; // Random direction
        let distance = Math.random() * 400 + 100; // Random distance
        let x = Math.cos(angle) * distance;
        let y = Math.sin(angle) * distance;

        note.animate([
            { transform: `translate(0, 0)`, opacity: 1 },
            { transform: `translate(${x}px, ${y}px)`, opacity: 0 }
        ], {
            duration: 2000,
            easing: 'ease-out',
            fill: 'forwards'
        });

        // Remove the element after animation is complete
        setTimeout(() => {
            note.remove();
        }, 2000);
    }
}
function drawSpring() {
    support.draw(context);
    context.beginPath();
    context.strokeStyle = '#000000'; // Set the line color to black
    context.lineWidth = 8;
    context.moveTo(center.x, center.y);
    for (var i = 0; i < numBalls; i++) {
        var X = balls[i].x;
        var Y = balls[i].y;
        context.lineTo(X, Y);
    }
    context.stroke();
}

// Function to draw the target bottom image
function drawTargetBottom() {
    context.drawImage(targetBottomImg, (canvas.width - targetWidth) / 2, 200, targetWidth, targetHeight);
}

// Function to draw the target top image
function drawTargetTop() {
    context.drawImage(targetTopImg, (canvas.width - targetWidth) / 2, 200, targetWidth, targetHeight);
}

// Function to draw the headphone image at the position of the last ball
function drawImageAtLastBall() {
    var lastBall = balls[balls.length - 1];
    context.drawImage(img, lastBall.x - img.width / 2, lastBall.y - img.height);
}

// Function to check for collision between the headphone and the target
var statusText = document.getElementById('status-text');

// Load confetti library (if you're using a library like canvas-confetti)
function createConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0.5, y: 0.5 }
    });
}

// Function to check for collision between the headphone and the target
// Load audio files
var backgroundMusic = new Audio('backgroundMusic.Wav');
var collisionSfx = new Audio('collisionSfx.wav');
backgroundMusic.loop = true; // Loop the music

// Function to start the music
function playMusic() {
    backgroundMusic.play().then(() => {
        console.log("Background music started successfully.");
    }).catch((error) => {
        console.error("Music playback failed: ", error);
    });
    // Remove the event listener after the first interaction
    window.removeEventListener('mousedown', playMusic);
    window.removeEventListener('touchstart', playMusic);
}

// Add event listeners for user interaction
window.addEventListener('mousedown', playMusic);
window.addEventListener('touchstart', playMusic);

window.onload = function() {
    init();
};

function checkCollision() {
    var lastBall = balls[balls.length - 1];
    var headphoneTopY = lastBall.y - img.height;

    var targetX = (canvas.width - targetWidth) / 2;
    var targetBottomY = 200 + targetHeight;

    if (!isAnimating &&
        headphoneTopY <= targetBottomY &&
        lastBall.x + img.width / 2 > targetX &&
        lastBall.x - img.width / 2 < targetX + targetWidth) {

        var headphoneCenterX = targetX + targetWidth / 2;
        var headphoneNewY = targetBottomY;

        lastBall.pos2D = new Vector2D(headphoneCenterX, headphoneNewY);

        // Change the headphone image to headphone2.png
        img.src = 'headphone2.png';

        animateHeadphoneIntoTarget(lastBall, targetX, targetBottomY);

        statusText.textContent = "Connected!!!";
        statusText.style.color = "#ff0000"; // Change to red on connection
        statusText.style.animation = "none"; // Stop flicker animation

        // Create the loading text element
        var loadingText = document.createElement("div");
        loadingText.className = "loading-text";
        loadingText.textContent = "Loading Matt's Portfolio";
        loadingText.style.fontSize = "3.5em";
        loadingText.style.color = "white";
        loadingText.style.textAlign = "center";
        loadingText.style.position = "absolute";
        loadingText.style.top = "200px"; // Position it right below the status text
        loadingText.style.left = "50%";
        loadingText.style.transform = "translateX(-50%)";
        loadingText.style.zIndex = "10";
        document.body.appendChild(loadingText);

        // Stop the background music and play the collision sound effect
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0; // Reset the music
        collisionSfx.play();

        createMusicalNotes();
        animateLoadingDots(loadingText);
    }
}

// Function to animate the dots for the loading text
function animateLoadingDots(element) {
    let dots = 0;
    setInterval(() => {
        dots = (dots + 1) % 4; // Cycle through 0, 1, 2, 3
        element.textContent = "Loading Matt's Portfolio" + ".".repeat(dots);
    }, 500); // Update every 500ms (half a second)
}

// Function to animate the headphone moving into the target
function animateHeadphoneIntoTarget(lastBall, targetX, targetY) {
    isAnimating = true;

    var startX = lastBall.x;
    var startY = lastBall.y;
    var duration = 1000; // Duration of the animation in milliseconds
    var startTime = null;

    function animate(time) {
        if (!startTime) startTime = time;
        var progress = (time - startTime) / duration;
        if (progress > 1) progress = 1;

        // Calculate the current position of the headphone
        var currentX = startX + (targetX + targetWidth / 2 - startX) * progress;
        var currentY = startY + (targetY - startY) * progress;

        // Update the position of the last ball
        lastBall.pos2D = new Vector2D(currentX, currentY);

        context.clearRect(0, 0, canvas.width, canvas.height);
        drawTargetBottom();
        drawSpring();
        drawImageAtLastBall();
        drawTargetTop();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            setTimeout(() => {
                window.location.href = 'your-portfolio-page.html';
            }, 4000);
        }
    }

    requestAnimationFrame(animate);
}

function moveObject(obj) {
    obj.pos2D = obj.pos2D.addScaled(obj.velo2D, dt);
    obj.draw(context);
}

function calcForce(obj, num) {
    var centerPrev;
    var centerNext;
    var veloPrev;
    var veloNext;
    if (num > 0) {
        centerPrev = balls[num - 1].pos2D;
        veloPrev = balls[num - 1].velo2D;
    } else {
        centerPrev = center;
        veloPrev = new Vector2D(0, 0);
    }
    if (num < balls.length - 1) {
        centerNext = balls[num + 1].pos2D;
        veloNext = balls[num + 1].velo2D;
    } else {
        centerNext = obj.pos2D;
        veloNext = obj.velo2D;
    }
    var gravity = Forces.constantGravity(obj.mass, g);
    var velo = obj.velo2D.multiply(2).subtract(veloPrev).subtract(veloNext);
    var damping = Forces.damping(kDamping, velo);
    var displPrev = obj.pos2D.subtract(centerPrev);
    var displNext = obj.pos2D.subtract(centerNext);
    var extensionPrev = displPrev.subtract(displPrev.unit().multiply(springLength));
    var extensionNext = displNext.subtract(displNext.unit().multiply(springLength));
    var restoringPrev = Forces.spring(kSpring, extensionPrev);
    var restoringNext = Forces.spring(kSpring, extensionNext);
    force = Forces.add([gravity, damping, restoringPrev, restoringNext]);

    if (num == balls.length - 1) { // last particle
        if (pull == true) {
            var fx = mouseX - obj.x;
            var fy = mouseY - obj.y;
            var pullForce = new Vector2D(pfac * fx, pfac * fy);
            force = Forces.add([damping, restoringPrev, restoringNext, pullForce]);
        } else {
            force = new Vector2D(0, 0);
            obj.velo2D = new Vector2D(0, 0);
        }
    }
}

function updateAccel(mass) {
    acc = force.multiply(1 / mass);
}

function updateVelo(obj) {
    obj.velo2D = obj.velo2D.addScaled(acc, dt);
}
