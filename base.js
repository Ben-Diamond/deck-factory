function capital(s){//capitalise the word
   var out = ""
   s = s.trim().split(" ");
   for(var x = 0; x < s.length; x++){
      out+=s[x][0].toUpperCase() + s[x].slice(1)+" ";
   }
   return out
}

function cardInfoDisplay(cardId){
   if(typeof(closeDisplay) === "function"){
      closeDisplay("cardInfoDisplay")
   }
   if(!cardId){//false = close
      document.querySelector(".cardInfoDisplay").classList.add("hide");
      return;
   }
   document.querySelector(".largeImage").innerHTML = `<img src = "./static/images/smallImages/${cardId}.jpg">`;
   //display big info for card of this id
   fetch(`${window.location.origin}/cards/${cardId}`,{method:"GET",headers:{}}).then(response => response.json()).then(card => {
   var banner = document.querySelector(".cardInfoDisplay .banner");
   card.name.length < 35 ? banner.style.fontSize = "5.5vh" : card.name.length < 44 ? banner.style.fontSize = "5vh" : banner.style.fontSize = "4vh";
   banner.innerHTML = `${card.name}`;
   var out1 = ``;//left side
   var out2 = ``;//right side
   var desc = card.desc;
   while(desc.includes("\r\n")){
      desc = desc.replace("\r\n","<br>");
      //HTML doesn't use standard line breaks, fill them in here
   }
   if(card.cardType == "monster"){
      //the a ? "b" : "c" does b if a is true, otherwise do c.
      out1 += `
      <div class = 'bigInfoTitle'>
      Details
      </div>
      <div>
      ${card.subtype.includes("link") ?  "Link-": card.subtype.includes("xyz") ? "Rank " : "Level "}${card.level}<br>
      ${card.scale!== undefined ? `Scale ${card.scale}<br>`: ""}
      ${card.attribute.toUpperCase()}<br>
      ${capital(card.type)}<br>
      ${capital(card.subtype)} Monster <br>
      ${card.atk} ${card.def !== undefined ? `/ ${card.def}` : ""}<br>
      ${card.format == "OCG" ? "OCG Exclusive" : `Limit: ${card.limit}`}<br>
      ID: ${card.cardID}<br>
      </div>
      <div class = "bigInfoTitle">
      TCG Printings</div>
      `;
      //pendulum cards need smaller font because there is more information
      out2 += `<div ${card.pend !== undefined ? "style='font-size:2.5vh'" : ""}>
      ${card.pend !== undefined ? `<div class = "bigInfoTitle">Pendulum effect</div> <div> ${card.pend}</div>` : ""}
      ${card.subtype.includes("normal") ? "<div class = 'bigInfoTitle'> Descripton</div>" : "<div class = 'bigInfoTitle'>Effect</div>"}${desc}
      </div>`;
   }
   else{//spell or trap
      out1+= `
      <div class = 'bigInfoTitle'>
      Details
      </div>
      <div>
      ${capital(card.subtype)} ${capital(card.cardType)}<br>
      ${card.format == "OCG" ? "OCG Exclusive" : `Limit: ${card.limit}`}<br>
      ID: ${card.cardID}<br>
      </div>
      <div class = "bigInfoTitle">
      TCG Printings</div>
      `;
      out2 += `<div><div class = 'bigInfoTitle'> Effect</div>${desc}</div>`;
   }
   if(card.printings){
      //make the font size slightly smaller if there are many printings
      var size = 3.1 - card.printings.length*0.1
      if(size < 2){size=2;}
      card.printings.forEach(function(print){
      out1+=`
      <div style="font-size: ${size}vh;">${print[2]} ${print[1]}<br>
      in ${print[0]} </div>`;
   })}
   else{
      out1+=`<div>No printings yet</div>`;
   }

   //apply it
   var box1 = document.querySelector(".cardInfoDisplay span .bigInfoBox1");
   var box2 = document.querySelector(".cardInfoDisplay span .bigInfoBox2");

   box1.innerHTML = out1;
   box2.innerHTML = out2 + `<div class = "bigInfoTitle2" onclick = "searchForDecksWith()">Search for decks containing this card</div>`;
   document.querySelector(".cardInfoDisplay").classList.remove("hide");

   if(box1.offsetHeight - box2.offsetHeight > 0){
      //if the left one is taller than the right, give the left one the border
      box1.style.borderRight = "solid 0.6vh rgba(0,75,100,0.5)";
      box2.style.borderLeft = "0";
   }
   else{
      //if not, give it to the right one
      box2.style.borderLeft = "solid 0.6vh rgba(0,75,100,0.5)";
      box1.style.borderRight = "0";
   }

   //GIVE BIGGER ONE THE LEFT/RIGHT BORDER
   })
}

function searchForDecksWith(){
   //click on "search for decks containing this card"
   //(for deck editor check if the deck is saved)
   //send the ID to the back end
   //if it exists, add the card name to the session
   //redirect to /decks
   //back end insert into search bar
   //front end search when load
   if(window.location.pathname == "/deckEditor"){
      //on the deck editor; ask to save deck
      checkSave("searchForDecksWith","Name and save new deck before leaving?","Save deck before leaving?");
   }
   else if(window.location.pathname == "/decks"){
      searchForDecksWith1()
      //already on the page
   }
   else{
      searchForDecksWith1()
      //test arena or chances mode

   }
}

function searchForDecksWith1(){
   var xml = new XMLHttpRequest();
   xml.open("POST","./searchForDecksWith",true);
   //when it sends data, send it to the route @/searchForDecksWith
   xml.setRequestHeader("Content-type","application/x-www-form-urlencoded");

   var sendInfo = JSON.stringify(parseInt(document.querySelector(".cardInfoDisplay").innerHTML.split("ID:")[1].split("<br>")));
   //find the card's ID
   xml.send(sendInfo);
   //send to back end

   xml.onload = function(){
      if(this.responseText == "good"){
         //redirect to search for decks
         window.location = `${window.location.origin}/decks`;
      }
      else{
         alertBox("Error: Card seems to not exist");
      }
   }
}

function preLoadDeck(link,deckID){
   var xml = new XMLHttpRequest();
   xml.open("POST","./preLoadDeck",true);
   //when it sends data, send it to the route @/preLoadDeck
   xml.setRequestHeader("Content-type","application/x-www-form-urlencoded");
   xml.send(JSON.stringify(deckID));
   //send deck ID to back end

   xml.onload = function(){
      this.responseText == "good" ? window.location = `${window.location.origin}/${link}` : alertBox("Error: This deck does not seem to be yours");
   }
}

function alertBox(msg){
   // document.querySelector(".wrapper").innerHTML+=msg.length;
   document.querySelector(".alertOuter").innerHTML=`<div class = "alertInner" ${msg.length > 25 ? "style = 'font-size:3.5vh'" : ""})>${msg}</div>`;
}
function alertBoxGreen(msg){
   // document.querySelector(".wrapper").innerHTML+=msg.length;
   document.querySelector(".alertOuter").innerHTML=`<div class = "alertGreenInner${msg.length > 60 ? ' long':''}" ${msg.length > 25 && msg.length < 60?  "style = 'font-size:3.5vh'" : ''}>${msg}</div>`;
}

function largeImage(card,arena=false){


    if(arena){
        alert("h")
        if(document.querySelectorAll(".moveCardContainer:not(.hide)").length != 0 | document.querySelector(".cardInfoDisplay.hide") == null){
            return;}

        // var src = `${window.location.origin}/static/images/smallImages/${card.classList[1]}.jpg`;

    }
    else{
        var src = card.src.replace('smallImages','smallImages');
    }


    var img = new Image();
    img.src = src;
    img.onload = function() {
        document.querySelector(".largeImage").innerHTML = `<img src = "${img.src}">`;
        img.remove();
    };

}