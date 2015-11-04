module.exports.Snake=Snake;
module.exports.Point=Point;
module.exports.Gamer=Gamer;
module.exports.Candy=Candy;

function Point(Coordx, Coordy) {
	this.x=Coordx;
	this.y=Coordy;
	
};
function Snake(Point1){
	this.Tableau = [Point1];
	this.ajout = function(){
		for(i=0;i<2;i++){
			This.Tableau.push(new Point(0,0));
		}
	}
	
}
function Gamer(Snake, ws, nexttete,out) {
	this.Snake=Snake;
	this.ws=ws
	this.nexttete=nexttete;
	this.isout=out;
	this.ajout = function(){
		var refx = Snake.Tableau[Snake.Tableau.length-1].x+5;
		var refy = Snake.Tableau[Snake.Tableau.length-1].y+5;
		for(i=0;i<10;i++){
			this.Snake.Tableau.push(new Point(refx,refy));
			refx +=5;
			refy +=5;
		}
	}
	this.loose = function(){
		this.isout=true;
	}
};

function Candy(pos){
	this.pos=pos;
	this.eatCandy = function(snake){
		
			if (norme(this.pos.x, this.pos.y , snake.Snake.Tableau[0].x , snake.Snake.Tableau[0].y) <= 10*2)
			{
				console.log("hit");
				snake.ajout();
				console.log("hit2");
				return true;
			}
		
		return false;
	}
}

function norme(elemAx, elemAy, elemBx,elemBy) 
{
	var x = (elemAx - elemBx);
	var y = (elemAy - elemBy);
	return Math.sqrt((x*x)+(y*y));
}
