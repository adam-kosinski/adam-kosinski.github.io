var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var interval = 0;
var keyqueue = 0;
var bob = {
  x: 100,
  y: 100,
  xvel: 0,
  yvel: 0,
  dir: 4     //DIR: 1=front,2=left,3=back,4=right
};
var hairStyle = [];
for (i=0;i<80;i++) {
  i>=30 && i<70 ? hairStyle.push(Math.random()*6+9):hairStyle.push(Math.random()*5+5);
}

//generates background.array
var background = {
	x: bob.x,
	y: bob.y,
	array: []
};
for (i=0;i<500;i++) {
  background.array.push([]);
  for (j=0;j<500;j++) {
      background.array[i][j] = bPres("grass");
      if (i !== 0 && j !== 0) {
        background.array[i][j] = Math.random() > 0.4 ? Math.random() > 0.7 ? background.array[i][j-1] : background.array[i-1][j] : bPres("grass");
	  }
    
  }
}

//displays background.array
for (i=0;i<500;i++) {
  for (j=0;j<500;j++) {
    ctx.fillStyle = background.array[i][j];
    ctx.fillRect(j,i,1,1);
  }
}





setInterval(function(){
  interval += 1;
  if (interval%5 === 0) {
    if (keyqueue == 37) {
      bob.xvel -= 1;
      bob.dir = 2;
    }
    if (keyqueue == 38) {
      bob.yvel -= 1;
      bob.dir = 3;
    }
    if (keyqueue == 39) {
      bob.xvel += 1;
      bob.dir = 4;
    }
    if (keyqueue == 40) {
      bob.yvel += 1;
      bob.dir = 1;
    }
    keyqueue = 0;
  }
  bob.x+=bob.xvel;
  bob.y+=bob.yvel;
  bob.xvel *= 0.9;
  bob.yvel *= 0.9;
  if (bob.xvel < 0.01 && bob.xvel > -0.01) {
    bob.xvel = 0;
  }
  if (bob.yvel < 0.01 && bob.yvel > -0.01) {
    bob.yvel = 0;
  }
  
  drawBob(250,250);
}, 20);




var globalNarrow;


function drawBob(xfn,yfn) {
  //draw background.array
  for (i=Math.floor(yfn-15);i<Math.floor(xfn+45);i++) {
    for (j=Math.floor(yfn-20);j<Math.floor(xfn+20);j++) {
      ctx.fillStyle = background.array[Math.floor((background.y+2000000+i)%500)][Math.floor((background.x+2000000+j)%500)];
      ctx.fillRect(j,i,1,1);
    }
  }
  
  //take pictures of background.array and redraw background.array
  var yOffset = Math.trunc(bob.y-background.y);
  var xOffset = Math.trunc(bob.x-background.x);
  
  if(yOffset > 0){
	  //take pictures
	  var narrow = ctx.getImageData(0,0,500,yOffset);
	  var big = ctx.getImageData(0,yOffset,500,500-yOffset);
	  
	  //paste pictures
	  ctx.putImageData(narrow,0,500-yOffset);
	  ctx.putImageData(big,0,0);
	  background.y += yOffset;
  }
  
  if(yOffset < 0){
	  //take pictures
	  var narrow = ctx.getImageData(0,500+yOffset,500,-yOffset);
	  var big = ctx.getImageData(0,0,500,500+yOffset);
	
	  //paste pictures
	  ctx.putImageData(narrow,0,0);
	  ctx.putImageData(big,0,-yOffset);
	  background.y += yOffset;
  }
  
  if(xOffset > 0){
	  //take pictures
	  var narrow = ctx.getImageData(0,0,xOffset,500);
	  var big = ctx.getImageData(xOffset,0,500-xOffset,500);
	  
	  //paste pictures
	  ctx.putImageData(narrow,500-xOffset,0);
	  ctx.putImageData(big,0,0);
	  background.x += xOffset;
  }
  
  if(xOffset < 0){
	  //take pictures
	  var narrow = ctx.getImageData(500+xOffset,0,-xOffset,500);
	  var big = ctx.getImageData(0,0,500+xOffset,500);
	
	  //paste pictures
	  ctx.putImageData(narrow,0,0);
	  ctx.putImageData(big,-xOffset,0);
	  background.x += xOffset;
  }
  
  
  //draw bob
  ctx.fillStyle = "black";
  circle(xfn,yfn,10);
  ctx.fillStyle = "white";
  circle(xfn,yfn,8.5);
  ctx.fillStyle = "black";
  ctx.fillRect(xfn-9,yfn+10,18,20);
  ctx.fillStyle = "white";
  ctx.fillRect(xfn-8,yfn+11,16,18);
  ctx.fillStyle = "black";
  circle(xfn-10+3*Math.sin(bob.x/4+bob.y/4),yfn+20+Math.sin(bob.x/4+bob.y/4),2.5);
  circle(xfn+10+3*Math.sin(bob.x/5+bob.y/5),yfn+20+Math.sin(bob.x/6+bob.y/4),2.5);
  circle(xfn-7+2*Math.sin(bob.x/6),yfn+35+2*Math.sin(bob.y/6+bob.x/6),2.5);
  circle(xfn+7+2*Math.cos(bob.x/6),yfn+35-2*Math.sin(bob.y/6-bob.x/6),2.5);
  if (bob.dir == 3) {
    ctx.fillStyle = "white";
    ctx.fillRect(xfn-8,yfn+11,16,18);
    ctx.fillStyle = "black";
  }
  (bob.dir==1||bob.dir==4) ? circle(xfn+4,yfn+4,1.5):xfn=xfn;
  (bob.dir <= 2) ? circle(xfn-4,yfn+5,1.5):xfn=xfn;
  for (i=20*(bob.dir-1);i<20*bob.dir;i++) {
    ctx.fillRect(xfn+10+i-bob.dir*20,yfn-Math.sqrt(100-(i+10-bob.dir*20)*(i+10-bob.dir*20)),1,hairStyle[i]);
  }
}

//draws a circle!
function circle(xfun,yfun,sizefun) {
  ctx.beginPath();
  ctx.arc(xfun,yfun,sizefun,0,2*Math.PI);
  ctx.fill();
}

function bPres(color) {
  if (color === "random") {
    return "rgb("+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+")"
  }
  if (color === "grass") {
    return "rgb("+Math.floor(Math.random()*50)+","+Math.floor(Math.random()*100+150)+",30)";
  }
}

function thingdown(e){
  keyqueue = e.keyCode;
}