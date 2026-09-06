const game = {
  room: 0,
  inspected: new Set(),
  inventory: [],
  muted: false,
};

const roomData = [
  {
    name: "Bedroom Nook",
    sceneClass: "bedroom",
    opening: ["SURYA", "Rayhan? You do not get to start a nap without me."],
    hint: "Look at the things that prove Rayhan was here a moment ago: the bed, the empty glasses spot, and his note.",
    complete: ["SURYA", "A bookish trail, huh? Fine. I am coming, mysterious nap criminal."],
    objects: [
      { id: "bed", className: "bed", label: "Rumpled bed", title: "A suspiciously fresh nap", copy: "His side is still warm. He could not have gotten far.", required: true },
      { id: "glasses", className: "glasses", label: "Empty glasses stand", title: "No glasses?", copy: "Rayhan never goes anywhere without those. This is serious.", required: true },
      { id: "note", className: "note", label: "Folded note", title: "A note from Rayhan", copy: "Gone looking for somewhere with too many shelves. Try to keep up, bunny.", required: true },
      { id: "door", className: "door locked", label: "Root tunnel", title: "A closed tunnel", copy: "The roots are tangled shut. Maybe the note and the missing things explain why.", door: true },
    ],
  },
  {
    name: "Bookworm Den",
    sceneClass: "bookshop",
    opening: ["STELLA", "You are looking for the glasses bunny? He drifted through here like a leaf in a library."],
    hint: "The right book is the one Rayhan bought Surya on their first NYC date, at McNally Jackson and The Strand.",
    complete: ["STELLA", "Correct. He left the bookmark. Very theatrical of him, honestly."],
    objects: [
      { id: "stella", className: "stella", label: "Stella", title: "Stella, bookstore specialist", copy: "He examined every shelf twice. The book he chose was a title about lightness, but he was grinning far too heavily.", stella: true },
      { id: "book-one", className: "book-choice", label: "A yellowed mystery", title: "Not quite", copy: "This one is intriguing, but it is not your book.", wrong: true },
      { id: "book-two", className: "book-choice book-two", label: "The Unbearable Lightness of Being", title: "The first-date book", copy: "Inside is a pressed-leaf bookmark: 11.05.25. Rayhan knew exactly what he was doing.", correct: true, required: true },
      { id: "book-three", className: "book-choice book-three", label: "A very large cookbook", title: "Tempting, but no", copy: "This feels like it belongs closer to the kitchen burrow.", wrong: true },
      { id: "door", className: "door locked", label: "Snowy tunnel", title: "A frosted tunnel", copy: "A tiny sketch of snow and city lights is carved into the roots.", door: true },
    ],
  },
  {
    name: "Snowy Lookout",
    sceneClass: "snowy",
    opening: ["SURYA", "Snow in the burrow? Rayhan has been making this suspiciously cinematic."],
    hint: "Put the moments in the order they happened: first date, became a couple, today’s adventure.",
    complete: ["SURYA", "November, January, September. The trail keeps getting sweeter."],
    puzzle: "timeline",
  },
  {
    name: "Supper Burrow",
    sceneClass: "kitchen",
    opening: ["SURYA", "Burrata, steak frites, and cake. This trail is very well fed."],
    hint: "A dinner has a starter first, then the main, then dessert.",
    complete: ["SURYA", "We made all of this together. And somehow, nobody gave Rayhan chopsticks."],
    puzzle: "meal",
  },
  {
    name: "Overlook Tunnel",
    sceneClass: "concert",
    opening: ["SURYA", "He came through here during the concert. Probably watching me instead of the stage."],
    hint: "Rayhan’s note says he could see the whole floor beneath the railing. Which level is that?",
    puzzle: "concert",
  },
  {
    name: "Heartwood Chamber",
    sceneClass: "heartwood",
    opening: ["SURYA", "Every trail led here. I think I know who is behind that door."],
    hint: "Place every keepsake you collected into the glowing sockets.",
    puzzle: "final",
  },
];

const scene = document.querySelector("#scene");
const modal = document.querySelector("#modal");
const inventory = document.querySelector("#inventory");
const chapter = document.querySelector("#chapter");
const roomName = document.querySelector("#room-name");
const speaker = document.querySelector("#speaker");
const dialogue = document.querySelector("#dialogue");
const continueButton = document.querySelector("#continue-button");

function setDialogue(name, text) {
  speaker.textContent = name;
  dialogue.textContent = text;
}

function openModal({ kicker = "FOUND", title, copy, actions }) {
  document.querySelector("#modal-kicker").textContent = kicker;
  document.querySelector("#modal-title").textContent = title;
  document.querySelector("#modal-copy").textContent = copy;
  const actionsElement = document.querySelector("#modal-actions");
  actionsElement.replaceChildren();
  actions.forEach(({ label, handler, alt }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `choice-button${alt ? " alt" : ""}`;
    button.textContent = label;
    button.addEventListener("click", () => {
      modal.hidden = true;
      handler?.();
    });
    actionsElement.append(button);
  });
  modal.hidden = false;
}

function renderInventory() {
  inventory.replaceChildren();
  game.inventory.forEach((item) => {
    const keepsake = document.createElement("span");
    keepsake.className = "keepsake";
    keepsake.title = item.name;
    keepsake.textContent = item.icon;
    inventory.append(keepsake);
  });
}

function isRoomComplete() {
  const room = roomData[game.room];
  return room.objects.filter((object) => object.required).every((object) => game.inspected.has(object.id));
}

function inspect(object) {
  if (object.door) {
    if (!isRoomComplete()) {
      openModal({ kicker: "NOT YET", title: object.title, copy: object.copy, actions: [{ label: "Keep looking", alt: true }] });
      return;
    }
    openModal({ kicker: "TUNNEL OPEN", title: "The roots make room", copy: "A warmer current of air carries you toward the next memory.", actions: [{ label: "Follow the trail →", handler: nextRoom }] });
    return;
  }
  if (object.wrong) {
    setDialogue("STELLA", object.copy);
    openModal({ kicker: "CLOSE, BUT NO", title: object.title, copy: object.copy, actions: [{ label: "Try another", alt: true }] });
    return;
  }
  if (object.correct) {
    game.inspected.add(object.id);
    if (!game.inventory.some((item) => item.id === "bookmark")) {
      game.inventory.push({ id: "bookmark", icon: "⌑", name: "Pressed-leaf bookmark · 11.05.25" });
      renderInventory();
    }
    setDialogue(...roomData[game.room].complete);
  } else {
    game.inspected.add(object.id);
    setDialogue("SURYA", object.copy);
    if (isRoomComplete() && game.room === 0 && !game.inventory.some((item) => item.id === "case")) {
      game.inventory.push({ id: "case", icon: "◌", name: "Rayhan's glasses case" });
      renderInventory();
      setDialogue(...roomData[game.room].complete);
    }
  }
  openModal({ kicker: "FOUND", title: object.title, copy: object.copy, actions: [{ label: "Back to the room", alt: true }] });
}

function renderRoom() {
  const room = roomData[game.room];
  game.inspected = new Set();
  scene.className = `scene ${room.sceneClass}`;
  scene.replaceChildren();
  const title = document.createElement("h1");
  title.className = "room-title";
  title.textContent = room.name;
  scene.append(title);
  if (room.puzzle) {
    renderPuzzleRoom(room);
  } else if (game.room === 0) {
    const footprints = document.createElement("div");
    footprints.className = "footprints";
    scene.append(footprints);
  } else {
    const leftShelf = document.createElement("div");
    leftShelf.className = "shelf";
    const rightShelf = document.createElement("div");
    rightShelf.className = "shelf right";
    const counter = document.createElement("div");
    counter.className = "counter";
    scene.append(leftShelf, rightShelf, counter);
  }
  (room.objects ?? []).forEach((object) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `object ${object.className}`;
    button.setAttribute("aria-label", object.label);
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = object.label;
    button.append(label);
    if (object.stella) {
      button.append(Object.assign(document.createElement("i"), { className: "ear" }), Object.assign(document.createElement("i"), { className: "ear" }));
    }
    button.addEventListener("click", () => inspect(object));
    scene.append(button);
  });
  const bunny = document.createElement("div");
  bunny.className = "bunny";
  bunny.innerHTML = "<i class=\"ear\"></i><i class=\"ear\"></i><i class=\"head\"></i><i class=\"bangs\"></i><i class=\"body\"></i>";
  scene.append(bunny);
  chapter.textContent = `0${game.room + 1} / 06`;
  roomName.textContent = room.name;
  setDialogue(...room.opening);
}

function addObject(className, label, action) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `object ${className}`;
  button.innerHTML = `<span class="label">${label}</span>`;
  button.setAttribute("aria-label", label);
  button.addEventListener("click", action);
  scene.append(button);
}

function completePuzzle(keepsake) {
  if (!game.inventory.some((item) => item.id === keepsake.id)) game.inventory.push(keepsake);
  renderInventory();
  setDialogue(...roomData[game.room].complete);
  openModal({ kicker: "KEEPSAKE FOUND", title: keepsake.name, copy: "The next tunnel loosens its roots. Rayhan was definitely here.", actions: [{ label: "Follow the trail →", handler: nextRoom }] });
}

function renderPuzzleRoom(room) {
  if (room.puzzle === "timeline") {
    ["11.05.25\nFirst date", "01.18.26\nUs", "09.05.26\nTonight"].forEach((value, index) => {
      const card = document.createElement("button");
      card.type = "button"; card.className = "timeline-card"; card.textContent = value;
      card.addEventListener("click", () => timelinePick(index)); scene.append(card);
    });
    addObject("snow-door", "Frosted tunnel", () => openModal({ kicker: "FROSTED SHUT", title: "Put the memories in order", copy: room.hint, actions: [{ label: "Got it", alt: true }] }));
  }
  if (room.puzzle === "meal") {
    [["burrata", "Burrata", 1], ["frites", "Steak frites", 2], ["cake", "Tres leches", 3]].forEach(([id, label, order]) => {
      const card = document.createElement("button"); card.type = "button"; card.className = "meal-card"; card.textContent = label;
      card.addEventListener("click", () => mealPick(id, order, label)); scene.append(card);
    });
    addObject("note", "Chopstick alcove", () => openModal({ kicker: "WRONG TURN", title: "Rayhan versus chopsticks", copy: "A note reads: I fled before someone gave me two tiny sticks and called it dinner. The recipe is back by the counter.", actions: [{ label: "Return to dinner", alt: true }] }));
  }
  if (room.puzzle === "concert") {
    ["floor", "overlook"].forEach((level) => { const div = document.createElement("div"); div.className = level; scene.append(div); });
    addObject("concert-door floor-door", "Floor tunnel", () => openModal({ kicker: "WRONG TUNNEL", title: "Only a popcorn machine", copy: "Rayhan left an arrow pointing upward. He was never on the floor.", actions: [{ label: "Try the other tunnel", alt: true }] }));
    addObject("concert-door overlook-door", "Overlook tunnel", () => completePuzzle({ id: "ticket", icon: "▤", name: "Carved overlook ticket" }));
    addObject("note", "Rayhan's concert note", () => openModal({ kicker: "A NOTE", title: "A very honest confession", copy: "The show was brilliant. I assume. I spent most of it looking at you. I could see the whole floor beneath the railing.", actions: [{ label: "Keep looking", alt: true }] }));
  }
  if (room.puzzle === "final") {
    const rayhan = document.createElement("div"); rayhan.className = "rayhan"; scene.append(rayhan);
    ["◌", "⌑", "❄", "♜", "▤"].forEach((symbol, index) => { const socket = document.createElement("button"); socket.type = "button"; socket.className = "socket"; socket.textContent = symbol; socket.setAttribute("aria-label", "Keepsake socket"); socket.addEventListener("click", finishGame); scene.append(socket); });
    addObject("heart-door", "Heartwood door", finishGame);
  }
}

let timelineProgress = [];
function timelinePick(index) {
  const expected = timelineProgress.length;
  if (index !== expected) { openModal({ kicker: "NOT QUITE", title: "Try the earlier memory", copy: "Start with the first date, then the night you became a couple, then tonight.", actions: [{ label: "Try again", alt: true }] }); return; }
  timelineProgress.push(index);
  if (timelineProgress.length === 3) { timelineProgress = []; completePuzzle({ id: "snow", icon: "❄", name: "Snowy heart charm · 01.18.26" }); }
  else setDialogue("SURYA", "That belongs there. What came next?");
}

let mealProgress = 0;
function mealPick(id, order, label) {
  if (order !== mealProgress + 1) { openModal({ kicker: "HUNGRY, BUT EARLY", title: "Not that course yet", copy: "Start small, then go savory, then save room for cake.", actions: [{ label: "Try again", alt: true }] }); return; }
  mealProgress += 1;
  setDialogue("SURYA", `${label}. Correct course.`);
  if (mealProgress === 3) { mealProgress = 0; completePuzzle({ id: "fork", icon: "♜", name: "Tiny golden fork" }); }
}

function finishGame() {
  const required = ["case", "bookmark", "snow", "fork", "ticket"];
  if (!required.every((id) => game.inventory.some((item) => item.id === id))) {
    openModal({ kicker: "ALMOST THERE", title: "The heartwood listens", copy: "It needs every keepsake from your journey before it will open.", actions: [{ label: "Look at the satchel", alt: true }] });
    return;
  }
  openModal({ kicker: "FOUND HIM", title: "Rayhan", copy: "You found me, Surya. Every trail was just an excuse to bring you through the little world we have made together. [Your loving letter goes here in script.js.]", actions: [{ label: "Play again", handler: () => { game.room = 0; game.inventory = []; renderInventory(); renderRoom(); } }] });
}

function nextRoom() {
  game.room += 1;
  if (!roomData[game.room]) {
    game.room = 0;
  }
  renderRoom();
}

document.querySelector("#hint-button").addEventListener("click", () => {
  const room = roomData[game.room];
  openModal({ kicker: "A LITTLE NUDGE", title: "Hint", copy: room.hint, actions: [{ label: "Got it", alt: true }] });
});
continueButton.addEventListener("click", () => {
  const firstObject = roomData[game.room].objects.find((object) => !object.door && !game.inspected.has(object.id));
  if (firstObject) inspect(firstObject);
});
document.querySelector("#sound-button").addEventListener("click", (event) => {
  game.muted = !game.muted;
  event.currentTarget.textContent = game.muted ? "×" : "♪";
  event.currentTarget.setAttribute("aria-label", game.muted ? "Sound muted" : "Sound on");
});
document.querySelector(".wordmark").addEventListener("click", (event) => {
  event.preventDefault();
  game.room = 0;
  game.inventory = [];
  renderInventory();
  renderRoom();
});

renderRoom();