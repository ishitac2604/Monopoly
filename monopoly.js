window.onload = function() {
  //find dice role button and bind takeTurn method
  var rollButton = document.getElementById("rollButton");
  rollButton.onclick = Game.takeTurn;

  //initialize board
  Game.populateBoard();
};

//IIFE function to create game board object
var Game = (function() {

  class Queue{

      constructor(){
          this.items = [];
      }

      enqueue(element){
        this.items.push(element);
      }

      dequeue(){
        if(this.isEmpty())
            return "Underflow";
        return this.items.shift();
      }

      front(){
        if(this.isEmpty())
            return "No elements in Queue";
        return this.items[0];
      }

      isEmpty(){
        return this.items.length == 0;
      }

  }
  //create a game object to hold the game board squares, methods, players
  var game = {};

  //build an array of game propreties (calling them squares, as in squares on the game board, so
  //I don't confuse them with object properties
  //there are 11 properties on the game board.
  //each has a unique name and value, so each will probably need to be built individually (not through a loop)
  var end = false;
  game.squares = [
    new Square("Cairo", 100, "square2"),
    new Square("Havana", 150, "square4"),
    new Square("New Delhi", 400, "square5"),
    new Square("Paris", 300, "square7"),
    new Square("Riga", 550, "square8"),
    new Square("Singapore", 600, "square9"),
    new Square("Doha", 50, "square10"),
    new Square("Ankara", 120, "square12"),
    new Square("Washington DC", 800, "square13"),
    new Square("Vatican City", 350, "square14"),
    new Square("Hanoi", 100, "square15"),
    new Square("Seoul", 120, "square17"),
    new Square("Amsteram", 110, "square19"),
    new Square("Kuala Lumpur", 120, "square20")
  ];


  var chanceCards = new Queue();

  chanceCards.enqueue({id: 1, title: "You have a parking violation. Pay $200 fine"});
  chanceCards.enqueue({id: 2, title: "Advance to Go"});
  chanceCards.enqueue({id: 3, title: "It's your friend's birthday. Gift him $100"});
  chanceCards.enqueue({id: 4, title: "You have won a crossword competition. Collect $50"});


  var communityCards = new Queue();

  communityCards.enqueue({id: 1, title: "Doctor’s fee. Pay $50"});
  communityCards.enqueue({id: 2, title: "Pay School Fee of $100"});
  communityCards.enqueue({id: 3, title: "Income tax time. Pay $120"});
  communityCards.enqueue({id: 4, title: "Time to pay your crimes. Go to Jail"});
  //build an array of players
  //note: initial version of the game only allows two fixed players
  let player1Name = localStorage.getItem('u1');
  let player2Name = localStorage.getItem('u2');
  game.players = [
    new Player(player1Name,1200, "Triangle", "player1"),
    new Player(player2Name, 1200, "Circle", "player2")
  ];

  //set the game property for current player. Initially player 1. (Using an index of the game.players array.)
  game.currentPlayer = 0;
  updateByID("currentTurn", game.players[game.currentPlayer].name);
  //set up a method that will add the squares to the game board
  game.populateBoard = function() {
    //loop through all the squares in the game board
    for (var i = 0; i < this.squares.length; i++) {
      //get square ID from object and then find its div
      var id = this.squares[i].squareID;

      //add info to squares
      //paragraphs for square info preexist in HTML. That way they just have to be
      //updated here and I can use the same method to create and update
      var squareName = document.getElementById(id + "-name");
      var squareValue = document.getElementById(id + "-value");
      var squareOwner = document.getElementById(id + "-owner");

      squareName.innerHTML = this.squares[i].name;
      squareValue.innerHTML = "$" + this.squares[i].value;
      squareOwner.innerHTML = this.squares[i].owner;
    }

    //find the start square and add all players
    var square1 = document.getElementById("square1-residents");
    for (var i = 0; i < game.players.length; i++) {
      //using private function to create tokens
      game.players[i].createToken(square1);
    }

    //populate the info panel (using simple private function)
    updateByID("player1-info_name", game.players[0].name);
    updateByID("player1-info_cash", "Cash: " + game.players[0].cash);
    updateByID("player2-info_name", game.players[1].name);
    updateByID("player2-info_cash", "Cash: " + game.players[1].cash);
  };

  //public function to handle taking of turn. Should:
  //roll the dice
  //advance the player
  //call function to either allow purchase or charge rent
  game.takeTurn = function() {
    //roll dice and advance player
    movePlayer();
    checkTile();

    //check the tile the player landed on
    //if the tile is not owned, prompt player to buy
    //if the tile is owned, charge rent and move on

    //loss condition:
    //if current player drops below $0, they've lost
    var currentPlayer = game.currentPlayer;

    if (game.players[currentPlayer].cash <= 0){
      console.log(game.players[currentPlayer])
      game.players[currentPlayer].updateCash(0);
      setTimeout(function() {
  	     alert(game.players[currentPlayer].name + ", you lost the game! Press OK to restart");
       },10)

      window.location = "index.html";
    }else{
      console.log(game.players[currentPlayer])
      game.currentPlayer = nextPlayer(game.currentPlayer);
      updateByID("currentTurn", game.players[game.currentPlayer].name);
    }
  };

  //
  // function gameEnd(){
  //
  //   // alert(player + ", you lost the game! Press OK to restart");
  //   end = false;
  //   game.players[0].updateCash(1200);
  //   game.players[1].updateCash(1200);
  //   updateByID("messagePara","New Game");
  //   // updateByID("player1-info_cash", "Cash: " + game.players[0].cash);
  //   // updateByID("player2-info_cash", "Cash: " + game.players[1].cash);
  //   // changePosition(game.players[0],1);
  //   // changePosition(game.players[1],1);
  //   window.
  // }


  /****                    Game-level private functions                        *****/
  //function to advance to the next player, going back to to player 1 when necessary
  //(leaving this as a private function rather than method of Player because
  //current player is more of a game level property than a player level property)
  function nextPlayer(currentPlayer) {
    var nextPlayer = currentPlayer + 1;

    if (nextPlayer == game.players.length) {
      return 0;
    }

    return nextPlayer;
  }

  //function to "roll the dice" and advance the player to the appropriate square
  function movePlayer(){

      var die1 = Math.floor((Math.random() * 5) + 1);
      var die2 = Math.floor((Math.random() * 5) + 1);
      var img1 = "images/dice" + die1 + ".png";
      var img2 = "images/dice" + die2 + ".png";
      var moves = die1 + die2;
      document.getElementById('img1').setAttribute("src",img1);
      document.getElementById('img2').setAttribute("src",img2);

      //need the total number of squares, adding 1 because start isn't included in the squares array
      var totalSquares = 20;
      //get the current player and the square he's on
      var currentPlayer = game.players[game.currentPlayer];
      var currentSquare = parseInt(currentPlayer.currentSquare.slice(6));

      //figure out if the roll will put player past start. If so, reset and give money for passing start
      if (currentSquare + moves <= totalSquares) {
        var nextSquare = currentSquare + moves;
      }
      else {
        var nextSquare = currentSquare + moves - totalSquares;
        currentPlayer.updateCash(currentPlayer.cash + 100);
      }

      changePosition(currentPlayer, nextSquare);

  }

  function changePosition(currentPlayer, nextSquare){
    currentPlayer.currentSquare = "square" + nextSquare;

    //find and remove current player token
    var currentToken = document.getElementById(currentPlayer.id);
    currentToken.parentNode.removeChild(currentToken);

    //add player to next location
    currentPlayer.createToken(
      document.getElementById(currentPlayer.currentSquare)
    );
  }
  //function that checks the tile the player landed on and allows the player to act appropriately
  //(buy, pay rent, or move on if owned)
  function checkTile (){
    var currentPlayer = game.players[game.currentPlayer];
    var currentSquareId = currentPlayer.currentSquare;
    var currentSquareObj = game.squares.filter(function(square) {
      return square.squareID == currentSquareId;
    })[0];

    //check if the player landed on start
    if (currentSquareId == "square1") {
      currentPlayer.updateCash(currentPlayer.cash + 100);
      updateByID("messagePara",currentPlayer.name + ": You landed on start. Here's an extra $100");
    }

    else if(currentSquareId == "square3"){
      handleCommunityCard(currentPlayer);
    }

    else if(currentSquareId == "square6"){
      setTimeout(function(){
        alert("Jail Time. Pay $50");
      },100);

      updateByID("messagePara",currentPlayer.name + ": It's time to pay for your crimes");
      currentPlayer.updateCash(currentPlayer.cash-50);
    }

    else if(currentSquareId == "square11"){
      updateByID("messagePara",currentPlayer.name + ": Yay! You landed on free parking. Have some rest.");
    }

    else if(currentSquareId == "square16"){
      updateByID("messagePara", currentPlayer.name + ": Oh Ho! Time to go to jail.");
      setTimeout(function(){
        alert("Oh Ho! Time to go to jail. Pay $50");
        changePosition(currentPlayer, 6);
        currentPlayer.updateCash(currentPlayer.cash-50);
      },100);
    }

    else if(currentSquareId == "square18"){
      handleChanceCard(currentPlayer);
    }

    else if (currentSquareObj.owner == "For Sale") {
      //If the property is unowned, allow purchase:
      //check if owner can afford this square
      propertyForSale(currentPlayer,currentSquareObj)
    }

    else if (currentSquareObj.owner == currentPlayer.id) {
      //if property is owned by current player, continue
      updateByID(
        "messagePara",
        currentPlayer.name + ": You own this property. Thanks for visiting!"
      );
    }

    else {
      //charge rent
      updateByID("messagePara",currentPlayer.name + ": This property is owned by the other player" +
          ". You owe $" + currentSquareObj.rent + ". You now have $" + (currentPlayer.cash-currentSquareObj.rent));

      // var owner = game.players.filter(function(player) {
      //   return player.id == currentSquareObj.owner;
      // });
      currentPlayer.updateCash(currentPlayer.cash - currentSquareObj.rent);
    }



  }

  //function to update inner HTML based on element ID
  function updateByID(id, msg) {
    document.getElementById(id).innerHTML = msg;
  }

  function propertyForSale(player,currentSquareObj){
    if (player.cash <= currentSquareObj.value) {
      updateByID("messagePara", player.name + ": Sorry, you can't afford to purchase this property");
      return;
    }
    //prompt to buy tile
    var purchase;

    setTimeout(function() {
       purchase = window.confirm(
         player.name +
           ": This property is unowned. Would you like to purchase this property for $" +
           currentSquareObj.value +
           "?"
       );

       if (purchase) {
         //update ownder of current square
         currentSquareObj.owner = player.id;
         //update cash in the player object
         player.updateCash(player.cash - currentSquareObj.value);
         //log a message to the game board
         updateByID(
           "messagePara",
           player.name + ": You now have $" + player.cash
         );
         //update the owner listed on the board
         updateByID(
           currentSquareObj.squareID + "-owner",
           "Owner: " + player.name
         );
       }
     },100)

    //if player chooses to purchase, update properties:

  }

  function handleChanceCard(currentPlayer){
    var card1 = chanceCards.front();
    updateByID("messagePara", card1.title);

    if(card1.id == 1){
      currentPlayer.updateCash(currentPlayer.cash-200);
    }
    else if(card1.id == 2){
      setTimeout(function() {
        alert("Yay! You can advance to go. You get an extra $100")
      },100);

      changePosition(currentPlayer,1);
      currentPlayer.updateCash(currentPlayer.cash+100);
    }
    else if(card1.id == 3){
      currentPlayer.updateCash(currentPlayer.cash-100);
      if(currentPlayer.id == "player1"){
        game.players[1].updateCash(game.players[1].cash + 100);
      }else{
        game.players[0].updateCash(game.players[0].cash + 100);
      }
    }
    else{
      currentPlayer.updateCash(currentPlayer.cash+50);
    }

    chanceCards.dequeue();
    chanceCards.enqueue(card1);
  }

  function handleCommunityCard(currentPlayer){
    var card1 = communityCards.front();
    updateByID("messagePara", card1.title);

    if(card1.id == 1){
      currentPlayer.updateCash(currentPlayer.cash-50);
    }
    else if(card1.id == 2){
      currentPlayer.updateCash(currentPlayer.cash-100);
    }
    else if(card1.id == 3){
      currentPlayer.updateCash(currentPlayer.cash-120);
    }
    else{
      setTimeout(function() {
        alert("Jail Time. Pay $50");
       },100)

      changePosition(currentPlayer,6);
      currentPlayer.updateCah(currentPlayer.cash-50);
    }

    communityCards.dequeue();
    communityCards.enqueue(card1);
  }

  /****                       Constructor functions                             *****/


  /*constructor function for properties (game board squares)*/
  function Square(name, value, squareID) {
    //what is this property called?
    this.name = name;
    //what's the value/initial purchase price?
    this.value = value;
    //how much rent to charge when another player lands here? (30% of square value.)
    this.rent = value * 0.3;
    //where does this appear on the game board?
    this.squareID = squareID;
    //who owns the property? (initially unowned)
    this.owner = "For Sale";
  }

  /*constructor function for players*/
  function Player(name, cash, token, id) {
    this.name = name;
    this.cash = cash;
    this.token = token;
    this.id = id;
    this.currentSquare = "square1";
    this.ownedSquares = [];
  }

  //Add a method to create a player token span and add it to appropriate square
  //Adding it as a prototype of the Player constructor function
  Player.prototype.createToken = function(square) {
    var playerSpan = document.createElement("span");
    playerSpan.setAttribute("class", this.token);
    playerSpan.setAttribute("id", this.id);
    square.appendChild(playerSpan);
  };

  //method to update the amount of cash a player has
  Player.prototype.updateCash = function(amount) {
    document.getElementById(this.id + "-info_cash").innerHTML = "Cash: " + amount;
    this.cash = amount;
  };

  return game;
})();
