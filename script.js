let video;
let handpose;
let predictions = [];
let balloon = null; // Declare a single balloon object
let score = 0;
let lastBalloonChangeTime = 0;
const balloonVisibleTime = 5000; // Time in milliseconds for which the balloon remains visible
const balloonChangeInterval = 2000; // Interval in milliseconds for changing balloon position
let balloonTouched = false; // Variable to track if balloon is touched

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();
  handpose = ml5.handpose(video, modelLoaded);
  handpose.on("predict", gotPredictions);
}

function modelLoaded() {
  console.log("Model Loaded!");
}

function gotPredictions(results) {
  predictions = results;
}

function spawnBalloon() {
  balloon = {
    x: random(width),
    y: random(height * 0.5, height * 0.8), // Spawn balloons randomly between 50% and 80% of canvas height
    size: random(30, 50),
    popped: false,
    spawnTime: millis(), // Record the spawn time of the balloon
  };
  balloonTouched = false; // Reset the balloonTouched variable
}

function draw() {
  background(220);
  image(video, 0, 0, width, height);

  // Loop through all predictions
  for (let i = 0; i < predictions.length; i++) {
    let hand = predictions[i];

    // Loop through all fingers
    for (let j = 0; j < hand.annotations.indexFinger.length; j++) {
      let fingerTip = hand.annotations.indexFinger[j];
      let x = fingerTip[0];
      let y = fingerTip[1];

      // Draw a circle at finger tip
      fill(0, 255, 0);
      ellipse(x, y, 20, 20);
    }

    // Check if finger tips touch the balloon
    if (balloon && !balloonTouched) {
      for (let j = 0; j < hand.annotations.indexFinger.length; j++) {
        let fingerTip = hand.annotations.indexFinger[j];
        let x = fingerTip[0];
        let y = fingerTip[1];
        let d = dist(x, y, balloon.x, balloon.y);
        if (d < balloon.size / 2) {
          balloonTouched = true;
          if (!balloon.popped) {
            balloon.popped = true;
            score++; // Increase score only if the balloon is not popped yet
          }
        }
      }
    }
  }

  // Display and update the balloon
  if (balloon) {
    if (!balloon.popped) {
      fill(255, 0, 0);
      noStroke();
      ellipse(balloon.x, balloon.y, balloon.size, balloon.size);
    }
  }

  // Remove the balloon after balloonVisibleTime milliseconds
  if (balloon && millis() - balloon.spawnTime > balloonVisibleTime) {
    balloon = null;
    lastBalloonChangeTime = millis(); // Record the time of balloon disappearance
  }

  // Display score
  textSize(24);
  fill(0);
  textAlign(LEFT, TOP);
  text("Score: " + score, 10, 10);

  // Change balloon position after balloonChangeInterval milliseconds
  if (millis() - lastBalloonChangeTime > balloonChangeInterval && !balloon) {
    spawnBalloon();
  }
}
