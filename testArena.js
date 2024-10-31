var selectedCard = false;
var battlePos = "Atk";//battle position of where a card will move to.
var deckID = document.querySelector(".initialID").innerHTML;

document.querySelectorAll(".container").forEach(function(container){
   //for each "container" (deck, extra, gy, banish)
   container.onclick = function(){
      //close all other container displays and enable theirs
      closeDisplay(container.classList[0]);
      document.querySelector(`.${container.classList[0]}Cards`).classList.toggle("hide");
   }
})

function closeDisplay(selector){
   if(selector != "cardInfoDisplay"){
      document.querySelector(".cardInfoDisplay").classList.add("hide");
      if(selector){
         //if it is opening a container display, remove selection and associated options
         changeSelect(false);
         optionAppear("moveCard","",false);
      }
   }
   //close all pop up displays except the "selector" one
   var display = document.querySelector(`.containerDisplay:not(.${selector}Cards):not(.hide)`);

   if(display !== null){
      display.classList.add("hide");
   }
}

function addCard(id,type,loc,subtype){
   //add card of this ID, type = monster/spell/trap, to this location
   if(typeof loc === 'object'){
      //on the field - the location is identified by itself
      if(battlePos == "Set"){//display the back of the card
         loc.innerHTML+=`
         <img src="${window.location.origin}/static/images/backgrounds/cardBack.jpg" onmouseover = "largeImage(this)"  onclick = "select(this)" onauxclick = quickMove(this) class = "field${battlePos} ${id} ${type} ${subtype}">
         `;
      }
      else{
         loc.innerHTML+=`
         <img src="${window.location.origin}/static/images/smallImages/${id}.jpg" onmouseover = "largeImage(this)"  onclick = "select(this)" onauxclick = "if(event.button==1){cardInfoDisplay(${id})}else{quickMove(this)}" class = "field${battlePos} ${id} ${type} ${subtype}">
         `;
      }
   }
   else if(loc == "hand"){
      document.querySelector(".handContainer").innerHTML+=`<div class = "handDiv">
      <img src="${window.location.origin}/static/images/smallImages/${id}.jpg" onmouseover = "largeImage(this)"  onclick = "select(this)" onauxclick = "if(event.button==1){cardInfoDisplay(${id})}else{quickMove(this)}" class = "hand ${id} ${type} ${subtype}">
      </div>`;
   }
   else{
      //adding to a container
      document.querySelector(`.${loc}Cards span`).innerHTML = `<div class = "deckDiv">
      <img src = "${window.location.origin}/static/images/smallImages/${id}.jpg" onmouseover = "largeImage(this)"  onclick = "select(this)" onauxclick = "if(event.button==1){cardInfoDisplay(${id})}else{quickMove(this)}" class = "${loc} ${id} ${type} ${subtype}">
      </div>` + document.querySelector(`.${loc}Cards span`).innerHTML;
      containerUpdate(loc);
   }
}
function removeSelectedCard(){//do exactly that
   optionAppear("moveCard","",false);
   if(selectedCard.classList[0] == "hand"){
      selectedCard.closest(".handDiv").remove();//remove the card from the hand
   }
   else if(selectedCard.classList[0].includes("field")){
      var zone = selectedCard.closest(".zoneBorder");
      if(zone===null){
         //if it's from the field spel zone, the above statement misses
         zone = document.querySelector(".fieldSpell.zone");
      }
      selectedCard.remove();//remove the card from the field
      zone.classList.remove("lostCard");
      //"refresh" to make animation appear
      void document.querySelector(".wrapper").offsetWidth;
      zone.classList.add("lostCard");
   }
   else if(selectedCard.closest(".deckDiv")!==null){//remove from a container
      selectedCard.closest(".deckDiv").remove();
      containerUpdate(selectedCard.classList[0]);
   }
}
//add "reset" param
function getDeck(){
   //POST something without refreshing (!!!)
   var xml = new XMLHttpRequest();
   xml.open("POST","./testArenaGetDeck",true);
   //when it sends data, send it to the route @/testArenaGetDeck
   xml.setRequestHeader("Content-type","application/x-www-form-urlencoded");

   xml.send(JSON.stringify(deckID));
   //deck ID
   xml.onload = function(){
      var response = JSON.parse(this.responseText);
      //store where cards are located (may be redundant later)
      var main = response["main"];
      var extra = response["extra"];
      types = response["types"];
      subtypes = response["subtypes"];
      if(main){
         for(var x = 0;x < main.length;x ++){
            addCard(main[x],types[main[x]],"deck",subtypes[main[x]]);
         }
      }
      if(extra){//same for extra
         for(var x = 0;x < extra.length;x ++){
            addCard(extra[x],"extraMonster","extra",subtypes[extra[x]]);
         }
      }
      for(var x = 0;x < 5; x++){//draw five cards
         draw("hand",false,true);
      }
      var empties = document.querySelectorAll(".zoneBorder.lostCard,.fieldSpell.lostCard");
      if(empties){
         empties.forEach(function(box){
            box.classList.remove("lostCard");
         })
         void document.querySelector(".wrapper").offsetWidth;
         empties.forEach(function(box){
            box.classList.add("lostCard");
         })
      }

   }
}
function shuffle(){
   //POST something without refreshing (!!!)
   var xml = new XMLHttpRequest();
   xml.open("POST","./testArenaShuffle",true);
   //when it sends data, send it to the route @/testArenaShuffle
   xml.setRequestHeader("Content-type","application/x-www-form-urlencoded");
   var ids = []
   document.querySelectorAll(".deckCards span .deckDiv img").forEach(function(box){
      //for each card in the deck, add it's id to the list
      ids.push(box.classList[1]);
   })
   xml.send(JSON.stringify(ids));

   xml.onload = function(){
      var response = JSON.parse(this.responseText);
      document.querySelector(".deckCards span").innerHTML="";
      for(var x = 0;x < response.length;x ++){
         addCard(response[x],types[response[x]],"deck",subtypes[response[x]]);
         //add each card back to the deck
      }
   }
}
function changeSelect(card){
   //just clicked card; change the selected card to be that one,
   //or remove the select if it was selected
   //true means the card is now selected; false means it is not
   //false means a forced deselect
                                 //field is whether we are making zones appear on the field, in which case those should not be removed
                                 // if(!field)
   var selectedZones = document.querySelectorAll(".selectedZone");
   if(selectedZones){
      selectedZones.forEach(function(box){
         box.classList.remove("selectedZone");
      })
   }

   if(card == false){
      if(selectedCard){
         selectedCard.classList.remove("selected");
         selectedCard.style = "box-shadow:none;animation: none;";
      }
      selectedCard = false;
      return false;
   }

   if(selectedCard == card){
      //clicking it again to cancel
      selectedCard.style = "box-shadow:none;animation: none;";

         card.classList.remove("selected");
      selectedCard = false;
      return false;
   }
   if(selectedCard){
      //deselect the currently selected one
      selectedCard.style = "box-shadow:none;animation: none;";

         selectedCard.classList.remove("selected");
   }
   card.classList.add("selected");
   selectedCard = card;
   return true;
}

function optionAppear(loc,type,add,pend=false){
   //loc = the location of the selected card, e.g "hand", "gy"
   //type = monster,spell,trap or extra
   //add true if the card was just selected
   if(add){
      document.querySelectorAll(`.moveCardContainer.hide .${loc}.${type}`).forEach(function(box){
         //all options that are hide and correspond to the location

         // if(box.name !== "scale" || pend){
            box.closest(".moveCardContainer").classList.remove("hide");
         // }
      })
      document.querySelectorAll(`.moveCardContainer :not(.${loc}.${type})`).forEach(function(box){
         //all options that are not hide, but should be because they do not correspond to the location
         box.closest(".moveCardContainer").classList.add("hide");
      })
      if(pend===true){
         document.querySelector(".scale").closest(".moveCardCOntainer").classList.remove("hide");
      }
   }
   else{
      document.querySelectorAll(`.moveCardContainer`).forEach(function(box){
         //if removing select, hide all options that are not hide
         box.closest(".moveCardContainer").classList.add("hide");
      })
   }
}

function select(card){
   //card.closest(".hand") -> hand div that contains it
   largeImage(card);
   if(card.closest(".deckDiv") == null){
      closeDisplay("");
   }
   optionAppear(card.classList[0],card.classList[2] ,changeSelect(card),card.classList[3] == "pendulum");
}

function draw(loc,banishFd = false, ignore = false){//or mill or banish
   if(selectedCard && selectedCard.classList[0] == "deck"){
      changeSelect(false);
      optionAppear("moveCard","",false);
      //changing the deck so deselect it
   }
   var card = document.querySelectorAll(".deckCards span .deckDiv img")[0];
   if(card){//if there are cards in deck
      if(loc == "hand"){
         if(document.querySelectorAll(".handDiv").length == 10){
            alertBox("Hand full!");
            return;
         }
      }
      if(banishFd == false){
         addCard(card.classList[1],card.classList[2],loc,card.classList[3]);
      }
      else{
         document.querySelector(`.banishedCards span`).innerHTML = `<div class = "deckDiv">
         <img src = "${window.location.origin}/static/images/backgrounds/cardBack.jpg" onmouseover = "largeImage(this)"  onclick = "select(this)" onauxclick = "if(event.button==1){cardInfoDisplay(${card.classList[1]})}else{quickMove(this)}" class = "banished ${card.classList[1]} ${card.classList[2]} ${card.classList[3]} ">
         </div>` + document.querySelector(`.banishedCards span`).innerHTML;
         //set image of card to be the card back
         containerUpdate("banished");
      }
      card.closest(".deckDiv").remove();
      containerUpdate("deck");
   }
   else if(!ignore){
      alertBox("No cards in deck!");
   }
}

function placefield(){
   document.querySelector(".moveCard[name=cancel]").closest(".moveCardContainer").classList.remove("hide");
   //make cancel appear
   closeDisplay("");
   var type = selectedCard.classList[2];

   if(selectedCard.classList[0] == `field${battlePos}`){
      var boxList = document.querySelectorAll(".row .zone .zoneBorder, .fieldSpell");
   }


   else if(type == "monster"){
      if(battlePos == "Pend"){
         battlePos = "Atk";
         var boxList = [document.querySelectorAll(".zoneBorder")[17],document.querySelectorAll(".zoneBorder")[21]];
      }
      else{
         var boxList = document.querySelectorAll(".row:not(.opp) .monster.zone .zoneBorder");
      }
   }
   else if(type == "extraMonster"){
      var boxList = document.querySelectorAll(".row:not(.opp) .monster.zone .zoneBorder, .row .em.zone .zoneBorder");
   }
   else if(type == "spell" || type == "trap"){
      var boxList = document.querySelectorAll(".row:not(.opp) .st.zone .zoneBorder,.fieldSpell.zone");
   }
   boxList.forEach(function(box){
      if(!box.innerHTML.trim()){
         box.classList.remove("lostCard");
         box.classList.add("selectedZone");
         //highligh all of the zones
      }
   })
}



function containerUpdate(selector){
   //if a card leaves the gy/banished/deck/ed, updates the image
   var topCard = document.querySelector(`.${selector}Cards .deckDiv img`);
   var container = document.querySelector(`.${selector}.container`);
   if(topCard == undefined){//no cards in gy
      container.innerHTML="";
      container.classList.remove("lostCard");
      void container.offsetWidth;
      container.classList.add("lostCard");
   }
   else if(selector == "gy" || selector == "banished"){//display the new top card
      var num = document.querySelectorAll(`.${selector}Cards .deckDiv`).length/80;
      //number of cards in the container
      container.innerHTML=`<img class = "deckMove" src = "${topCard.src}"
      style = "box-shadow:${2*num}vh ${num}vh ${num}vh ${1.4*num}vh rgba(30,20,10,0.6)">`;
      //more cards = bigger shadow
   }
   else{
      var num = document.querySelectorAll(`.${selector}Cards .deckDiv`).length/160;
      container.innerHTML=`<img class = "deckMove" src = "${window.location.origin}/static/images/backgrounds/cardBack.jpg"
      style = "box-shadow:${2*num}vh ${num}vh ${num}vh ${1.4*num}vh rgba(30,20,10,0.6)">`;
   }
}


function quickMove(card){
   if(selectedCard!==card){
      select(card);//make sure it's selected for the below functions to work
   }
   if(card.classList[0] == "deck"){//add to hand
      returnToHand();
   }
   else if(card.classList[0].includes("field")){//send to the GY
      addCard(card.classList[1],card.classList[2],"gy",card.classList[3]);
      removeSelectedCard();
   }
   else{//from hand/container: summon/activate
      if(spaceCheck(card.classList[2])){
      optionAppear("moveCard","",false);//remove other options
      card.classList[2] == "trap" ? battlePos = "Set" : battlePos = "Atk";
      placefield();
      }
   }
}


function spaceCheck(cardType,move=false){
   cardType = {"monster":"monster","spell":"st","trap":"st","extraMonster":"em"}[cardType];
   // alertBox(`${move?"":".row:not(.opp)"} .${cardType}.zone .zoneBorder:not(:has(img))`)
   if(document.querySelector(`${move?"":`.row:not(.opp) .${cardType}.zone`} .zoneBorder:not(:has(img))`) === null){
      alertBox("No zones!");
      return false;
   }
   return true;
}
function returnToHand(){
   if(document.querySelectorAll(".handDiv").length == 10){
      alertBox("Hand full!");
      return;
   }
   addCard(selectedCard.classList[1],selectedCard.classList[2],"hand",selectedCard.classList[3]);
   removeSelectedCard();
}

document.querySelectorAll(".zoneBorder, .fieldSpell").forEach(function(box){
   box.onclick = function(){
      if(this.classList.contains("selectedZone")){
         addCard(selectedCard.classList[1],selectedCard.classList[2],this,selectedCard.classList[3]);
         removeSelectedCard();
         changeSelect(false);//remove the borders from the zones
         document.querySelector(".moveCard[name=cancel]").closest(".moveCardContainer").classList.add("hide");
         //hide the "cancel" button
      }
   }
})
document.querySelector(".moveCard[name=cancel]").onclick = function(){//cancel after zones appear
   optionAppear("moveCard","",false);
   //make the options for the selected card appear
   changeSelect(false);//remove the borders from the zones
}
document.querySelector(".moveCard[name=toGy]").onclick = function(){
   addCard(selectedCard.classList[1],selectedCard.classList[2],"gy",selectedCard.classList[3]);
   //add card to the front of the GY
   //see the top card of the GY
   removeSelectedCard();
   //changeSelect(false);
}
document.querySelector(".moveCard[name=banish]").onclick = function(){
   addCard(selectedCard.classList[1],selectedCard.classList[2],"banished",selectedCard.classList[3]);
   //add card to the front of banished
   removeSelectedCard();
   //changeSelect(false);
}
document.querySelector(".moveCard[name=banishFd]").onclick = function(){
   document.querySelector(`.banishedCards span`).innerHTML = `<div class = "deckDiv">
   <img src = "${window.location.origin}/static/images/backgrounds/cardBack.jpg" onmouseover = "largeImage(this)"  onclick = "select(this)" onauxclick = "if(event.button==1){cardInfoDisplay(${selectedCard.classList[1]})}else{quickMove(this)}" class = "banished ${selectedCard.classList[1]} ${selectedCard.classList[2]} ${selectedCard.classList[3]}">
   </div>` + document.querySelector(`.banishedCards span`).innerHTML;
   //set image of card to be the card back
   containerUpdate("banished");
   removeSelectedCard();
}
document.querySelector(".moveCard[name=summonAtk]").onclick = function(){
   if(spaceCheck(selectedCard.classList[2])){
   optionAppear("moveCard","",false);//remove other options
   battlePos = "Atk";
   placefield();
   }
}
document.querySelector(".moveCard[name=summonDef]").onclick = function(){
   if(spaceCheck(selectedCard.classList[2])){
   optionAppear("moveCard","",false);//remove other options
   battlePos = "Def";
   placefield();
   }
}
document.querySelector(".moveCard[name=scale]").onclick = function(){
   if(document.querySelectorAll(".zoneBorder")[17].innerHTML.trim() == "" || document.querySelectorAll(".zoneBorder")[21].innerHTML.trim() == ""){
      optionAppear("moveCard","",false);//remove other options
      battlePos = "Pend";
      placefield();
   }
   else{
      alertBox("No zones!");
   }
}
document.querySelector(".moveCard[name=activate]").onclick = function(){
   if(spaceCheck(selectedCard.classList[2])){
   optionAppear("moveCard","",false);//remove other options
   battlePos = "Atk";
   placefield();
   }
}
document.querySelector(".moveCard[name=move]").onclick = function(){
   if(spaceCheck(selectedCard.classList[2],true)){
   optionAppear("moveCard","",false);//remove other options
   battlePos = selectedCard.classList[0].split("field")[1];//retain the batlte position
   placefield();
   }
}

document.querySelector(".moveCard[name=set]").onclick = function(){//for all card types
   if(spaceCheck(selectedCard.classList[2])){
   optionAppear("moveCard","",false);//remove other options
   battlePos = "Set";
   placefield();
   }
}

document.querySelector(".moveCard[name=toDeck]").onclick = function(){
   addCard(selectedCard.classList[1],selectedCard.classList[2],"deck",selectedCard.classList[3]);
   containerUpdate("deck");
   //add the card to the top of the deck
   removeSelectedCard();
}

document.querySelector(".moveCard[name=returnToHand]").onclick = function(){
   returnToHand();
}
document.querySelector(".moveCard[name=addToHand]").onclick = function(){
   returnToHand();
}
document.querySelector(".moveCard[name=toExtraDeck]").onclick = function(){
   addCard(selectedCard.classList[1],selectedCard.classList[2],"extra",selectedCard.classList[3]);
   containerUpdate("extra");
   removeSelectedCard();
}
document.querySelector(".moveCard[name=toDef]").onclick = function(){
   var temp = [selectedCard.classList,selectedCard.closest(".zoneBorder")];
   //remove card then replace it with the other battle position
   removeSelectedCard();
   temp[1].classList.remove("lostCard");
   battlePos = "Def";
   addCard(temp[0][1],temp[0][2],temp[1],temp[0][3]);
}
document.querySelector(".moveCard[name=toAtk]").onclick = function(){
   var temp = [selectedCard.classList,selectedCard.closest(".zoneBorder")];
   removeSelectedCard();
   temp[1].classList.remove("lostCard");
   battlePos = "Atk";
   addCard(temp[0][1],temp[0][2],temp[1],temp[0][3]);
}
document.querySelector(".moveCard[name=setF]").onclick = function(){
   var temp = [selectedCard.classList,selectedCard.closest(".zoneBorder")];
   removeSelectedCard();
   temp[1].classList.remove("lostCard");
   battlePos = "Set";
   addCard(temp[0][1],temp[0][2],temp[1],temp[0][3]);
}
document.querySelector(".moveCard[name=flip]").onclick = function(){
   var temp = [selectedCard.classList,selectedCard.closest(".zoneBorder")];
   removeSelectedCard();
   //remove card then add it back in to trigger animation
   void document.querySelector(".wrapper").offsetWidth;
   battlePos = "Atk";
   addCard(temp[0][1],temp[0][2],temp[1],temp[0][3]);
}

document.querySelector(".topLeftOption div[name=draw]").onclick = function(){
   if(selectedCard && selectedCard.classList[0] == "deck"){
      changeSelect(false);
      optionAppear("moveCard","",false);
      //changing the deck so deselect it
   }
   closeDisplay("");
   draw("hand");
}
document.querySelector(".topLeftOption div[name=shuffle]").onclick = function(){
   if(selectedCard && selectedCard.classList[0] == "deck"){
      changeSelect(false);
      optionAppear("moveCard","",false);
      //changing the deck so deselect it
   }
   closeDisplay("");
   shuffle();
}
document.querySelector(".topLeftOption div[name=reset]").onclick = function(){
   optionAppear("moveCard","",false);
   changeSelect(false);
   closeDisplay("");
   document.querySelector(".handContainer").innerHTML = "";
   document.querySelectorAll(".container.banished,.container.gy,.zoneBorder,.fieldSpell").forEach(function(box){
      //reset everything

      box.classList.remove("lostCard");
      if(box.innerHTML.trim() !== ""){
         box.classList.add("lostCard");
      }
   })
   document.querySelectorAll(".containerDisplay span,.container,.zoneBorder,.fieldSpell").forEach(function(box){
      //reset everything
      box.innerHTML = "";
   })

   getDeck();
}
document.querySelector(".topLeftOption div[name=mill]").onclick = function(){
   draw("gy");
}
document.querySelector(".topLeftOption div[name=banishTop]").onclick = function(){
   draw("banished");
}
document.querySelector(".topLeftOption div[name=banishTopFd]").onclick = function(){
   draw("banished",true);
}

document.querySelector(".mainMenu").onclick = function(){
   window.location = `${window.location.origin}/`;
}

document.querySelector(".largeImage").onclick = function(){
   if(this.innerHTML.trim() !== ""){
      cardInfoDisplay(this.innerHTML.split("smallImages/")[1].split(".jpg")[0]);
   }
}
document.querySelector(".cardInfoDisplay .close").onclick = function(){
   cardInfoDisplay(false);
}
getDeck();