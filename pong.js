/// TODO - 
// bot AI
// y velocity for ball
// restart game

function Game() {};
Game.prototype.init = function (){
		this.canvas = document.getElementById("gamecanvas");
		this.ctx = this.canvas.getContext("2d");
		this.ctx.fillStyle = "rgb(0, 0, 0);"
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		gameStates = ["inProgress", "paused", "gameOver", "notStarted"];
		this.currState = "notStarted";
		this.score = {'user': 0, 'bot': 0 } 
		this.player_d = {'user': -1, 'bot': 1}

		document.addEventListener("keydown", this.userMove, false);
};

Game.prototype.start = function(){
	ball = new Ball();
	paddle = new Array();
	paddle['user'] = new Paddle(0, game.canvas.height/3, 15, game.canvas.height/5);
	paddle['bot'] = new Paddle(game.canvas.width - 15, game.canvas.height/3, 15, game.canvas.height/5);
	game.currState = "inProgress";
};

Game.prototype.gameLoop = function(){
	// update time "step" -> move ball and auto paddle based on velocity
	
	switch (game.currState) {
		case "inProgress":
		game.update();
		game.draw();
		break;
	}
};

Game.prototype.update = function(){
	ball.pos.x += ball.vel.x;
	ball.pos.y += ball.vel.y;

	// friction
	paddle['user'].vel.y *= .7;
	paddle['bot'].vel.y *= .7;

	// updating position based on velocity
	paddle['user'].pos.y += paddle['user'].vel.y;
	paddle['bot'].pos.y += paddle['bot'].vel.y;

	this.checkBoundaries();
	this.bouncePaddle("user");
	this.bouncePaddle("bot");
	
	paddle['user'].checkY();
	paddle['bot'].checkY();

	paddle['bot'].updateBot();

	ball.checkVelY();
	// sub function here. that deals w/ keyboard input, called by event listened
};

Game.prototype.userMove = function (e){
	switch (e.keyCode) {
		case 38:// up arrow
			paddle['user'].vel.y -= 10;
			break;
		case 40: // down arrow
			paddle['user'].vel.y += 10;
			break;
	}
};

Game.prototype.checkBoundaries = function(){
	if(ball.pos.x >= ( game.canvas.width - ball.dim.w ) || ball.pos.x <= 0){
		if (ball.pos.x < paddle['user'].pos.x){
			this.scoreIncrement('bot');
		}
		if(ball.pos.x > paddle['bot'].pos.x + paddle['bot'].dim.w){
			this.scoreIncrement('user');
		}

	}
	if(ball.pos.y >= ( game.canvas.height - ball.dim.h ) || ball.pos.y <= 0){
		ball.flipDir("y");
	}
};

Game.prototype.scoreIncrement = function(player){
	this.score[player]+= 1;
	ball.reset(this.player_d[player]);
};

Game.prototype.bouncePaddle = function(paddle_id){
	if(
		//Check ball is within paddle bounds on x axis
		ball.pos.x + ball.dim.w >= paddle[paddle_id].pos.x &&
		ball.pos.x < paddle[paddle_id].pos.x + paddle[paddle_id].dim.w &&

		//Check ball is within paddle bounds along y axis
		ball.pos.y + ball.dim.h >= paddle[paddle_id].pos.y &&
		ball.pos.y < paddle[paddle_id].pos.y + paddle[paddle_id].dim.h
	){
			ball.flipDir('x', paddle_id);



	}
};

Game.prototype.draw = function(){
	//Clear Canvas
	game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
	game.ctx.fillStyle = "rgba(30, 0, 0, .1);";
	// Draw Background
	game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
	game.ctx.fillStyle = "rgb(255,0,0);";
	//Draw Ball
	game.ctx.fillRect(ball.pos.x, ball.pos.y, ball.dim.w, ball.dim.h);
	//Draw Paddles
		game.ctx.fillStyle = "rgb(0,0,0);";

	game.ctx.fillRect(paddle['user'].pos.x, paddle['user'].pos.y, paddle['user'].dim.w, paddle['user'].dim.h);
	game.ctx.fillRect(paddle['bot'].pos.x, paddle['bot'].pos.y, paddle['bot'].dim.w, paddle['bot'].dim.h);
	//Draw Scores
	game.ctx.font = "20px Courier";
	game.ctx.fillStyle = "rgb(0,0,0);"
	game.ctx.fillText(this.score['user'], 40, 40);
	game.ctx.fillText(this.score['bot'], 550, 40);

};

function Ball() {
	d = Math.random();
	if (d < 0.5) {
		d = -1;
	}
	else {
		d = 1;
	}
	this.reset(d);
};


Ball.prototype.flipDir = function(dir, paddle_id){
	this.vel[dir] *= -1;
	if(typeof(paddle_id) !== 'undefined' && paddle[paddle_id].vel.y != 0){
		this.vel.y *= - paddle[paddle_id].vel.y; 
	}
};

Ball.prototype.create = function(){

};

Ball.prototype.reset = function(d, x, y, w, h){
	// new "round"
	if(typeof(x) === 'undefined') {
		x = ( game.canvas.width + 15 ) / 2;
		y = game.canvas.height / 2 -50;
		w = 15;
		h = 15;
	}
	vY = Math.floor( ( Math.random() - 0.5 ) * 5);
	this.pos = {x: x, y: y};
	this.vel = {x: 8 * d, y: vY};
	this.dim = {w: w, h: h};
};

Ball.prototype.checkVelY = function() {
	velRatio = this.vel.y/this.vel.x;
	if ( Math.abs(velRatio) > 3) {
		this.vel.y *= 0.2;
		console.log('reduce y velocity')
	}
}

function Paddle(x, y, w, h) {
	this.pos = {x: x, y: y};
	this.dim = {w: w, h: h};
	this.vel = {x: 0, y: 0};
}

Paddle.prototype.checkY = function() {
	if (this.pos.y < 0) {
		this.pos.y = 0;
		this.vel.y = 0;
	}
	if (this.pos.y + this.dim.h > game.canvas.height) {
		this.pos.y = game.canvas.height - this.dim.h;
		this.vel.y = 0;
	}
}

Paddle.prototype.updateBot = function(){
	if(ball.vel.x>0){
		distance = ball.pos.y - paddle['bot'].pos.y;
		paddle['bot'].vel.y += distance/2;
	}
}
