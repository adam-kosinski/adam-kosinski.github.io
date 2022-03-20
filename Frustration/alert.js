function createAlert(msg){
  let alert_container = document.getElementById("alerts");

  let div = document.createElement("div");
  div.className = "alert";
  let n_alerts = alert_container.childElementCount;
  div.style.top = 10 + 2*n_alerts + "vw";
  div.style.left = ((100-25)/2) + 2*n_alerts + "vw";

  let p = document.createElement("p");
  p.textContent = msg;
  div.appendChild(p);

  let button = document.createElement("button");
  button.className = "alert_ok_button";
  button.textContent = "OK";
  div.appendChild(button);

  alert_container.appendChild(div);
  alert_container.style.display = "block";

  //no drgging allowed when an alert pops up
  if(drag_element){
    drag_element.classList.remove("focus");
    drag_element = undefined;
  }
}


function alertEvent(type){
  //generate varying alert messages, based on the type of event that occurred
  //see alert_messages below for possible types

  if(won) return;

  if(!alert_messages.hasOwnProperty(type)){
    console.warn("Alert event type not found: " + type);
    return;
  }

  let msgs = alert_messages[type];
  let msg = msgs[Math.floor(msgs.length * Math.random())];
  createAlert(msg);
}


let alert_messages = {
  circle_offscreen: [
    "It looks like you let a circle wander offscreen. That wasn't very attentive of you, was it.",
    "Whoops, a circle seems to have wandered offscreen. That's really unfortunate, isn't it?",
  ],
  success: [
    "That took you long enough.",
    "That was painful to watch. Good job I guess."
  ],
  not_success: [
    "No, you didn't.",
    "I think you're a big fat liar about that one, mister."
  ],
  first_speeding: [
    "Yeah, I forgot to mention that the circles get scared when you move too fast. Sorry about that. Hopefully that doesn't mess with them staying in the boxes or anything."
  ],
  speeding: [
    "Speedy speedy circles!",
    "Circle go vroom vroom!"
  ],
  first_teleport: [
    "Oh yeah, they teleport too. Have fun with that!"
  ],
  lag: [
    "The lag is really annoying, isn't it?",
    "So so much lag...",
    "This lag is so bad. It's almost like it was programmed in explicitly just to annoy you. But I would never do that. Definitely not."
  ],
  time: [
    "I bet I could drive in a hundred circles around the country before you're done with these circles.",
    "Why are you taking so long? Go faster! I'm bored.",
    "You're really bad at this. Are you sure you're actually a human and not some form of mutant bonobo?",
    "A dying sleepwalking sloth would be faster at this than you."
  ],
  runaway_circle: [
    "That circle doesn't seem to want to be around you. Have you showered?",
    "That circle doesn't like you very much.",
    "I think that circle would rather you mind your own beeswax."
  ],
  just_to_annoy: [
    "You don't seem like you're trying very hard at this.",
    "Hi!",
    "This is not that hard. Why do you suck so much at it?",
    "Did you know that there's only one English word that ends in -mt? And no, I won't tell you which one.",
    "Boo.",
    "Do you like peanuts? I like peanuts.",
    "Once upon a time there was a rabbit, who ate a mouse. He then spat the mouse back out. Because rabbits don't eat mice. The end.",
    "A circle of circly circles circled around in a circle.",
    "Roses are red, violets are blue, they're better than circles, and better than you.",
    "Why are you struggling so much? It's just sorting.",
    "This task is so simple.",
    "I never thought I'd see someone so bad at dragging and dropping."
  ]
}
