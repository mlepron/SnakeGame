var https = require('https');
var fs = require('fs');
var Model = require('./Modele'); //Ajout du fichier Modele
var express = require('express');

var key = fs.readFileSync('private/key.pem');
var cert = fs.readFileSync('private/cert.pem');
var options = {
		key: key,
		cert: cert
};
var PORT = 8003;
var app = express();

app.configure(function(){
	app.use(app.router);
});

var server = https.createServer(options, app).listen(PORT);
console.log('HTTPS Server listening on Port:%s',PORT);

app.get('/', function(req, res) {
	res.sendfile('public/index.html');
});
app.configure(function() {
	app.use(express.static('./public'));
});



var WebSocketServer = require('ws').Server
, wss = new WebSocketServer({ server:server});
var Gamers = []; // Création d'un tableau regroupant les Gamers
var firstPos= [Math.floor((Math.random() * 10) + 0),Math.floor((Math.random() * 10) + 0)]; //Pos aléatoire de la tete
var taille=10; //Taille des worms
var withBorder = false; //Choix de jouer avec les bords ou non
var xecran = 1200 ; //taille x de l'écran de jeu
var yecran =  800;	//taille y de l'écran de jeu
var ws;

var candypos = new Model.Point(Math.random() * 1200, Math.random() * 500);// Position aléatoire du bonbon
candy = new Model.Candy(candypos);// Création du premier bonbon


var frequence = 15;
//Loop d'execution du update du jeu
function onFrame() 
{
	update();
}
setInterval(onFrame, frequence);

//Fonction a réaliser lors d'une nouvelle connexion
wss.on('connection', function(ws) {	
	var posx1= Math.floor((Math.random() * 1000) + 10);//Position x aléatoire
	var posy1= Math.floor((Math.random() * 600) + 10);//Position y aléatoire
	var Point1= new Model.Point(posx1, posy1);//Création d'un Point pour la tete du snake
	var Snake1= new Model.Snake(Point1);//Création de l'objet snake
	//Boucle de création des points du corps
	for(var t=1; t<taille;t++){
		var PointCorp= new Model.Point(posx1, posy1-t);
		Snake1.Tableau.push(PointCorp);
	}

	//Ajout du gamer dans le tableau gamers
	Gamers.push(new Model.Gamer(Snake1, ws,firstPos,false));
	console.log('new gamer');
	begin(Gamers);


	
	//Fonction a éxecuter lors de la réception d'un messgae
	ws.on('message', function message(event) 
	{
		var msg = JSON.parse(event);
		switch(msg.type)
		{			
		//Réception de la position de la tete
		case "tete" :
			console.log("New tete"+ msg.x + " : " + msg.y);
			//Parcours du tableau des gamer pour trouver celui qui a envoyé le message
			for(q=0;q<Gamers.length;q++){
				if(ws===Gamers[q].ws){
					Gamers[q].nexttete=[msg.x,msg.y];
				}
			}break;
		}		
	});
});

function norme(elemAx, elemAy, elemBx,elemBy) 
{
	var x = (elemAx - elemBx);
	var y = (elemAy - elemBy);
	return Math.sqrt((x*x)+(y*y));
}


//Fonction begin
function begin(Gamers){
	var TabSnake=[]; //Tableau de snake
	var TabOut=[]; //Tableau avec l'état des joueurs
	var tabCandy=[]; //Tableau avec x et y
	tabCandy.push(candy.pos.x);
	tabCandy.push(candy.pos.y);

	//Boucle sur tableau des joueurs
	for(y=0;y<Gamers.length;y++){
		var message = { 
				type : "majsnake",
				Snake : TabSnake,
				index : y,
				Candy : tabCandy,
				Out : TabOut
		};
		//Envoi du messgae de mis a jour du snake
		try{
			Gamers[y].ws.send(JSON.stringify(message));
		}
		//Fermeture du websocket lorsque le joueur ne recois pas le message. ( fermeture de connexion)
		catch(err){
			Gamers[y].ws.close();
		}
	}	
}

//Fonction update
function update(){
	//Boucle des gamer
	for(i=0;i<Gamers.length;i++){
		//Si les bordures sont activés ( sont a true)
		if(withBorder){
			//Si la tete du serpent du joueur i est endehors de l'écran, il a perdu.
			if(Gamers[i].Snake.Tableau[0].x>xecran||Gamers[i].Snake.Tableau[0].y>yecran||Gamers[i].Snake.Tableau[0].y<0||Gamers[i].Snake.Tableau[0].x<0){
				Gamers[i].loose();
			}
		}
		//Si le joueur i n'est pas éliminé
		if(!Gamers[i].isout){
			//Si le joueur i a mangé le bonbon, passer la variable eat a true;
			if(candy.eatCandy(Gamers[i])){
				console.log("eat");
				//Création d'un nouveau point aléatoire 
				var candypos = new Model.Point(Math.random() * 1200, Math.random() * 500);
				//Création d'un bonbon a la position du point candypos
				candy = new Model.Candy(candypos);
			}
		}
	}
	
	var maxLength=10;
	for(var x=0;x<Gamers.length;x++){
		if(Gamers[x].Snake.Tableau.length>maxLength){
			maxLength=Gamers[x].Snake.Tableau.length;
		}
	}

	for (var i = maxLength-1 ; i > 0 ; i--) {
		for(y=0;y<Gamers.length;y++){
			if(i<=Gamers[y].Snake.Tableau.length-1){
				if(!Gamers[y].isout){
					var ax= Gamers[y].Snake.Tableau[i-1].x;
					var ay= Gamers[y].Snake.Tableau[i-1].y;
	
					Gamers[y].Snake.Tableau[i].x= ax;
					Gamers[y].Snake.Tableau[i].y= ay;
				}
			}
		}
	}
	
	
	function norme(elemAx, elemAy, elemBx,elemBy) 
	{
		var x = (elemAx - elemBx);
		var y = (elemAy - elemBy);
		return Math.sqrt((x*x)+(y*y));
	}
	
	
	
	for(y=0;y<Gamers.length;y++){
		for(i=0;i<Gamers.length;i++){
			if(i!=y){
				var MyTete=Gamers[y].Snake.Tableau[0];
				for(x=0;x<Gamers[i].Snake.Tableau.length;x++){
					if(!Gamers[i].isout){
						var TabOther=Gamers[i].Snake.Tableau[x];
						if(norme(MyTete.x,MyTete.y,TabOther.x,TabOther.y)<11){
							Gamers[y].loose();
						}
					}
				}
			}
		}
	}
	


	for(y=0;y<Gamers.length;y++){
		if(Gamers[y].Tableau!=0){
			Gamers[y].Snake.Tableau[0].x += Gamers[y].nexttete[0];
			Gamers[y].Snake.Tableau[0].y += Gamers[y].nexttete[1];
		}
	}



	var TabSnake=[];
	var TabOut=[];
	
	for(i=0;i<Gamers.length;i++){
		if(Gamers[i].Tableau!=0){
			TabSnake.push(Gamers[i].Snake.Tableau);
			TabOut.push(Gamers[i].isout);
		}
	}

	var tabCandy=[];
	tabCandy.push(candy.pos.x);
	tabCandy.push(candy.pos.y);

	for(y=0;y<Gamers.length;y++){
		var message = { 
				type : "majsnake",
				Snake : TabSnake,
				index : y,
				Candy : tabCandy,
				Out : TabOut
		};
		try{
			Gamers[y].ws.send(JSON.stringify(message));
		}
		catch(err){
			Gamers[y].ws.close();
		}
	}
}










