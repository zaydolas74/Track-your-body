let videoStream;
let handenModel;
let voorspellingen = [];
let ballon = null;
let ballonAfbeelding;
let score = 0;
let laatsteBallonVeranderingTijd = 0;
const zichtbareTijdBallon = 5000;
const intervalVeranderingBallon = 2000;
let ballonAangeraakt = false;

function preload() {
  ballonAfbeelding = loadImage("balloon.png");
}

function setup() {
  createCanvas(640, 480);
  videoStream = createCapture(VIDEO);
  videoStream.hide();
  handenModel = ml5.handpose(videoStream, modelGeladen);
  handenModel.on("predict", voorspellingOntvangen);
}

function modelGeladen() {
  console.log("Model Geladen!");
}

function voorspellingOntvangen(resultaten) {
  voorspellingen = resultaten;
}

function nieuweBallon() {
  ballon = {
    x: random(width),
    y: random(height * 0.5, height * 0.8),
    grootte: random(80, 100),
    gepopt: false,
    spawnTijd: millis(),
  };
  ballonAangeraakt = false;
}

function draw() {
  image(videoStream, 0, 0, width, height);

  for (let i = 0; i < voorspellingen.length; i++) {
    let hand = voorspellingen[i];
    for (let j = 0; j < hand.annotations.indexFinger.length; j++) {
      let vingertop = hand.annotations.indexFinger[j];
      let x = vingertop[0];
      let y = vingertop[1];
      fill(0, 255, 0);
      ellipse(x, y, 20, 20);
    }
    if (ballon && !ballonAangeraakt) {
      for (let j = 0; j < hand.annotations.indexFinger.length; j++) {
        let vingertop = hand.annotations.indexFinger[j];
        let x = vingertop[0];
        let y = vingertop[1];
        let d = dist(x, y, ballon.x, ballon.y);
        if (d < ballon.grootte / 2) {
          ballonAangeraakt = true;
          if (!ballon.gepopt) {
            ballon.gepopt = true;
            score++;
          }
        }
      }
    }
  }

  if (ballon) {
    if (!ballon.gepopt) {
      let aspectRatio = ballonAfbeelding.width / ballonAfbeelding.height;
      let ballonHoogte = ballon.grootte;
      let ballonBreedte = ballonHoogte * aspectRatio;
      image(
        ballonAfbeelding,
        ballon.x - ballonBreedte / 2,
        ballon.y - ballonHoogte / 2,
        ballonBreedte,
        ballonHoogte
      );
    }
  }

  if (ballon && millis() - ballon.spawnTijd > zichtbareTijdBallon) {
    ballon = null;
    laatsteBallonVeranderingTijd = millis();
  }

  textSize(24);
  fill(0);
  textAlign(LEFT, TOP);
  text("Score: " + score, 10, 10);

  if (
    millis() - laatsteBallonVeranderingTijd > intervalVeranderingBallon &&
    !ballon
  ) {
    nieuweBallon();
  }
}
