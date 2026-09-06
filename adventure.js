const challenges = [
  
  {
    title: "The First Date!",
    text: "Where did I buy you The Unbearable Lightness of Being?",
    options: ["McNally Jackson", "The Strand", "We stole it"],
    answer: 1,
    success: "Fun Fact: I feel stranded without you!",
  },
  {
    title: "Sooooo Hungry",
    text: "What is the first meal I made for you?",
    options: ["Shawarma", "Lasagna", "Plain lettuce"],
    answer: 1,
    success: "I wish cats could have lasagna...",
  },
  {
    title: "My Favorite Gift",
    text: "What did you get for me as a graduation gift?",
    options: ["Birkenstocks", "Christmas Sweater", "Floggings"],
    answer: 0,
    success: "This made me so happy!",
  },
  {
    title: "Officially Official!",
    text: "On what date did I ask you to be my girlfriend?",
    options: ["January 10", "January 18", "February 4"],
    answer: 1,
    success: "My favorite day!",
  },
  {
    title: "3 Course Meal",
    text: "Which course order matches the 3 course meal we made together?",
    options: ["Burrata -> steak frites -> tres leches", "Tres leches -> burrata -> steak frites", "Steak frites -> tres leches -> burrata"],
    answer: 0,
    success: "I neeeeed to make another menu for you",
  },
  {
    title: "First Concert",
    text: "Whose concert was the first one of many we will go to together?",
    options: ["Sombr", "Sombr", "Alice Phoebe Lou"],
    answer: 2,
    success: "I want to open my door to you every day!",
  },
  {
    title: "Movie Night",
    text: "For how much of Wicked was I distracted by you?",
    options: ["25%", "50%", "100%"],
    answer: 2,
    success: "Last month someone asked me what happens in the movie and I genuinely couldn't remember anything except for you",
  },
  {
    title: "You're So Gouda",
    text: "How much cheese is too much?",
    options: ["One block", "A wheel", "No such thing!"],
    answer: 2,
    success: "Good thing we're really cheesy!",
  },
  {
    title: "Ridiculous Question",
    text: "What kind of bear is best?",
    options: ["Black Bear", "Brown Bear", "There are two primary schools of thought"],
    answer: 0,
    success: "Bears. Beets. Battlestar Galactica.",
  },
  {
    title: "Easy Final Question",
    text: "Who is the most perfect amazing beautiful person in the entire world?",
    options: ["My girlfriend", "Surya Saraf", "cutiesaraf@gmail.com"],
    answer: 0,
    anyAnswer: true,
    success: "Some of these questions are really obvious wow\n\nLooks like Stella has made it to her box...",
  },
];

const scene = document.querySelector("#scene");
const title = document.querySelector("#story-title");
const dialogue = document.querySelector("#dialogue");
const choices = document.querySelector("#choices");
const chapter = document.querySelector("#chapter");
const roomName = document.querySelector("#room-name");
const restartButton = document.querySelector("#restart-button");
const stellaSpritePath = "assets/stella.png";
let currentChallenge = -1;
let stepsHome = 0;
let introIndex = 0;
let pongFrame = null;
let pongCleanup = null;

const introBriefing = [
  { speaker: "STELLA", title: "Mrrp. Mrrrow. Meow!", text: "Meow! Meow! Meow!", kind: "meow", button: "Translate Stella" },
  { speaker: "RAYHAN", title: "Stella has a situation", text: "Hi Mom! I'm on a walk by myself in the neighborhood, but I really want to go home and lay in a cardboard box.", kind: "translation", button: "Listen to Stella" },
  { speaker: "STELLA", title: "Mew. Meow-meow. Mrrrow!", text: "Meow. Meow. Meow?", kind: "meow", button: "Translate Stella" },
  { speaker: "RAYHAN", title: "How the game works", text: "Apparently, Rayhan is going to ask you questions and if you get them right I get closer to home...", kind: "translation", button: "Hear the last rule" },
  { speaker: "STELLA", title: "Prrrr... meow.", text: "MEOW.", kind: "meow", button: "Translate Stella" },
  { speaker: "RAYHAN", title: "One final rule", text: "Answer enough questions right and I can take a nap in my box. I'm sleepy!", kind: "translation", button: "Start Stella's journey" },
];

function renderStella() {
  const stella = document.createElement("div");
  stella.className = "stella journey-stella";
  stella.innerHTML = `<img class="stella-image" src="${stellaSpritePath}" alt="Stella the black cat"><i class="ear"></i><i class="ear"></i><i class="face"></i>`;
  const image = stella.querySelector(".stella-image");
  image.addEventListener("error", () => {
    stella.classList.add("css-fallback");
    image.remove();
  });
  scene.append(stella);
  return stella;
}

function positionStella(stella, step) {
  stella.style.left = `${8 + step * 7.1}%`;
}

function renderJourney(inBox = false) {
  const road = document.createElement("div");
  road.className = "journey-road";
  const box = document.createElement("div");
  box.className = `stella-box${inBox ? " occupied" : ""}`;
  box.innerHTML = "<i class=\"box-front\" aria-hidden=\"true\"></i>";
  scene.append(road, box);
}

function setProgress() {
  chapter.textContent = stepsHome === challenges.length ? "HOME" : "HOMEWARD";
}

function addChoices(choiceList) {
  choices.replaceChildren();
  choiceList.forEach(([label, handler]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-card";
    button.innerHTML = `<span>${label}</span><b aria-hidden="true">-></b>`;
    button.addEventListener("click", handler);
    choices.append(button);
  });
}

function renderChallenge(index) {
  currentChallenge = index;
  const challenge = challenges[index];
  scene.className = "scene journey-scene";
  scene.replaceChildren();
  renderJourney();
  const stella = renderStella();
  positionStella(stella, index);
  const marker = document.createElement("div");
  marker.className = "memory-mark";
  marker.textContent = `STEP ${index + 1} OF ${challenges.length}`;
  scene.append(marker);
  title.textContent = challenge.title;
  dialogue.textContent = challenge.text;
  setProgress();
  roomName.textContent = "Follow the path home";
  addChoices(challenge.options.map((option, optionIndex) => [option, () => answerQuestion(optionIndex)]));
}

function answerQuestion(selectedIndex) {
  const challenge = challenges[currentChallenge];
  if (!challenge.anyAnswer && selectedIndex !== challenge.answer) {
    title.textContent = "Try That Memory Again";
    dialogue.textContent = "Oops! Try again!";
    return;
  }
  stepsHome += 1;
  const stella = scene.querySelector(".journey-stella");
  scene.querySelector(".journey-road")?.remove();
  scene.querySelector(".stella-box")?.remove();
  renderJourney();
  positionStella(stella, stepsHome);
  stella.classList.add("step-forward");
  title.textContent = "One Step Closer";
  dialogue.textContent = `${challenge.success}`;
  setProgress();
  addChoices([[currentChallenge === challenges.length - 1 ? "Try to reach the box" : "Ask Stella the next question", () => currentChallenge === challenges.length - 1 ? renderBossIntro() : renderChallenge(currentChallenge + 1)]]);
}

function createMatchupCat(source, alt, className) {
  const canvas = document.createElement("canvas");
  canvas.className = `boss-photo ${className}`;
  canvas.width = 180;
  canvas.height = 180;
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", alt);
  const context = canvas.getContext("2d");
  const image = new Image();
  image.onload = () => {
    const buffer = document.createElement("canvas");
    buffer.width = image.naturalWidth;
    buffer.height = image.naturalHeight;
    const bufferContext = buffer.getContext("2d");
    bufferContext.drawImage(image, 0, 0);
    const pixels = bufferContext.getImageData(0, 0, buffer.width, buffer.height).data;
    let minX = buffer.width; let minY = buffer.height; let maxX = -1; let maxY = -1;
    for (let y = 0; y < buffer.height; y += 1) {
      for (let x = 0; x < buffer.width; x += 1) {
        if (pixels[(y * buffer.width + x) * 4 + 3] > 12) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
      }
    }
    if (maxX < 0) return;
    const cropWidth = maxX - minX + 1;
    const cropHeight = maxY - minY + 1;
    const targetHeight = 158;
    const scale = targetHeight / cropHeight;
    const targetWidth = cropWidth * scale;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.drawImage(image, minX, minY, cropWidth, cropHeight, (canvas.width - targetWidth) / 2, 12, targetWidth, targetHeight);
  };
  image.src = source;
  return canvas;
}

function renderBossIntro() {
  scene.className = "scene boss-scene";
  scene.replaceChildren();
  const arena = document.createElement("div");
  arena.className = "boss-arena-preview";
  arena.append(createMatchupCat("assets/stella.png", "Stella", "stella-boss"));
  const versus = document.createElement("span");
  versus.className = "versus";
  versus.textContent = "VS";
  arena.append(versus, createMatchupCat("assets/bowie.png", "Bowie", "bowie-boss"));
  scene.append(arena);
  title.textContent = "The Box Is Not Empty!!";
  dialogue.textContent = "Bowie is guarding Stella's box. Beat him at Car Pong or no nap for Stella!.";
  setProgress();
  roomName.textContent = "FINAL BOSS: BOWIE";
  addChoices([["Start the match", startPong]]);
}

function renderFinale() {
  if (pongCleanup) pongCleanup();
  scene.className = "scene journey-scene finale-scene";
  scene.replaceChildren();
  renderJourney(true);
  const stella = renderStella();
  stella.classList.add("in-box");
  const boxFront = document.createElement("div");
  boxFront.className = "box-front-overlay";
  boxFront.setAttribute("aria-hidden", "true");
  scene.append(boxFront);
  title.textContent = "Stella Is Home";
  dialogue.textContent = "Because of you, Stella has found her way to da box. Best mom ever!";
  setProgress();
  roomName.textContent = "Stella's comfy box";
  choices.replaceChildren();
  restartButton.hidden = false;
}

function startPong() {
  if (pongCleanup) pongCleanup();
  scene.className = "scene boss-scene";
  scene.replaceChildren();
  const canvas = document.createElement("canvas");
  canvas.className = "pong-canvas";
  canvas.width = 720;
  canvas.height = 360;
  canvas.setAttribute("aria-label", "Cat Pong arena. Move Stella's paddle with the mouse, touch, or arrow keys.");
  scene.append(canvas);
  title.textContent = "Stella vs. Bowie";
  dialogue.textContent = "Move Stella's paddle with your mouse, touch, or the up and down arrow keys. First cat to five points wins.";
  roomName.textContent = "CAT PONG";
  choices.replaceChildren();
  const context = canvas.getContext("2d");
  const game = { playerY: 140, bowieY: 140, ballX: 360, ballY: 180, velocityX: 4, velocityY: 2.5, playerScore: 0, bowieScore: 0, running: true };
  const paddleHeight = 68;
  const paddleWidth = 46;
  const playerPaddleX = 24;
  const bowiePaddleX = canvas.width - 24 - paddleWidth;
  const ballRadius = 8;
  const stellaImage = new Image();
  const bowieImage = new Image();
  const spriteCrops = new Map();
  stellaImage.src = stellaSpritePath;
  bowieImage.src = "assets/bowie.png";
  function movePlayer(clientY) { const bounds = canvas.getBoundingClientRect(); game.playerY = Math.max(0, Math.min(canvas.height - paddleHeight, ((clientY - bounds.top) / bounds.height) * canvas.height - paddleHeight / 2)); }
  function keyHandler(event) { if (event.key === "ArrowUp" || event.key === "ArrowDown") event.preventDefault(); if (event.key === "ArrowUp") game.playerY -= 22; if (event.key === "ArrowDown") game.playerY += 22; game.playerY = Math.max(0, Math.min(canvas.height - paddleHeight, game.playerY)); }
  function pointerHandler(event) { movePlayer(event.touches ? event.touches[0].clientY : event.clientY); }
  function resetBall(direction) { game.ballX = canvas.width / 2; game.ballY = canvas.height / 2; game.velocityX = direction * 4; game.velocityY = (Math.random() > .5 ? 1 : -1) * 2.5; }
  function getSpriteCrop(image) {
    if (!image.complete || image.naturalWidth === 0) return null;
    if (spriteCrops.has(image.src)) return spriteCrops.get(image.src);
    const buffer = document.createElement("canvas");
    buffer.width = image.naturalWidth; buffer.height = image.naturalHeight;
    const bufferContext = buffer.getContext("2d");
    bufferContext.drawImage(image, 0, 0);
    const pixels = bufferContext.getImageData(0, 0, buffer.width, buffer.height).data;
    let minX = buffer.width; let minY = buffer.height; let maxX = -1; let maxY = -1;
    for (let y = 0; y < buffer.height; y += 1) {
      for (let x = 0; x < buffer.width; x += 1) {
        if (pixels[(y * buffer.width + x) * 4 + 3] > 12) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
      }
    }
    const crop = maxX >= 0 ? { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 } : null;
    spriteCrops.set(image.src, crop);
    return crop;
  }
  function drawCatPaddle(x, y, color, image) {
    if (image.complete && image.naturalWidth > 0) {
      const crop = getSpriteCrop(image);
      if (crop) context.drawImage(image, crop.x, crop.y, crop.width, crop.height, x, y, paddleWidth, paddleHeight);
      return;
    }
    context.fillStyle = color;
    context.fillRect(x, y, paddleWidth, paddleHeight);
  }
  function draw() {
    if (!game.running) return;
    context.fillStyle = "#294637"; context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "#edc95e"; context.setLineDash([8, 12]); context.beginPath(); context.moveTo(canvas.width / 2, 0); context.lineTo(canvas.width / 2, canvas.height); context.stroke(); context.setLineDash([]);
    drawCatPaddle(playerPaddleX, game.playerY, "#c99870", stellaImage); drawCatPaddle(bowiePaddleX, game.bowieY, "#252b36", bowieImage);
    context.fillStyle = "#f3d777"; context.fillRect(game.ballX - 8, game.ballY - 8, 16, 16);
    context.fillStyle = "#fff7e5"; context.font = "26px VT323"; context.fillText(`STELLA  ${game.playerScore}`, 28, 35); context.fillText(`BOWIE  ${game.bowieScore}`, canvas.width - 150, 35);
    game.bowieY += (game.ballY - (game.bowieY + paddleHeight / 2)) * 0.075;
    game.bowieY = Math.max(0, Math.min(canvas.height - paddleHeight, game.bowieY));
    game.ballX += game.velocityX; game.ballY += game.velocityY;
    if (game.ballY <= ballRadius) { game.ballY = ballRadius; game.velocityY = Math.abs(game.velocityY); }
    if (game.ballY >= canvas.height - ballRadius) { game.ballY = canvas.height - ballRadius; game.velocityY = -Math.abs(game.velocityY); }
    if (game.ballX - ballRadius <= playerPaddleX + paddleWidth && game.ballX + ballRadius >= playerPaddleX && game.ballY + ballRadius >= game.playerY && game.ballY - ballRadius <= game.playerY + paddleHeight) { game.ballX = playerPaddleX + paddleWidth + ballRadius; game.velocityX = Math.abs(game.velocityX) * 1.04; game.velocityY += (game.ballY - (game.playerY + paddleHeight / 2)) * 0.06; }
    if (game.ballX + ballRadius >= bowiePaddleX && game.ballX - ballRadius <= bowiePaddleX + paddleWidth && game.ballY + ballRadius >= game.bowieY && game.ballY - ballRadius <= game.bowieY + paddleHeight) { game.ballX = bowiePaddleX - ballRadius; game.velocityX = -Math.abs(game.velocityX) * 1.04; }
    if (game.ballX < -ballRadius) { game.bowieScore += 1; resetBall(1); }
    if (game.ballX > canvas.width + ballRadius) { game.playerScore += 1; resetBall(-1); }
    if (game.playerScore >= 5) { game.running = false; renderWinOverlay(); return; }
    if (game.bowieScore >= 5) { game.running = false; renderLossOverlay(); return; }
    pongFrame = requestAnimationFrame(draw);
  }
  function cleanup() { game.running = false; if (pongFrame) cancelAnimationFrame(pongFrame); window.removeEventListener("keydown", keyHandler); canvas.removeEventListener("mousemove", pointerHandler); canvas.removeEventListener("touchmove", pointerHandler); }
  pongCleanup = cleanup;
  window.addEventListener("keydown", keyHandler); canvas.addEventListener("mousemove", pointerHandler); canvas.addEventListener("touchmove", pointerHandler, { passive: true });
  draw();
}

function renderWinOverlay() { pongCleanup = null; title.textContent = "Stella Wins!!"; dialogue.textContent = "Stella Wins Pong and the box!."; addChoices([["Let Stella nap", renderFinale]]); }
function renderLossOverlay() { title.textContent = "Bowie Wins"; dialogue.textContent = "Bowie is so good at Pong. Stella gets another try."; addChoices([["Rematch Bowie", startPong]]); }

function renderIntro() {
  scene.className = "scene journey-scene";
  scene.replaceChildren();
  renderJourney();
  const stella = renderStella();
  positionStella(stella, 0);
  const marker = document.createElement("div");
  marker.className = "memory-mark";
  marker.textContent = "STELLA HAS SOMETHING TO SAY";
  scene.append(marker);
  const meow = introBriefing[introIndex * 2];
  const translation = introBriefing[introIndex * 2 + 1];
  title.textContent = meow.text;
  dialogue.innerHTML = `<span class="briefing-line translation">${translation.text}</span>`;
  setProgress();
  roomName.textContent = "Stella's briefing";
  addChoices([[introIndex < 2 ? "Continue listening" : "Start Stella's journey", advanceIntro]]);
  restartButton.hidden = true;
}

function advanceIntro() {
  if (introIndex < 2) {
    introIndex += 1;
    renderIntro();
    return;
  }
  introIndex = 0;
  renderChallenge(0);
}

restartButton.addEventListener("click", () => { if (pongCleanup) pongCleanup(); currentChallenge = -1; stepsHome = 0; introIndex = 0; renderIntro(); });
document.querySelector(".wordmark").addEventListener("click", (event) => { event.preventDefault(); if (pongCleanup) pongCleanup(); currentChallenge = -1; stepsHome = 0; introIndex = 0; renderIntro(); });

renderIntro();
