let container = document.querySelector(".p5-container");
let size = { x: container.offsetWidth, y: container.offsetHeight };

let denites = (sk) => {
  let canvas;
  let rects = [];
  let boundaries = [];
  let start = true;
  let deviceChecked = false;
  let font;
  let numRects;

  let engine, world, matterMouse, mConst;
  let density, dim;

  // module aliases
  const Engine = Matter.Engine;
  const World = Matter.World;
  const Bodies = Matter.Bodies;
  const MouseConstraint = Matter.MouseConstraint;
  const Mouse = Matter.Mouse;

  let sponsors = [
    "Aurora",
    "Calypso",
    "Clever",
    "Dotmoovs",
    "Exclusible",
    "Exeedme",
    "Finiam",
    "Immunefi",
    "Impact Market",
    "Instituto New Economy",
    "Invisible Lab",
    "MaracujÃ¡lia",
    "Onda",
    "Pink Room",
    "Polkamarkets",
    "Protocol Labs",
    "Pyth",
    "RealFevr",
    "Subvisual",
    "Sumcap",
    "TAIKAI",
    "Talent Protocol",
    "Uphold",
    "Utrust",
    "WallID",
    "zkSync",
    "Iron Hack",
    "Startup Lisboa",
    "Algorand",
    "A.team",
    "Algae"
  ];

  let numSponsor = 0;

  sk.mouse = false;
  sk.touch = false;
  sk.pause = true;
  let doit;

  sk.setup = () => {
    canvas = sk.createCanvas(size.x, size.y);
    canvas.parent(container);
    sk.smooth();
    density = sk.displayDensity();
    sk.pixelDensity(density);

    dim = sk.max(sk.width, sk.height);

    numRects = sponsors.length;

    font = sk.loadFont("https://oz19yv.csb.app/fonts/Sora-Regular.ttf", () => {
      sk.textFont(font);
      sk.textSize(dim / 60);
      sk.textAlign(sk.CENTER, sk.CENTER);

      for (let i = 0; i < sponsors.length; i++) {}
      for (let i = 0; i < numRects; i++) {
        sk.newRect(sk.random(sk.width), sk.random(dim / 20, sk.height / 2));
        numSponsor++;
        if (numSponsor % sponsors.length == 0) numSponsor = 0;
      }
      start = false;
    });

    engine = Engine.create();
    world = engine.world;

    sk.expInit();

    world.gravity.y = 0.8;

    sk.rectMode(sk.CENTER);
    sk.stroke(65, 0, 228);
    sk.fill(255);
  };

  sk.onMouseLeave = (event) => {
    matterMouse.mouseup(event);
  };

  sk.expInit = () => {
    /*for (let i = 0; i < rects.length; i++) {
      World.remove(world, rects[i].body);
    }

    rects = [];*/

    for (let i = 0; i < boundaries.length; i++) {
      World.remove(world, boundaries[i].body);
    }

    // left
    boundaries[0] = new Boundary(-499, sk.height / 2, 1000, sk.height * 2, 0);
    // bottom
    boundaries[1] = new Boundary(
      sk.width / 2,
      sk.height + 499,
      sk.width * 2,
      1000,
      0
    );
    // right
    boundaries[2] = new Boundary(
      sk.width + 499,
      sk.height / 2,
      1000,
      sk.height * 2,
      0
    );
    // top
    boundaries[3] = new Boundary(sk.width / 2, -499, sk.width, 1000, 0);

    if (!start) {
      for (let i = 0; i < rects.length; i++) {
        if (rects[i].isOffScreen()) {
          numSponsor = rects[i].sponsor;
          World.remove(world, rects[i].body);
          rects.splice(i, 1);
          sk.newRect(sk.width / 2, sk.height / 4);
        }
      }

      /*for (let i = 0; i < numRects; i++) {
        sk.newRect(sk.random(sk.width), sk.random(dim / 20, sk.height / 2));
        numSponsor++;
        if (numSponsor % sponsors.length == 0) numSponsor = 0;
      }*/
    }
  };

  sk.newRect = (x, y) => {
    const r = new Rect(x, y);
    rects.push(r);
  };

  sk.draw = () => {
    sk.clear();

    if (sk.pause) {
      sk.noLoop();
    } else {
      sk.loop();
    }

    if (!deviceChecked && sk.mouse) {
      sk.initMouse();
      deviceChecked = true;
    }

    Engine.update(engine, 1000 / 60);

    if (sk.touch) {
      if (sk.touches.length == 2) {
        if (world.constraints.length < 1) World.add(world, mConst);
      } else {
        if (world.constraints.length > 0) World.remove(world, mConst);
      }
    }

    for (let i = 0; i < rects.length; i++) {
      rects[i].show();
      if (rects[i].isOffScreen()) {
        numSponsor = rects[i].sponsor;
        World.remove(world, rects[i].body);
        rects.splice(i, 1);
        sk.newRect(sk.width / 2, sk.height / 4);
      }
    }

    for (let i = 0; i < 2; i++) {
      boundaries[i].show();
    }
  };

  sk.windowResized = () => {
    size = { x: container.offsetWidth, y: container.offsetHeight };
    sk.resizeCanvas(size.x, size.y);
    dim = sk.max(sk.width, sk.height);

    sk.textSize(dim / 60);

    clearTimeout(doit);
    doit = setTimeout(sk.expInit, 100);
  };

  sk.mouseMoved = () => {
    sk.mouse = true;
    sk.touch = false;
  };

  sk.touchStarted = () => {
    if (!sk.mouse) {
      sk.mouse = false;
      sk.touch = true;
    }
  };

  sk.initMouse = () => {
    matterMouse = Mouse.create(canvas.elt);
    matterMouse.pixelRatio = density;

    const options = {
      mouse: matterMouse,
      constraint: {
        stiffness: 1
      }
    };

    mConst = MouseConstraint.create(engine, options);
    mConst.mouse.element.removeEventListener(
      "mousewheel",
      mConst.mouse.mousewheel
    );
    mConst.mouse.element.removeEventListener(
      "DOMMouseScroll",
      mConst.mouse.mousewheel
    );

    World.add(world, mConst);

    canvas.elt.addEventListener("mouseleave", sk.onMouseLeave);
  };

  class Rect {
    constructor(x, y) {
      this.options = {
        restitution: 0.2,
        friction: 0.7,
        frictionStatic: 10,
        slop: 1,
        chamfer: 50
      };

      this.sponsor = numSponsor;
      this.x = x;
      this.y = y;
      this.w = sk.max(sk.textWidth(sponsors[this.sponsor]) + dim / 30, dim / 8);
      this.h = dim / 30;
      this.body = Bodies.rectangle(
        this.x,
        this.y,
        this.w,
        this.h,
        this.options
      );
      World.add(world, this.body);

      this.pos = this.body.position;
      this.angle = 0;
      this.base = this.pos.y;
    }

    show() {
      this.angle = this.body.angle;
      sk.push();
      sk.translate(this.pos.x, this.pos.y);
      sk.rotate(this.angle);
      sk.stroke(65, 0, 228);
      sk.fill(255);
      sk.rect(0, 0, this.w, this.h, 50);
      sk.noStroke();
      sk.fill(65, 0, 228);
      sk.text(sponsors[this.sponsor], 0, -dim / 400);
      sk.pop();
    }

    isOffScreen() {
      return (
        this.pos.x < -this.w ||
        this.pos.x > sk.width + this.w ||
        this.pos.y < -this.h ||
        this.pos.y > sk.height + this.h
      );
    }
  }

  class Boundary {
    constructor(x, y, w, h, a) {
      this.options = {
        friction: 1,
        restitution: 0.2,
        density: 1000,
        angle: a,
        isStatic: true
      };

      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.body = Bodies.rectangle(
        this.x,
        this.y,
        this.w,
        this.h,
        this.options
      );

      World.add(world, this.body);
    }

    show() {
      this.pos = this.body.position;
      this.angle = this.body.angle;

      sk.noStroke();
      sk.noFill();

      sk.push();
      sk.translate(this.pos.x, this.pos.y);
      sk.rotate(this.angle);
      sk.rect(0, 0, this.w, this.h);
      sk.pop();
    }
  }
};
let p5denites = new p5(denites, container);

function pause() {
  p5denites.pause = true;
}

function start() {
  p5denites.pause = false;
  p5denites.loop();
}

window.addEventListener("scroll", (e) => {
  if (isScrolledIntoView(container)) start();
  else pause();
});

function isScrolledIntoView(el) {
  var rect = el.getBoundingClientRect();
  var elemTop = rect.top;
  var elemBottom = rect.bottom;

  isVisible = elemTop < window.innerHeight && elemBottom >= 0;
  return isVisible;
}
