var deckNumber = -1;
var deckID = 0;

function capital(s){//capitalise the word
   return s[0].toUpperCase() + s.slice(1);
}

// function addHover(imgClass){
//   var smallImages = document.querySelectorAll(imgClass);
//   smallImages.forEach(function(imgBox,place){ //loops through the list and sets the element to be "imgbox"
//       imgBox.addEventListener("mouseover", function(){
//          if(imgBox.innerHTML.trim() != "" && document.querySelector(".cardInfoDisplay.hide") !== null){
//             document.querySelector(".largeImage").innerHTML = imgBox.innerHTML;
//             //copy inner HTML to large image
//          }
//       })
//   })
// }
// addHover(".smallImage");
// addHover(".extraDeck .smallerImage");
// addHover(".sideDeck .smallerImage");


function searchDeck(direction){
   //direction: 1 if next deck, -1 if previous deck
   //POST something without refreshing (!!!)
   var xml = new XMLHttpRequest();
   xml.open("POST","./deckSearch",true);
   //when it sends data, send it to the route @/deckSearch
   xml.setRequestHeader("Content-type","application/x-www-form-urlencoded");



   var filters = {};
   //go through each input box, add its name and value to the filters
   document.querySelectorAll(".decks select, .decks input").forEach(function(option){
      if(option.value.trim()){
         filters[option.name]= option.value.trim();
      }
   })

   filters["number"] = deckNumber+direction;

   xml.send(JSON.stringify(filters));
   //send to back end
   xml.onload = function(){
      displayCards = JSON.parse(this.responseText);
      //what you get from Python, turn into JSON format
      document.querySelector(".likeDeck").innerHTML = "Like<br>Deck";
      if(displayCards["message"]=="No results!"){
         //empty the deck, disable the next button
         document.querySelector(".saveAs").classList.remove("enabled");
         document.querySelector(".likeDeck").classList.remove("enabled");
         document.querySelector(".previousDeck").classList.remove("enabled");
         document.querySelector(".nextDeck").classList.remove("enabled");

         document.querySelector(".likeCount").innerHTML = `Likes: 0`;
         document.querySelector(".deckCount").innerHTML = `Count: 0`;
         document.querySelector(".theDeck").innerHTML = "deck";
         document.querySelector(".theUser").innerHTML = "user";
         deckNumber = -1;
         deckID = 0;
         displayDeck([],".mainDeckRow .smallImage",[]);
         displayDeck([],".extraDeck .smallerImage",[]);
         displayDeck([],".sideDeck .smallerImage",[]);
         alertBox("No results");
         return;
      }
      deckNumber = displayCards["deckNumber"];

      //display the deck
      // deck["main"] = displayCards["main"];
      // deck["extra"] = displayCards["extra"];
      // deck["side"] = displayCards["side"];
      displayDeck(displayCards["main"],".mainDeckRow .smallImage",displayCards["limitedCards"]);
      displayDeck(displayCards["extra"],".extraDeck .smallerImage",displayCards["limitedCards"]);
      displayDeck(displayCards["side"],".sideDeck .smallerImage",displayCards["limitedCards"]);
      deckID = displayCards["ID"];
      document.querySelector(".deckCount").innerHTML = `Count: ${displayCards["main"].length}`;
      document.querySelector(".likeCount").innerHTML = `Likes: ${displayCards["likes"]}`;
      document.querySelector(".theDeck").innerHTML = displayCards["name"];
      document.querySelector(".theUser").innerHTML = `By: ${displayCards["user"]}`;
      document.querySelector(".likeDeck").classList.add("enabled");
      document.querySelector(".saveAs").classList.add("enabled");
      if(displayCards["liked"]){
         document.querySelector(".likeDeck").innerHTML = "Remove Like";
      }


      if(deckNumber == 0 || displayCards["message"] == "random"){//can't go back if it's the first/random
         document.querySelector(".previousDeck").classList.remove("enabled");
      }
      else{
         document.querySelector(".previousDeck").classList.add("enabled");
      }
      if(displayCards["message"]=="Last deck"){//if it's the last deck, can't go forwards
         document.querySelector(".nextDeck").classList.remove("enabled");
      }
      else{
         document.querySelector(".nextDeck").classList.add("enabled");
      }
   }
}

function saveAs(name){
   if(!name){
      alertBox("Invalid name");
      return;
   }
   //POST something without refreshing (!!!)
   var xml = new XMLHttpRequest();
   xml.open("POST","./savePublicDeck",true);
   //when it sends data, send it to the route @/savePublicDeck
   xml.setRequestHeader("Content-type","application/x-www-form-urlencoded");



   xml.send(JSON.stringify({"name":name,"ID":deckID}));
   //send to back end
   xml.onload = function(){
      response = JSON.parse(this.responseText);
      response.includes("saved successfully") ? alertBoxGreen(response) : alertBox(response);
      return
   }
}


function displayDeck(deck,identifier,limitedCards){
   document.querySelectorAll(identifier).forEach(function(box,place){
      box.innerHTML = ``;
      if(deck && place < deck.length){
         if(limitedCards[deck[place]]!==undefined){
            box.innerHTML += `<img src = "./static/images/backgrounds/limit${limitedCards[deck[place]]}.jpg" class = "groupSign">`;
            //if it is a restricted card, add the image for that
         }
         box.innerHTML += `<img src = "./static/images/smallImages/${deck[place]}.jpg" onmouseover = "largeImage(this)" onauxclick = "if(event.button==1){cardInfoDisplay(${deck[place]})}">`;
      }
   })
}

document.querySelector(".exportDeck").onclick = function(){
   if(this.classList.contains("enabled") && !this.innerHTML.includes("<a")){
      var xml = new XMLHttpRequest();
      xml.open("POST","./exportDeck",true);
      //when it sends data, send it to the route @/exportDeck
      xml.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      var sendInfo = {"main":displayCards["main"],"extra":displayCards["extra"],"side":displayCards["side"]};
      //just to remove alternate arts because those are not allowedS


      xml.send(JSON.stringify(sendInfo));

      xml.onload = function(){
         var deckList = JSON.parse(this.responseText);
         if(deckList == "error"){
            alertBox("error");
         }
         else{//add a link to download the deck, click it then remove it
            document.querySelector(".exportDeck").innerHTML += `<a
            href = data:text/plain;charset=utf-8,${encodeURIComponent(deckList)}
            download = "${document.querySelector(".theDeck").innerHTML.trim()}.ydk"
            style = "display:none;">`
            document.querySelector(".exportDeck a").click();
            document.querySelector(".exportDeck a").remove();
         }
      }
   }
}

document.querySelector(".search div").onclick = function(){
   deckNumber = -1;
   searchDeck(1);
}
document.querySelector(".nextDeck").onclick = function(){
   if(this.classList.contains("enabled")){
      //if hovering is a hand
      searchDeck(1);
   }
   else{
      alertBox("No more results!");
   }
}
document.querySelector(".previousDeck").onclick = function(){
   if(this.classList.contains("enabled")){
      searchDeck(-1);
   }
   else{
      alertBox("No previous results!");
   }
}
document.querySelector(".previousDeck").onmouseover = function(){
   if(this.style.cursor !== "pointer"){
      this.transform = "scale(1.1)";
   }
}
document.querySelector(".saveAs").onclick = function(){
   if(!this.classList.contains("enabled") || deckID == 0){
      alertBox("No deck to save!");
      return;
   }

   saveAs(prompt("Please name the deck").trim());
}

document.querySelector(".likeDeck").onclick = function(){
   var xml = new XMLHttpRequest();
   xml.open("POST","./likeDeck",true);
   //when it sends data, send it to the route @/likeDeck
   xml.setRequestHeader("Content-type","application/x-www-form-urlencoded");

   xml.send(JSON.stringify(deckID));
   //send to back end
   xml.onload = function(){
      response = JSON.parse(this.responseText);
      if(response[0] == 1){
         var likeCount =  document.querySelector(".likeCount")
         if(response[1] === "Deck Liked!"){
           likeCount.innerHTML = `Likes: ${parseInt(likeCount.innerHTML.split(" ")[1])+1}`;
            document.querySelector(".likeDeck").innerHTML = "Remove Like";
         }
         else{
           likeCount.innerHTML = `Likes: ${parseInt(likeCount.innerHTML.split(" ")[1])-1}`;
           document.querySelector(".likeDeck").innerHTML = "Like<br>Deck";
         }
         alertBoxGreen(response[1]);
      }
      else{
         alertBox(response[1]);
      }
   }
}

document.querySelectorAll(".decks select, .decks input").forEach(function(option){
   //if the search changes, remove next and previous deck so it knows that it has to
   //display the first result
   option.addEventListener("input",function(){
      document.querySelector(".nextDeck").classList.remove("enabled");
      document.querySelector(".previousDeck").classList.remove("enabled");
      deckNumber=-1;
   })
   option.onkeydown = function(e){
       if(e.keyCode == 13){
           searchDeck(1);
       }
   }
})

document.querySelector(".mainMenu").onclick = function(){
   var base_url = window.location.origin;
   window.location = `${base_url}/`;
}

document.querySelector(".largeImage").onclick = function(){
   if(this.innerHTML.trim() !== ""){
      cardInfoDisplay(this.innerHTML.split("smallImages/")[1].split(".jpg")[0]);
   }
}
document.querySelector(".cardInfoDisplay .close").onclick = function(){
   cardInfoDisplay(false);
}
searchDeck(1);