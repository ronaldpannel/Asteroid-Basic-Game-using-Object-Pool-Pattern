/**@type{HTMLCanvasElement} */

window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 1024;
  canvas.height = 576;
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.font = "30px Helvetica";
  ctx.fillStyle = "white";

  class Asteroid {
    constructor(game) {
      this.game = game;
      this.radius = 75;
      this.x = -this.radius;
      this.y = randomIntFromRange(this.radius, this.game.height - this.radius);
      this.imageWidth = 150;
      this.imageHeight = 150;
      this.speed = randomIntFromRange(1.5, 1.6);
      this.angle = 0;
      this.va = Math.random() * 0.1 - 0.05;
      this.image = document.getElementById("asteroid");
      this.free = true;
    }
    draw(context) {
      if (!this.free) {
        context.beginPath();
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.angle);
        // context.arc(0, 0, this.radius, 0, Math.PI * 2);
        context.drawImage(
          this.image,
          0 - this.imageWidth * 0.5,
          0 - this.imageHeight * 0.5
        );
        context.stroke();
        context.restore();
      }
    }
    update() {
      if (!this.free) {
        this.angle += this.va;
        this.x += this.speed;
        if (this.x > this.game.width - this.radius) {
          this.reset();
          const explosion = this.game.getExplosion();
          if (explosion) explosion.start(this.x, this.y, (this.speed = 0));
        }
      }
    }
    start() {
      this.free = false;
      this.x = -this.radius;
      this.y = randomIntFromRange(this.radius, this.game.height - this.radius);
    }
    reset() {
      this.free = true;
    }
  }

  class Explosion {
    constructor(game) {
      this.game = game;
      this.x = 0;
      this.y = 0;
      this.speed = 0;
      this.image = document.getElementById("explosion");
      this.spriteWidth = 300;
      this.spriteHeight = 300;
      this.frameX = 0;
      this.frameY = Math.floor(Math.random() * 3);
      this.free = true;
      this.maxFrame = 22;
      this.animationTimer = 0;
      this.animationInterval = 1000 / 25;
    }
    draw(context) {
      if (!this.free) {
        context.beginPath();
        context.drawImage(
          this.image,
          this.spriteWidth * this.frameX,
          this.spriteHeight * this.frameY,
          this.spriteWidth,
          this.spriteHeight,
          this.x - this.spriteWidth * 0.5,
          this.y - this.spriteHeight * 0.5,
          this.spriteWidth,
          this.spriteHeight
        );
      }
    }
    update(deltaTime) {
      this.x += this.speed;
      if (!this.free) {
        this.x += this.speed;
        if (this.animationTimer > this.animationInterval) {
          this.frameX++;
          if (this.frameX > this.maxFrame) this.reset();
          this.animationTimer = 0;
        } else this.animationTimer += deltaTime;
      }
    }

    reset() {
      this.free = true;
    }
    start(x, y, speed) {
      this.free = false;
      this.x = x;
      this.y = y;
      this.frameX = 0;
      this.speed = speed;
    }
  }
  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.max = 30;
      this.asteroidPool = [];
      this.createAsteroidPool();
      this.asteroidTimer = 0;
      this.asteroidInterval = 500;

      this.explosionPool = [];
      this.maxExplosions = 7;
      this.score = 0;
      this.maxScore = 30;
      this.createExplosionPool();

      this.pointer = {
        x: undefined,
        y: undefined,
        radius: 2,
      };
      this.explosion1 = document.getElementById("explosion1");
      this.explosion2 = document.getElementById("explosion2");
      this.explosion3 = document.getElementById("explosion3");
      this.explosion4 = document.getElementById("explosion4");
      this.explosion5 = document.getElementById("explosion5");
      this.explosion6 = document.getElementById("explosion6");

      this.explosionSounds = [
        this.explosion1,
        this.explosion2,
        this.explosion3,
        this.explosion4,
        this.explosion5,
        this.explosion6,
      ];

      window.addEventListener("click", (e) => {
        this.pointer.x = e.offsetX;
        this.pointer.y = e.offsetY;
        for (let i = 0; i < this.asteroidPool.length; i++) {
          if (
            !this.asteroidPool[i].free &&
            this.checkCollision(this.asteroidPool[i], this.pointer)
          ) {
            const explosion = this.getExplosion();
            if (explosion) {
              explosion.start(
                this.asteroidPool[i].x,
                this.asteroidPool[i].y,
                this.asteroidPool[i].speed * 0.4
              );
              this.asteroidPool[i].reset();

              if (this.score <= this.maxScore) {
                this.score++;
                this.explosionSounds.currentTime = 0;
                this.explosionSounds[
                  Math.floor(Math.random() * this.explosionSounds.length)
                ].play();
              }
            }
          }
        }
      });
    }
    createAsteroidPool() {
      for (let i = 0; i < this.max; i++) {
        this.asteroidPool.push(new Asteroid(this));
      }
    }
    getAsteroid() {
      for (let i = 0; i < this.asteroidPool.length; i++) {
        if (this.asteroidPool[i].free) {
          return this.asteroidPool[i];
        }
      }
    }
    createExplosionPool() {
      for (let i = 0; i < this.maxExplosions; i++) {
        this.explosionPool.push(new Explosion(this));
      }
    }
    getExplosion() {
      for (let i = 0; i < this.explosionPool.length; i++) {
        if (this.explosionPool[i].free) {
          return this.explosionPool[i];
        }
      }
    }
    checkCollision(a, b) {
      let sumOfRadii = a.radius + b.radius;
      let dx = a.x - b.x;
      let dy = a.y - b.y;
      let distance = Math.hypot(dx, dy);
      return distance < sumOfRadii;
    }
    render(context, deltaTime) {
      context.beginPath();
      context.arc(
        this.pointer.x,
        this.pointer.y,
        this.pointer.radius,
        0,
        Math.PI * 2
      );
      context.stroke();
      if (this.asteroidTimer > this.asteroidInterval) {
        let asteroid = this.getAsteroid();

        if (asteroid) {
          asteroid.start();
        }

        this.asteroidTimer = 0;
      } else {
        this.asteroidTimer += deltaTime;
      }

      this.asteroidPool.forEach((asteroid) => {
        asteroid.draw(context);
        asteroid.update();
      });

      this.explosionPool.forEach((explosion) => {
        explosion.draw(context);
        explosion.update(deltaTime);
      });
      context.fillText(`Score ${this.score}`, 20, 35);
      if (this.score >= this.maxScore) {
        context.save();
        context.textAlign = "center";
        context.fillText(
          `You Win! Final Score is ${this.score}`,
          this.width * 0.5,
          this.height * 0.5
        );
        context.restore();
      }
      context.save();
      context.textAlign = "center";
      context.fillText(
        "Click on Asteroid to destroy and score points",
        this.width * 0.5,
        35
      );
      context.restore();
    }
  }

  const game = new Game(canvas.width, canvas.height);
  let lastTime = 0;

  function animate(timeStamp) {
    let deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(ctx, deltaTime);
    requestAnimationFrame(animate);
  }
  animate(0);

  //load function end
});
