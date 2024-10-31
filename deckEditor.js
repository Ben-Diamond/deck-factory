var mainDeck = [];
var extraDeck = [];
var sideDeck = [];
var deckID = document.querySelector(".initialID").innerHTML;
var limitedCards = {};


function displayDeck(identifier,deck,check=false){
   //identifier e.g ".mainDeckRow .smallImage"
   //deck, a list of IDs
   document.querySelector(".saveDeck").innerHTML = "Save<br>Deck";
   document.querySelector(".saveDeck").classList.remove("saved");
   document.querySelector(".publishDeck").classList.remove("enabled");

   // if(mainDeck.length==0){
   //    document.querySelector(".chancesMode").style.cursor = "auto";
   // }
   // else{
   //    document.querySelector(".chancesMode").style.cursor = "pointer";
   // }
   var imageBoxes = document.querySelectorAll(identifier);
   for(var i = 0; i < imageBoxes.length; i++){
      imageBoxes[i].innerHTML = ``;
      //still empty the div either way

      if(i < deck.length){
         // if(check){
         //    fetch(`${window.location.origin}/cards/${deck[i]}`,{method:"GET",headers:{}}).then(response => response.json()).then(card => {
         //       var limit = card.limit;
         //       if(limit<3){
         //          alertBox(limit)
         //          limitedCards[deck[i]] = limit;
         //          // alertBox(limitedCards);
         //             //if the card has a restriction like different format or banned
         //          imageBoxes[i].innerHTML += `<img src = "./static/images/backgrounds/limit${limit}.jpg" class = "groupSign">`;
         //       }
         //       imageBoxes[i].innerHTML += `<img src = "./static/images/smallImages/${deck[i]}.jpg" onmouseover = "largeImage(this)" onauxclick = "if(event.button==1){cardInfoDisplay(${deck[i]})}">`;

         //    })}
         // else{
         var limit = limitedCards[deck[i]];

         if(limit !== undefined){
            //if the card has a restriction like different format or banned
            imageBoxes[i].innerHTML += `<img src = "./static/images/backgrounds/limit${limit}.jpg" class = "groupSign">`;
         }
         //if there is a card, put it there
         imageBoxes[i].innerHTML += `<img src = "./static/images/smallImages/${deck[i]}.jpg" onmouseover = "largeImage(this)" onauxclick = "if(event.button==1){cardInfoDisplay(${deck[i]})}">`;
         // }
      }
   }
   if(identifier.includes("smallImage")){
      document.querySelector(".deckCount").innerHTML = `Count: ${deck.length}`;
      if(deck.length == 0){
         document.querySelector(".exportDeck").classList.remove("enabled");
      }
   }
   // document.querySelector(".exportDeck").classList.add("enabled");
}

document.querySelector(".switchDeck").onclick = function(){
   document.querySelector(".deckOptions").classList.toggle("hide");
}

function deckOptionsAddClick(){
   document.querySelectorAll(".deckOptions div").forEach(function(deckOption){
      deckOption.onclick = function(){

         //when the user selects a deck, remove the drop down menu and perform the below function
         document.querySelector(".deckOptions").classList.toggle("hide");

         if(deckOption.classList[0] != deckID){
            checkSave(deckOption.classList[0],"Name and save new deck before switching?","Save the deck before switching?");



            //set the bottom right display to say the name
         }
      }
   })
}

deckOptionsAddClick();
function switchDeck(){
   //alertBox("switching to "+deckID);
   if(deckID == 0){
      mainDeck = [];
      extraDeck = [];
      sideDeck = [];
      displayDeck(".mainDeckRow .smallImage",[]);
      displayDeck(".extraDeck .smallerImage",[]);
      displayDeck(".sideDeck .smallerImage",[]);
      document.querySelector(".deckName").classList.remove("illegal");
      document.querySelector(".saveDeck").innerHTML = "Deck Saved!";
      document.querySelector(".saveDeck").classList.add("saved");
      document.querySelector(".deckName").innerHTML = "New deck";
      document.querySelector(".deleteDeck").classList.remove("enabled");
      document.querySelector(".exportDeck").classList.remove("enabled");
      return;
   }
   //POST deck id to front end, receive the cards in that deck
   var xml = new XMLHttpRequest();
   xml.open("POST","./deckEditorSwitchDeck",true);
   //when it sends data, send it to the route @/deckEditorSwitchDeck
   xml.setRequestHeader("Content-type","application/x-www-form-urlencoded");

   xml.onload = function(){
      var deckList = JSON.parse(this.responseText);
      //what you get from Python, turn into JSON format
      //main is a list, extra is a list, side is a list
      if(deckList == "error"){
         alertBox("Deck does not match user");
         return;
      }
      mainDeck = deckList["main"];
      extraDeck = deckList["extra"];
      sideDeck = deckList["side"];
      for(var c in deckList["limitedCards"]){
         limitedCards[c] = deckList["limitedCards"][c];
      }
      displayDeck(".mainDeckRow .smallImage",mainDeck);
      displayDeck(".extraDeck .smallerImage",extraDeck);
      displayDeck(".sideDeck .smallerImage",sideDeck);
      document.querySelector(".exportDeck").classList.add("enabled");

      if(!deckList["legal"]){
         document.querySelector(".deckName").classList.add("illegal");
      }
      else{
         document.querySelector(".deckName").classList.remove("illegal");
      }
      document.querySelector(".deckName").innerHTML = document.querySelector(".deckOptions div."+CSS.escape(deckID)).innerHTML;
      document.querySelector(".saveDeck").innerHTML = "Deck Saved!";
      document.querySelector(".saveDeck").classList.add("saved");
      //IF deck is not published
      document.querySelector(".publishDeck").classList.add("enabled");

      document.querySelector(".deleteDeck").classList.add("enabled");

   }
   xml.send(JSON.stringify(deckID));
   //send to back end
}



const filterOptions = {
   "subtype":{
      "monster":["normal","effect","ritual","fusion","synchro","xyz","link","pendulum","gemini","toon","spirit","tuner","union","flip"],
      "spell":["normal","continuous","quick-play","field","ritual","equip"],
      "trap":["normal","continuous","counter"]
      //e.g monster cards have subtypes normal,effect...
   },
   "type":{
      "monster":["aqua","beast","beast-warrior","cyberse","dinosaur","divine-beast","dragon","fairy",
      "fiend","fish","insect","machine","plant","psychic","pyro","reptile","rock","sea serpent",
      "spellcaster","thunder","warrior","winged beast","wyrm","zombie"]
      //only monsters have the following types
   },
   "attribute":{
      "monster":["LIGHT","DARK","EARTH","WIND","WATER","FIRE","DIVINE"]
   },
   // "ability":{
   //    "monster":["gemini","toon","spirit","tuner","union"]
   // },
   "level":{
      "monster":["1","2","3","4","5","6","7","8","9","10","11","12","13"]
   }
}

function addFilters(filterOptions,cardType){
   document.querySelector(".filters [name=cardType]").value = cardType;

   for(var x = 0; x < 4;x ++){
      if(document.querySelectorAll(".cardType")[x].innerHTML.toLowerCase() == cardType){
         //find the button you clicked
         document.querySelectorAll(".cardType")[x].style.backgroundColor = "#FFFFFF"; //change it to white
      }
      else{
         document.querySelectorAll(".cardType")[x].style.backgroundColor = "#FFFFFF99"; //change others to grey
      }
   }

   //adds all the correct drop down options for searches depending on if it's a monster, spell or trap
   for(var filter in filterOptions){
      var options = filterOptions[filter];
      //an object e.g "subtype:{...}"


      document.querySelector(".filters select[name="+ filter + "]").innerHTML =
      `<option value = ${filter} selected> ${capital(filter)}</option>`;

      //chooses the 'select' element (drop down menu) where the name is the same as the filter e.g "type"
      //sets the drop down menu to its default e.g "Subtype" and capitalises it

      if(cardType in options){
         document.querySelector(".filters select[name="+ filter + "]").disabled=false;
         //options["cardType"] is a list like ["normal","effect"...]
         //enable use of the drop down menu because it applies

         for(var option in options[cardType]){
            //option is 0,1...
            document.querySelector(".filters select[name="+ filter + "]").innerHTML +=
            "<option value = " + options[cardType][option].replace(" ","_") + ">" +
            capital(options[cardType][option])+"</option>";
         }
         //iterates through each option e.g "normal" or "effect" , capitalises it and adds an option for it
      }
      else{
         document.querySelector(".filters select[name="+ filter + "]").disabled=true;
         //if the filter is not applicable to the card type, make it unable to change
      }
   }

   if(cardType == "monster"){
      document.querySelector(".filters input[name=atk]").disabled=false;
      document.querySelector(".filters input[name=def]").disabled=false;
      //only let "monster" cards use atk and def
   }
   else{
      document.querySelector(".filters input[name=atk]").disabled=true;
      document.querySelector(".filters input[name=atk]").value ="";
      document.querySelector(".filters input[name=def]").disabled=true;
      document.querySelector(".filters input[name=def]").value ="";
   }
}

addFilters(filterOptions,"all");

document.querySelectorAll(".cardType").forEach(function(box){
   box.onclick = function(){
   addFilters(filterOptions,box.innerHTML.toLowerCase());
   sendFilters(1);
   }
})

function addClickAndHover(imgClass){
   smallImages = document.querySelectorAll(imgClass);
   smallImages.forEach(function(imgBox,place){ //loops through the list and sets the element to be "imgbox"
    //   imgBox.addEventListener("mouseover", function(){
    //      if(imgBox.innerHTML.trim() != "" && document.querySelector(".cardInfoDisplay.hide") !== null){
    //         document.querySelector(".largeImage").innerHTML = imgBox.innerHTML;
    //         //copy inner HTML to large image
    //      }
    //   })

      if(imgClass == ".resultImage"){
         imgBox.addEventListener("auxclick",function(e){
            if(imgBox.innerHTML.trim() != ""){
            if(e.button == 2){
               e.preventDefault();
               //RIGHT CLICK add to side deck
               var imageID = imgBox.innerHTML.split("/smallImages/")[1].split(".")[0];
               //takes the <img src=/static/.../ID.jpg> and removes everything before and after the ID

               if(sideDeck.length < 15){
                     document.querySelector(".saveDeck").innerHTML = "Save<br>Deck";
                     document.querySelector(".saveDeck").classList.remove("saved");
                     document.querySelector(".publishDeck").classList.remove("enabled");
                     //add card to side deck
                     var count = mainDeck.filter(x => x == imageID).length + extraDeck.filter(x => x == imageID).length + sideDeck.filter(x => x == imageID).length;
                     //how many times that card appears in the main, side and extra deck
                     if(count < 3){
                        sideDeck.push(imageID);
                        //add to side deck
                        document.querySelectorAll(".sideDeck .smallerImage")[sideDeck.length-1].innerHTML = imgBox.innerHTML;
                        //add image to display

                     }
                     else{alertBox("Too many of this card!");}

               }
               else{alertBox("Side deck full!");}
            }
            else if(e.button == 1){//maybe use later
               // cardInfoDisplay(this.innerHTML.split("smallImages/")[1].split(".jpg")[0]);
               e.preventDefault();
            }}
         })
         imgBox.onclick = function(){
            //click add to MAIN DECK or EXTRA DECK (card dependant)
            if(imgBox.innerHTML.trim() != ""){
            var imageID = imgBox.innerHTML.split("/smallImages/")[1].split(".")[0];
            //takes the <img src=...ID.jpg> and removes everything before and after the ID
            var count = mainDeck.filter(x => x == imageID).length + extraDeck.filter(x => x == imageID).length + sideDeck.filter(x => x == imageID).length;
            //how many times that card appears in the main, side and extra deck
            if(count < 3){
               //it is allowed to be added
               fetch(`./cards/${imageID}`,{method:"GET",headers:{}}).then(response => response.json()).then(body => {
                  if(body["subtype"]!= undefined){
                     if(body["subtype"].includes("synchro") || body["subtype"].includes("xyz") || body["subtype"].includes("link") || body["subtype"].includes("fusion")){
                        //belongs in extra deck
                        if(extraDeck.length < 15){
                           extraDeck.push(imageID);
                           //add to extra deck
                           document.querySelectorAll(".extraDeck .smallerImage")[extraDeck.length-1].innerHTML = imgBox.innerHTML;
                           //add image to display
                           document.querySelector(".saveDeck").innerHTML = "Save<br>Deck";
                           document.querySelector(".saveDeck").classList.remove("saved");
                           document.querySelector(".publishDeck").classList.remove("enabled");

                        }
                        else{alertBox("Extra deck full!");}
                        return;
                     }
                  }
                  //belongs in the main deck
                  if(mainDeck.length < 60){
                     mainDeck.push(imageID);
                     //add to main deck
                     document.querySelectorAll(".mainDeckRow .smallImage")[mainDeck.length-1].innerHTML = imgBox.innerHTML;
                     //add image to display
                     document.querySelector(".saveDeck").innerHTML = "Save<br>Deck";

                     document.querySelector(".saveDeck").classList.remove("saved");
                     document.querySelector(".publishDeck").classList.remove("enabled");
                     document.querySelector(".deckCount").innerHTML = `Count: ${mainDeck.length}`;
                     document.querySelector(".exportDeck").classList.add("enabled");

                  }
                  else{alertBox("Main deck full!");}

               })
            }
            else{alertBox("Too many of this card!");}
         }}
      }
      else if(imgClass == ".smallImage"){
         //if they click on a card from main deck
         imgBox.onclick = function(){
            if(imgBox.innerHTML.trim() != ""){
               mainDeck.splice(place,1);
               //remove the element
               displayDeck(imgClass,mainDeck);
               //update display
            }}

         imgBox.addEventListener("auxclick",function(e){
            if(imgBox.innerHTML.trim() != ""){
               if(e.button == 2){
                  //right click - go FROM MAIN DECK TO SIDE DECK
                  e.preventDefault();
                  if(sideDeck.length<15){
                     var imageID = imgBox.innerHTML.split("/smallImages/")[1].split(".")[0]; //need this to add to side deck
                     sideDeck.push(imageID);
                     //add to side deck
                     document.querySelectorAll(".sideDeck .smallerImage")[sideDeck.length-1].innerHTML = imgBox.innerHTML;

                     //still remove from main deck as above
                     mainDeck.splice(place,1);
                     displayDeck(imgClass,mainDeck);
                  }
                  else{alertBox("Side deck full!");}

               }
               else if(e.button == 1){//maybe use later
                  // cardInfoDisplay(this.innerHTML.split("smallImages/")[1].split(".jpg")[0]);
                  e.preventDefault();
               }
            }})
      }
      else if(document.querySelector(".extraDeck").contains(imgBox)){
         //extra deck
         imgBox.onclick = function(){
            if(imgBox.innerHTML.trim() != ""){
               extraDeck.splice(place,1);
               //remove the element
               displayDeck(".extraDeck .smallerImage",extraDeck);
               //update display
            }}

         imgBox.addEventListener("auxclick",function(e){
            if(imgBox.innerHTML.trim() != ""){
               if(e.button == 2){
                  //right click - go FROM EXTRA DECK TO SIDE DECK
                  e.preventDefault();
                  if(sideDeck.length<15){
                     var imageID = imgBox.innerHTML.split("/smallImages/")[1].split(".")[0]; //need this to add to side deck
                     sideDeck.push(imageID);
                     //add to side deck
                     document.querySelectorAll(".sideDeck .smallerImage")[sideDeck.length-1].innerHTML = imgBox.innerHTML;

                     //still remove from extra deck as above
                     extraDeck.splice(place,1);
                     displayDeck(".extraDeck .smallerImage",extraDeck);
                  }
                  else{alertBox("Side deck full!");}

               }
            }})
      }
      else{
         //SIDE DECK
         imgBox.onclick = function(){
            if(imgBox.innerHTML.trim() != ""){
               sideDeck.splice(place-15,1);
               //remove the element
               displayDeck(".sideDeck .smallerImage",sideDeck);
               //update display
            }}

         imgBox.addEventListener("auxclick",function(e){
            if(imgBox.innerHTML.trim() != ""){
               if(e.button == 2){
                  //right click - go from side deck to main OR extra deck (card dependant)
                  e.preventDefault();
                  var imageID = imgBox.innerHTML.split("/smallImages/")[1].split(".")[0]; //need this to add to main/extra deck
                     fetch(`./cards/${imageID}`,{method:"GET",headers:{}}).then(response => response.json()).then(body => {
                        if(body["subtype"]!= undefined ){
                           if(body["subtype"].includes("synchro") || body["subtype"].includes("xyz") || body["subtype"].includes("link") || body["subtype"].includes("fusion")){
                              //belongs in extra deck
                              if(extraDeck.length<15){
                                 extraDeck.push(imageID);
                                 //add to side deck
                                 document.querySelectorAll(".extraDeck .smallerImage")[extraDeck.length-1].innerHTML = imgBox.innerHTML;
                                 //still remove from side deck as above
                                 sideDeck.splice(place - 15,1);
                                 displayDeck(".sideDeck .smallerImage",sideDeck);
                              }
                              else{alertBox("Extra deck full!");}
                              return;
                           }
                        }
                        //belongs in the main deck
                        if(mainDeck.length<60){

                           mainDeck.push(imageID);
                           //add to side deck

                           document.querySelectorAll(".smallImage")[mainDeck.length-1].innerHTML = imgBox.innerHTML;

                           //still remove from side deck as above
                           sideDeck.splice(place - 15,1);
                           displayDeck(".sideDeck .smallerImage",sideDeck);
                           document.querySelector(".deckCount").innerHTML = `Count: ${mainDeck.length}`;

                        }
                        else{alertBox("Main deck full!");}

                     })




               }
            }})
      }

   })
}

addClickAndHover(".resultImage");
addClickAndHover(".smallImage");
addClickAndHover(".smallerImage");

const filterDefaults = {
   //all the default values for filters
   "cardType":"all",
   "name":"",
   "desc":"",
   "subtype":"subtype",
   "type":"type",
   "attribute":"attribute",
   "level":"level",
   "atk":"",
   "def":""
}
var displayCards;

function displaySearchResult(searchResult,pageNumber,maxPages){
   //number of cards to display
   var imageBoxes = document.querySelectorAll(".resultImage");
   for(var i = 0; i < 20 ;i++){
      imageBoxes[i].innerHTML = "";
      //still needs to empty the div even if its not at the end
      if (i < searchResult.length){
         var limit = limitedCards[searchResult[i]];
         if(limit !== undefined){
            //if the card has a restriction like different format or banned
            imageBoxes[i].innerHTML += `<img src = "./static/images/backgrounds/limit${limit}.jpg" class = "groupSign">`;
         }
         imageBoxes[i].innerHTML += `<img src = "./static/images/smallImages/${searchResult[i]}.jpg" onmouseover = "largeImage(this)" onauxclick = "if(event.button==1){cardInfoDisplay(${searchResult[i]})}">`;
         //set the image link
      }
   }
   //Make the left arrow appear correctly
   if(pageNumber > 1){
      document.querySelector(".leftArrow img").classList.remove("hidden");
   }
   else{
      document.querySelector(".leftArrow img").classList.add("hidden");
   }
   //Make the right arrow appear correctly
   if (pageNumber < maxPages){
      document.querySelector(".rightArrow img").classList.remove("hidden");
   }
   else{
      document.querySelector(".rightArrow img").classList.add("hidden");
   }
   document.querySelector(".pageNumber").innerHTML = `Page&nbsp<span> ${pageNumber}</span>&nbspof ${maxPages}`;
}

function sendFilters(pageNumber){
   //POST something without refreshing (!!!)
   var xml = new XMLHttpRequest();
   xml.open("POST","./deckEditorSearch",true);
   //when it sends data, send it to the route @/deckEditorSearch
   xml.setRequestHeader("Content-type","application/x-www-form-urlencoded");

   xml.onload = function(){
      var displayCards = JSON.parse(this.responseText);
      //what you get from Python, turn into JSON format
            for(var c in displayCards.limitedCards){
         limitedCards[c] = displayCards.limitedCards[c];
      }
      displaySearchResult(displayCards.data,displayCards.pageNumber,displayCards.maxPages);

   }

   var filters = {"filters":{},"pageNumber":pageNumber};
   //will be a list of all the filters the user inputted
   for(var filter in filterDefaults){
      if(document.querySelector("[name="+filter+"]").value != filterDefaults[filter]){
         //if the filter is NOT the default
         if(filter == "level" || filter == "atk" || filter == "def"){
            filters["filters"][filter] = parseInt(document.querySelector("[name="+filter+"]").value);
            //make number a number
         }
         else{
            filters["filters"][filter] = document.querySelector("[name="+filter+"]").value.toLowerCase().replace("_"," ");
            //if it is a string, lower case it
         }
      }
   }

   filters = JSON.stringify(filters);
   xml.send(filters);
   //send to back end
}

// document.querySelector(".searchButton").addEventListener("click",function(){
//    sendFilters(1); //click search, do search
// });
document.querySelectorAll("form input").forEach(function(input){
   input.addEventListener("input",function(){
      sendFilters(1); //change search filter, do search
   })
});
document.querySelectorAll("form select").forEach(function(input){
   input.addEventListener("change",function(){
      sendFilters(1); //change search filter, do search
   })
});
document.querySelector(".leftArrow img").addEventListener("click",function(){
   if(!this.classList.contains("hidden")){
   sendFilters(parseInt( document.querySelector(".pageNumber span").innerHTML) - 1);
   }
   else{
      alertBox("This is the first page!");
   }
   //do search with the previous page number
});
document.querySelector(".rightArrow img").addEventListener("click",function(){
   if(!this.classList.contains("hidden")){

   sendFilters(parseInt( document.querySelector(".pageNumber span").innerHTML) + 1);
   }
   else{
      alertBox("This is the last page!");
   }
   //do search with the next page
});
document.querySelector(".pageNumber").onclick = function(){
   var p = parseInt(prompt("Please enter a page number"));
   if(p){
      sendFilters(p);
   }
}
sendFilters(1);

function saveDeck(action,newDeckName,destination){
   //newDeckName is false if just being saved, or a name if being renamed
   //action - rename, create, delete, save
   //destination - stay, menu, chances, or ID of the deleted or new deck
   // alertBox(action+" | "+destination);
   //POST the updated version of the deck maybe with a name
   if(action == "delete"){
      var sendInfo = {"deckID":deckID,"delete":true};
   }
   else{
      var sendInfo = {"main":mainDeck,"extra":extraDeck,"side":sideDeck,"deckID":deckID,"newDeckName":newDeckName};
   }
   var xml = new XMLHttpRequest();
   xml.open("POST","./deckEditorSave",true);
   //when it sends data, send it to the route @/deckEditorSave
   xml.setRequestHeader("Content-type","application/x-www-form-urlencoded");

   sendInfo = JSON.stringify(sendInfo);
   xml.send(sendInfo);
   //send to back end

   xml.onload = function(){
            //newId - if the page is switching to another deck, this is its id
      //needed because errors happen when the functions execute out of order
      var responseMessage = JSON.parse(this.responseText);
      //what you get from Python, turn into JSON format
      //status,message,deckID
      if((responseMessage["status"] != "error")){
         //only when successful
         if(action == "delete"){//here destination is the old id to remove
            document.querySelector(".deckOptions div."+CSS.escape(destination)).remove();
            //remove option for the deck that was just deleted
            deckID = 0;

            switchDeck();
            alertBoxGreen(`Deleted deck`);
            return;
         }
         // alertBox(`response: ${responseMessage["status"]}`);
         deckID = responseMessage["deckID"];
         // alertBox(`deck ID: ${deckID}`)
         document.querySelector(".saveDeck").innerHTML = "Deck Saved!";
         document.querySelector(".saveDeck").classList.add("saved");
         document.querySelector(".publishDeck").classList.add("enabled");
         //if it is saved, tell this to the user
         if(newDeckName){
            if(destination == "stay"){
               //NOT loading another deck - change the deck name display on the bottom right of the menu
               document.querySelector(".deckName").innerHTML = newDeckName;
               alertBoxGreen(`Renamed to ${newDeckName}!`);
            }

            if(action == "create"){
               document.querySelector(".deleteDeck").classList.add("enabled");
               //it is a new deck
               document.querySelector(".deckOptions").innerHTML += `<div class = "${deckID}">${newDeckName}</div>`;
               //add a new
               alertBoxGreen(`Created ${newDeckName}!`);
               deckOptionsAddClick();
            }
            else{
               document.querySelector(".deckOptions div."+CSS.escape(deckID)).innerHTML = newDeckName;
               //change deck name on drop down display:
               //this has changed but only normally updates when reloading
            }
         }
         else if(destination != "menu"){
            alertBoxGreen(`Saved ${document.querySelector(".deckName").innerHTML}!`);
         }
         if(responseMessage["status"] == "illegal"){
            //make the option in the drop down menu greyed out
            // alertBox(document.querySelector(`.deckOptions div.${deckID}`).classList)
            document.querySelector(".deckOptions div."+CSS.escape(deckID)).classList.add("illegal");
            document.querySelector(".deckName").classList.add("illegal");
         }else{
            document.querySelector(".deckOptions div."+CSS.escape(deckID)).classList.remove("illegal");
            document.querySelector(".deckName").classList.remove("illegal");}
         redirect(destination);
      }
      else{
         //did not save because of an error
         alertBox("Error: Did not save: "+responseMessage["message"]);
      }
   }

}

function redirect(destination){
   if(destination == "menu"){
      window.location = `${window.location.origin}/home`;
   }
   else if(destination == "load"){
      loadFileDeck();
   }
   else if(destination == "chances"){
      if(document.querySelectorAll(".deckOptions div")[1]!== undefined){
         preLoadDeck("chancesMode",deckID);
      }
      else{
         alertBox("No decks to use this page with!");
      }
   }
   else if(destination.includes("searchForDecksWith")){//search for card
      searchForDecksWith1();
   }
   else if(!isNaN(destination)){
      //if switching deck
      deckID = destination;
      switchDeck();
   }
}

function checkSave(destination,message1,message2){
   //leaving or switching decks
   if(document.querySelector(".saveDeck.saved") == null){
      if(deckID == 0){
         //NEW DECK
         var newDeckName = prompt(message1);
         newDeckName ? saveDeck("create",newDeckName,destination) : redirect(destination);
      }
      else{//SAVING DECK
         confirm(message2) ? saveDeck("save",false,destination) : redirect(destination);
      }
   }
   else{redirect(destination)}
}

document.querySelector(".saveDeck").onclick = function(){
   if(!this.classList.contains("saved")){
      if(deckID == 0){
         //new deck
         var newDeckName = prompt("Please name the deck to save it");
         if(newDeckName){
            saveDeck("create",newDeckName,"stay");
         }
      }
      else{
         saveDeck("save",false,"stay");
      }
   }
   //only send if it's not saved
}

document.querySelector(".renameDeck").onclick = function(){
   //make popup appear, use input as paremeter
   var newDeckName = prompt("Please enter the deck's name");
   if(newDeckName){
      if(deckID == 0){
         saveDeck("create",newDeckName,"stay");
      }
      else{
         saveDeck("rename",newDeckName,"stay");
      }
   }
}

document.querySelector(".deleteDeck").onclick = function(){
   //confirmation button appear
   if(deckID > 0 && confirm(`delete ${document.querySelector(".deckName").innerHTML.trim()}?`)){
      //confirm pop up
      saveDeck("delete",false,deckID);
   }
}

document.querySelector(".mainMenu").onclick = function(){
   checkSave("menu","Name and save new deck before leaving?","Save Deck before leaving?");
}
// document.querySelector(".chancesMode").onclick = function(){
//    checkSave("chances","Name and save new deck before leaving?","Save Deck before leaving?");
// }

document.querySelector(".exportDeck").onclick = function(){
   if(this.classList.contains("enabled") && !this.innerHTML.includes("<a")){
      var xml = new XMLHttpRequest();
      xml.open("POST","./exportDeck",true);
      //when it sends data, send it to the route @/exportDeck
      xml.setRequestHeader("Content-type","application/x-www-form-urlencoded");

      var sendInfo = {"main":mainDeck,"extra":extraDeck,"side":sideDeck};
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
            download = "${document.querySelector(".deckName").innerHTML.trim()}.ydk"
            style = "display:none;">`
            document.querySelector(".exportDeck a").click();
            document.querySelector(".exportDeck a").remove();
         }
      }
   }
}

function replace0s(deckl){//only does one
   for(var i=0;i<deckl.length;i++){
      if(deckl[i][0] == "0"){
         deckl[i] = deckl[i].substring(1);
      }
      if(deckl[i].includes("\r")){
          deckl[i] = deckl[i].substring(0,deckl[i].length - 1)
      }
   }
   // displayDeck(id,deckl);

   return deckl;
}

function findLimits(deckl,id){
   var imageBoxes = document.querySelectorAll(id);

   for(var i=0;i<deckl.length;i++){
      fetch(`${window.location.origin}/cards/${deckl[i]}`,{method:"GET",headers:{}}).then(response => response.json()).then(card => {
         var limit = card.limit;
         if(limit<3){
            limitedCards[card.cardID] = limit;
            //find and replace
            for(var j=0;j<deckl.length;j++){
               if(deckl[j] == card.cardID){
                  imageBoxes[j].innerHTML = `<img src = "./static/images/backgrounds/limit${limit}.jpg" class = "groupSign">`;
                  imageBoxes[j].innerHTML += `<img src = "./static/images/smallImages/${card.cardID}.jpg" onmouseover = "largeImage(this)" onauxclick = "if(event.button==1){cardInfoDisplay(${card.cardID})}">`;
               }
            }
         }
      })
   }
}


function previewFile(){
   const [file] = document.querySelector('input[type=file]').files;
   const reader = new FileReader();

   reader.addEventListener("load", () => {

     // this will then display a text file
      fileDeck = reader.result;
      loadFileDeck();
   }, false);

   if (file) {
     reader.readAsText(file);
   }
 }

function loadFileDeck(){
   deckID = 0;
   switchDeck();
   // document.querySelector(".deckName").innerHTML = "New deck";
   mainDeck = replace0s(fileDeck.split("#main")[1].split("#extra")[0].split("\n").slice(1,-1));
   displayDeck(".mainDeckRow .smallImage",mainDeck);
   extraDeck = replace0s(fileDeck.split("#extra")[1].split("!side")[0].split("\n").slice(1,-1));
   displayDeck(".extraDeck .smallerImage",extraDeck);
   sideDeck = replace0s(fileDeck.split("!side")[1].split("\n").slice(1));
   console.log(sideDeck);
   if(sideDeck[sideDeck.length -1] == ""){
      sideDeck.pop();
   }
   console.log(sideDeck);
   displayDeck(".sideDeck .smallerImage",sideDeck);
   document.querySelector(".exportDeck").classList.add("enabled");
   findLimits(mainDeck,".mainDeckRow .smallImage")
   findLimits(extraDeck,".extraDeck .smallerImage")
   findLimits(sideDeck,".sideDeck .smallerImage")

}

var openImport = false;

document.querySelector(".importDeck").onclick = function(){
   if(this.classList.contains("enabled") && !openImport){
      openImport = true;
      //check the current deck is saved
      //switch to new deck
      //load it
      checkSave("stay","Name and save new deck before loading file?","Save Deck before loading file?");
      document.querySelector(".importDeck").innerHTML += `
      <input type="file" accept=".ydk" onchange = "previewFile()"
      style = "display:none;"></input>`
      document.querySelector(".importDeck input").click();

      openImport = false;
   }
}

document.querySelector(".publishDeck").onclick = function(){
   if(deckID != 0 && this.classList.contains("enabled")){
      //publish the deck
      //send ID to the front end
      var xml = new XMLHttpRequest();
      xml.open("POST","./publishDeck",true);
      //when it sends data, send it to the route @/publishDeck
      xml.setRequestHeader("Content-type","application/x-www-form-urlencoded");

      xml.onload = function(){
         var msg = JSON.parse(this.responseText);
         if(msg == "publish"){
            alertBoxGreen("Your deck has been pusblished! It can be viewed, liked and saved from in public decks page by other users.");
         }
         else if(msg == "update"){
            alertBoxGreen("Your published deck has been updated! Its likes have been reset.");
         }
         else if(msg == "not saved"){
            alertBox("Please save the deck first");
         }
         else if(msg == "illegal"){
            alertBox("Cannot publish illegal deck");
         }
         else if(msg == "error"){
            alertBox("Error");
         }
      }
      xml.send(JSON.stringify(deckID));

   }
   else{
      alertBox("Please save the deck first");
   }
}


document.querySelector(".largeImage").onclick = function(){
   if(this.innerHTML.trim() !== ""){
      cardInfoDisplay(this.innerHTML.split("smallImages/")[1].split(".jpg")[0]);
   }
}

document.querySelector(".cardInfoDisplay .close").onclick = function(){
   cardInfoDisplay(false);
}



deckID == "" ? deckID = 0 : switchDeck();