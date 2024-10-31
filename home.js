function removeDecks(deckOptions,remov){
   deckOptions.forEach(function(deck){
      remov ? deck.classList.add("hide") : deck.classList.toggle("hide");
   })
}
document.querySelector(".testArena .largeMenuBox").onclick = function(){
   var deckOptions = document.querySelectorAll(".testArenaList");
   if(deckOptions[0]==undefined){
      //no decks
      alertBox("Make a deck first");
      return;
   }
   removeDecks(deckOptions,false);
   var deckOptions = document.querySelectorAll(".chancesModeList");
   removeDecks(deckOptions,true);
}

document.querySelector(".chancesMode .largeMenuBox").onclick = function(){
   var deckOptions = document.querySelectorAll(".chancesModeList");
   if(deckOptions[0]==undefined){
      //no decks
      alertBox("Make a deck first");
      return;
   }
   removeDecks(deckOptions,false);
   var deckOptions = document.querySelectorAll(".testArenaList");
   removeDecks(deckOptions,true);
}
document.querySelectorAll(".testArenaList").forEach(function(deck){
   deck.onclick = function(){
      preLoadDeck("testArena",this.classList[0]);
      //if legal, send ID to the back end to be redirected
   }
   // deck.onmouseover = function(){
   //    document.querySelectorAll(".testArenaList").forEach(function(box){
   //       box.style = "transform:scale(1.02)";
   //    })
   // }
   // deck.onmouseout = function(){
   //    document.querySelectorAll(".testArenaList").forEach(function(box){
   //       box.style = "transform:none";
   //    })
   // }
})
document.querySelectorAll(".chancesModeList").forEach(function(deck){
   deck.onclick = function(){
      preLoadDeck("chancesMode",this.classList[0]);
      //if legal, send ID to the back end to be redirected
   }
})