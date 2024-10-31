var deckID = document.querySelector(".initialID").innerHTML;
if(deckID == ""){deckID = document.querySelector(".deckName").classList[2];}
var colours;
var handSize;
var rowGroups = [1,1,2,1,2,3];

document.querySelector(".switchDeck").onclick = function(){
   document.querySelector(".deckOptions").classList.toggle("hide");
}

function deckOptionsAddClick(){
   document.querySelectorAll(".deckOptions div").forEach(function(deckOption){
      deckOption.onclick = function(){
         //when the user selects a deck, remove the drop down menu and perform the below function
         document.querySelector(".deckOptions").classList.toggle("hide");


         if(deckOption.classList[0] != deckID){

            deckID = deckOption.classList[0];

            switchDeck();

            //set the bottom right display to say the name
         }
      }
   })
}

function displayDeck(deck,groups){
   colours = [0,0,0,0];
   var imageBoxes = document.querySelectorAll(".mainDeckRow .smallImage");
   for(var i = 0; i < imageBoxes.length; i++){
      imageBoxes[i].innerHTML = ``;
      //still empty the div either way

      if(i < deck.length){//if there is a card to add
         colours[groups[i]] += 1;//note which colour it is
         if(groups[i]!== 0){//add colorur image
            imageBoxes[i].innerHTML += `<img src = "./static/images/backgrounds/group${groups[i]}.png" class = 'groupsign colour'>`
         }
         imageBoxes[i].innerHTML += `<img src = "./static/images/smallImages/${deck[i]}.jpg" onmouseover = "largeImage(this)" onauxclick = "if(event.button==1){cardInfoDisplay(${deck[i]})}">`;
         // colours[group]
      }
   }
}

function switchDeck(){
   //POST deck id to front end, receive the cards in that deck
   var xml = new XMLHttpRequest();
   xml.open("POST","./chancesModeSwitchDeck",true);
   //when it sends data, send it to the route @/deckEditorSwitchDeck
   xml.setRequestHeader("Content-type","application/x-www-form-urlencoded");

   xml.send(JSON.stringify(deckID));
   //send to back end

   xml.onload = function(){

      var deckList = JSON.parse(this.responseText);
      if(deckList == "error"){
         alertBox("Deck does not match user");
         return;
      }
      //what you get from Python, turn into JSON format
      displayDeck(deckList["main"],deckList["groups"]);
      var deckLength = deckList["main"].length;
      //first is the number of cards NOT in a group
      document.querySelector(".deckSize").innerHTML = `Deck size: ${deckLength}`;
      document.querySelector(".deckName").innerHTML = deckList["name"];

      document.querySelector(".saveGroups").classList.remove("enabled");
      document.querySelector(".saveGroups").innerHTML = "Groups Saved!";
      if(deckLength == 1){
         documentquerySelector(".handSize .handSizeArrow .downArrow").classList.add("hidden");
         documentquerySelector(".handSize .handSizeArrow .downArrow").classList.remove("grow");
         documentquerySelector(".handSize .handSizeArrow .downArrow").dataset.reason = "Hand size must be at least 1";
      }
      if(deckLength<6){
         handSize = deckLength;
         document.querySelector(".handSize .handSizeArrow .upArrow").classList.add("hidden");
         document.querySelector(".handSize .handSizeArrow .upArrow").dataset.reason = "Not enough cards in deck";
      }
      else{
         handSize = 5;
         document.querySelector(".handSize .handSizeArrow .upArrow").classList.remove("hidden");
      }
      document.querySelector(".handSize .txt").innerHTML = `Hand size: ${handSize}`;

      document.querySelectorAll(".drawNum span,.toNum span").forEach(function(num){
         num.innerHTML = 0;
      })
      document.querySelectorAll(".groupRow .upArrow").forEach(function(arw,place){
         if(colours[rowGroups[place/2|0]] == 0){
            arw.classList.add("hidden");
            arw.dataset.reason = "Cannot draw more than the group has";
         }
         else{
            arw.classList.remove("hidden");
         }
      })
      document.querySelectorAll(".groupRow .downArrow").forEach(function(arw){
         arw.classList.add("hidden");
         arw.dataset.reason = "Number drawn cannot be negative";
      })
      document.querySelectorAll(".drawNum").forEach(function(num,place){
         if(place == 0 || place == 1 || place == 3){
            num.innerHTML = "Draw 0";
         }
         else{
            num.innerHTML = "And 0";
         }
      })
      document.querySelectorAll(".toNum").forEach(function(num){
         num.innerHTML = "To 0";
      })
      calculate("one");
      calculate("two");
      calculate("three");
      // displayChance(100,0);
      // displayChance(100,1);
      // displayChance(100,2);
   }
}



function cardSwitchColour(imgBox){
   document.querySelector(".saveGroups").classList.add("enabled");
   document.querySelector(".saveGroups").innerHTML = "Save Groups";

   var group = 0; //no group
   if(imgBox.innerHTML.includes("group")){
      //has a group
      group = parseInt(imgBox.innerHTML.split("group")[1][0]);
      //what comes immedately after "group" is the group number
      imgBox.innerHTML = imgBox.innerHTML.split(">")[1]+">";
      //only the card image
   }

   colours[group]-=1; //no longer in this group
   colours[(group+1)%4]+=1;//now in this one
   groupChangeNumber(group,"down");
   group = (group+1)%4;
   //NEW GROUP. if it was 3, now 0. otherwise increases by 1

   if(group != 0){
      imgBox.innerHTML = `<img src = "./static/images/backgrounds/group${group}.png" class = 'groupsign colour'>` + imgBox.innerHTML;
      //add the dot to the START of the image
      groupChangeNumber(group,"up");
   }
}

function cardRemoveColour(imgBox){
   if(imgBox.innerHTML.includes("group")){
      //has a group
      var group = parseInt(imgBox.innerHTML.split("group")[1][0]);
      //what comes immedately after "group" is the group number
      imgBox.innerHTML = imgBox.innerHTML.split(">")[1]+">";
      //only the card image
      colours[group] -=1;
      colours[0]+=1;
      groupChangeNumber(group,"down");
      document.querySelector(".saveGroups").classList.add("enabled");
      document.querySelector(".saveGroups").innerHTML = "Save Groups";
   }
}

function clearGroups(){//remove all groups
   var images = document.querySelectorAll(".mainDeckRow .smallImage");
   images.forEach(function(img){
      cardRemoveColour(img);

   })
   alertBoxGreen("Groups cleared!");
}


function addHover(imgClass){
   var smallImages = document.querySelectorAll(imgClass);
   smallImages.forEach(function(imgBox){ //loops through the list and sets the element to be "imgbox"
      imgBox.addEventListener("mouseover", function(){
        //  if(imgBox.innerHTML.trim() != "" && document.querySelector(".cardInfoDisplay.hide") !== null){
        //     if(imgBox.innerHTML.includes("group")){
        //       document.querySelector(".largeImage").innerHTML = imgBox.innerHTML.split(">")[1]+">";
        //       //only copy the card image - NOT the group dot
        //     }
        //     else{
        //       document.querySelector(".largeImage").innerHTML = imgBox.innerHTML;
        //       //copy inner HTML to large image
        //     }

        //  }
      })

      if(imgClass == ".smallImage"){
         //if they click on a card from main deck
         imgBox.onclick = function(){
            if(imgBox.innerHTML.trim() != ""){
               cardSwitchColour(imgBox);
            }}
         imgBox.addEventListener("auxclick",function(e){
            if(imgBox.innerHTML.trim() != ""){
               if(e.button == 2){//RIGHT CLICK
                  cardRemoveColour(imgBox);
               }
            }
         })
      }
   })
}
addHover(".smallImage");

document.querySelector(".handSizeArrow .upArrow").onclick = function(){
   if(!this.classList.contains("hidden")){
      document.querySelector(".handSizeArrow .downArrow").classList.remove("hidden");
      //can decrease

      document.querySelectorAll(".toNum").forEach(function(box,place){
         var num = parseInt(box.innerHTML.split(" ")[1]);
         if(num == handSize && num < colours[rowGroups[place]]){
            //if the upper bound was limited by hand size, it can now increase
            //so lower bound can as well
            document.querySelectorAll(".high .upArrow")[place].classList.remove("hidden");
            document.querySelectorAll(".low .upArrow")[place].classList.remove("hidden");
         }
      })
      handSize += 1;
      document.querySelector(".handSize .txt").innerHTML = `Hand size: ${handSize}`;
      //froculate
      calculate("one");
      calculate("two");
      calculate("three");
      if(handSize == colours[0]+colours[1]+colours[2]+colours[3]){
         //can't have more in the hand than is in the deck
         this.classList.add("hidden");
         this.dataset.reason = "Not enough cards in deck";
      }
   }
   else{
      alertBox(this.dataset.reason);
   }

}

document.querySelector(".handSizeArrow .downArrow").onclick = function(){
   if(!this.classList.contains("hidden")){
      document.querySelector(".handSizeArrow .upArrow").classList.remove("hidden");
      //can increase
      document.querySelectorAll(".toNum").forEach(function(box,place){
         var num = parseInt(box.innerHTML.split(" ")[1]);
         if(num == handSize){
            //if it was the previous hand size, decrease it (up arrow already gone)
            num-=1;
            box.innerHTML = `To ${num}`;
         }
         if(num == handSize-1){//always visited if above was true
            document.querySelectorAll(".high .upArrow")[place].classList.add("hidden");
            document.querySelectorAll(".high .upArrow")[place].dataset.reason = "Cannot draw more than hand size";

            //lower bound can only need changing if upper bound did
            var num2 = parseInt(document.querySelectorAll(".drawNum")[place].innerHTML.split(" ")[1]);
            if(num2 == handSize){
               num2-=1;
               document.querySelectorAll(".drawNum")[place].innerHTML = `${document.querySelectorAll(".drawNum")[place].innerHTML.split(" ")[0]} ${num2}`;
            }
            if(num2 == handSize-1){
               document.querySelectorAll(".low .upArrow")[place].classList.add("hidden");
               document.querySelectorAll(".low .upArrow")[place].dataset.reason = "Cannot draw more than hand size";
            }
         }
      })
      handSize-=1;
      document.querySelector(".handSize .txt").innerHTML = `Hand size: ${handSize}`;
      //froculate
      calculate("one");
      calculate("two");
      calculate("three");
      if(handSize == 1){
         this.classList.add("hidden");
         this.dataset.reason = "Hand size must be at least 1"
         //don't go below 1
      }
   }
   else{
      alertBox(this.dataset.reason);
   }
}

function groupChangeNumber(group,direction){
   //when the number of cards in a group changes, adjust all of the arrows
   //direction either up or down, showing how the number in that group changed
   var groupSize = colours[group];
   //rowgroups = [1,1,2,1,2,3]
   for(var place = 0; place < rowGroups.length; place++){
      if(rowGroups[place] == group){
         //belongs to that group

         var lower = parseInt(document.querySelectorAll(".drawNum")[place].innerHTML.split(" ")[1]);
         //e.g second row has the second instance of drawNum
         var upper = parseInt(document.querySelectorAll(".toNum")[place].innerHTML.split(" ")[1]);
         //if upper > groupSize, decrease upper (up arrow will already not be there)

         if(direction == "up"){
            //both upper and lower can increase if the hand size permits it
            if(colours[group] <= handSize){
               if(upper < handSize){
               document.querySelectorAll(".groupRow .high .upArrow")[place].classList.remove("hidden");
               document.querySelectorAll(".groupRow .low .upArrow")[place].classList.remove("hidden");
            }
            }
         }

         else if(direction == "down"){


            if(upper > groupSize){
               //it was at the max but now it is less
               upper-=1
               document.querySelectorAll(".toNum")[place].innerHTML = `To ${upper}`;
               if(lower > upper){
                  //if lower was also at the max
                  lower-=1;
                  document.querySelectorAll(".drawNum")[place].innerHTML = `${document.querySelectorAll(".drawNum")[place].innerHTML.split(" ")[0]} ${lower}`;
               }
            }
            if(lower == groupSize){
               document.querySelectorAll(".low .upArrow")[place].classList.add("hidden");
               document.querySelectorAll(".low .upArrow")[place].dataset.reason = "Cannot draw more than the group has";
               //if lower now = upper, and upper = groupsize, then lower cannot increase
            }
            if(upper==groupSize){
               document.querySelectorAll(".high .upArrow")[place].classList.add("hidden");
               document.querySelectorAll(".high .upArrow")[place].dataset.reason = "Cannot draw more than the group has";
            }
            if(groupSize == 0){
               document.querySelectorAll(".high .downArrow")[place].classList.add("hidden");
               document.querySelectorAll(".high .downArrow")[place].dataset.reason = "No cards in this group";
               document.querySelectorAll(".low .downArrow")[place].classList.add("hidden");
               document.querySelectorAll(".low .downArrow")[place].dataset.reason = "No cards in this group";
            }
         }
         //froculate
         calculate(document.querySelectorAll(".drawNum")[place].closest(".groupContainer").classList[1]);
      }
   }
}

document.querySelectorAll(".low .upArrow").forEach(function(arrow,place){
   //up arrows that change the lower number of cards
   arrow.onclick = function(){
      if(!arrow.classList.contains("hidden")){
         var num = parseInt(document.querySelectorAll(".drawNum")[place].innerHTML.split(" ")[1])+1;
         //the "draw X" at the same place, from after the space = X
         if(num == handSize || num == colours[rowGroups[place]]){
            //rowgroups[place] is the group. colours[] is the number of cards in that group
            arrow.classList.add("hidden");
            document.querySelectorAll(".high .upArrow")[place].classList.add("hidden");
            if(num == handSize){
               arrow.dataset.reason = "Cannot draw more than hand size";
               document.querySelectorAll(".high .upArrow")[place].dataset.reason = "Cannot draw more than hand size";
            }
            else{
               arrow.dataset.reason = "Cannot draw more than the group has";
               document.querySelectorAll(".high .upArrow")[place].dataset.reason = "Cannot draw more than the group has";
            }
            //hide this up arrow and the one for upper
         }
         document.querySelectorAll(".low .downArrow")[place].classList.remove("hidden");
         //can always go down

         if(num-1 == document.querySelectorAll(".toNum")[place].innerHTML.split(" ")[1]){
            //if it's bigger than the upper value, change that one
            document.querySelectorAll(".toNum")[place].innerHTML = `To ${num}`;
            document.querySelectorAll(".high .downArrow")[place].classList.remove("hidden");
         }
         document.querySelectorAll(".drawNum")[place].innerHTML = `${document.querySelectorAll(".drawNum")[place].innerHTML.split(" ")[0]} ${num}`;
         //froculate
         calculate(arrow.closest(".groupContainer").classList[1]);
      }
      else{
         alertBox(arrow.dataset.reason);
      }
   }

})

document.querySelectorAll(".low .downArrow").forEach(function(arrow,place){
   //down arrows that change the lower number of cards
   arrow.onclick = function(){
      if(!arrow.classList.contains("hidden")){
         var num = parseInt(document.querySelectorAll(".drawNum")[place].innerHTML.split(" ")[1])-1;
         if(num == 0){
            arrow.classList.add("hidden");
            arrow.dataset.reason = "Number drawn cannot be negative";
         }
         document.querySelectorAll(".low .upArrow")[place].classList.remove("hidden");
         //can go down
         document.querySelectorAll(".drawNum")[place].innerHTML = `${document.querySelectorAll(".drawNum")[place].innerHTML.split(" ")[0]} ${num}`;
         //froculate
         calculate(arrow.closest(".groupContainer").classList[1]);
      }
      else{
         alertBox(arrow.dataset.reason);
      }
   }

})

document.querySelectorAll(".high .upArrow").forEach(function(arrow,place){
   //up arrows that change the upper number of cards
   arrow.onclick = function(){
      if(!arrow.classList.contains("hidden")){
         var num = parseInt(document.querySelectorAll(".toNum")[place].innerHTML.split(" ")[1])+1;
         //take the "To 5" from that row and turn it into 6
         if(num == handSize || num == colours[rowGroups[place]]){
            //if it's now the biggest it can be, same as low upArrow function
            arrow.classList.add("hidden");
            if(num == handSize){
               arrow.dataset.reason = "Cannot draw more than hand size";
            }
            else{
               arrow.dataset.reason = "Cannot draw more than the group has";
            }
         }
         document.querySelectorAll(".high .downArrow")[place].classList.remove("hidden");
         //can go down
         document.querySelectorAll(".toNum")[place].innerHTML = `To ${num}`;
         //froculate
         calculate(arrow.closest(".groupContainer").classList[1]);
      }
      else{
         alertBox(arrow.dataset.reason);
      }
   }
})

document.querySelectorAll(".high .downArrow").forEach(function(arrow,place){
   //down arrows that change the upper number of cards
   arrow.onclick = function(){
      if(!arrow.classList.contains("hidden")){
         var num = parseInt(document.querySelectorAll(".toNum")[place].innerHTML.split(" ")[1])-1;
         if(num+1 == document.querySelectorAll(".drawNum")[place].innerHTML.split(" ")[1]){
            //if the lower bound was equal to the upper bound, it must come down
            document.querySelectorAll(".drawNum")[place].innerHTML = `Draw ${num}`;
            //lower bound can now increase
            document.querySelectorAll(".low .upArrow")[place].classList.remove("hidden");
         }
         if(num == 0){
            //cannot go below 0
            arrow.classList.add("hidden");
            arrow.dataset.reason = "Number drawn cannot be negative"
            document.querySelectorAll(".low .downArrow")[place].classList.add("hidden");
            document.querySelectorAll(".low .downArrow")[place].dataset.reason = "Number drawn cannot be negative";
         }
         document.querySelectorAll(".high .upArrow")[place].classList.remove("hidden");
         //can now go up
         document.querySelectorAll(".toNum")[place].innerHTML = `To ${num}`;

         //froculate
         calculate(arrow.closest(".groupContainer").classList[1]);
      }
      else{
         alertBox(arrow.dataset.reason);
      }
   }
})

function changeColour(elem,place,group){
   rowGroups[place] = group; //update to show which group this row is
   elem.innerHTML = `<img src = "./static/images/backgrounds/group${group}.png">`;
   var lower = parseInt(document.querySelectorAll(".drawNum")[place].innerHTML.split(" ")[1]);
   var upper = parseInt(document.querySelectorAll(".toNum")[place].innerHTML.split(" ")[1]);

   if(upper > colours[group]){
      //if the lower bound was higher than this group can hold, it changes
      upper = colours[group];
      document.querySelectorAll(".toNum")[place].innerHTML = `To ${upper}`;
      if(lower > colours[group]){
         //as above
         lower = colours[group];
         document.querySelectorAll(".drawNum")[place].innerHTML = `${document.querySelectorAll(".drawNum")[place].innerHTML.split(" ")[0]} ${lower}`;
      }
   }
   if(upper == colours[group]){
      //if upper is now equal to group number (which always happens if the above
      //statement was true), then remove its up arrows
      document.querySelectorAll(".high .upArrow")[place].classList.add("hidden");
      document.querySelectorAll(".high .upArrow")[place].dataset.reason = "Cannot draw more than the group has";
      if(lower == colours[group]){
         document.querySelectorAll(".low .upArrow")[place].classList.add("hidden");
      document.querySelectorAll(".low .upArrow")[place].dataset.reason = "Cannot draw more than the group has";
   }
      else{
         document.querySelectorAll(".low .upArrow")[place].classList.remove("hidden");
      }
   }
   else{
      document.querySelectorAll(".high .upArrow")[place].classList.remove("hidden");
      document.querySelectorAll(".low .upArrow")[place].classList.remove("hidden");
   }
   if(colours[group] == 0){//save lines of code by putting it at the end
      document.querySelectorAll(".high .downArrow")[place].classList.add("hidden");
      document.querySelectorAll(".high .downArrow")[place].dataset.reason = "Number drawn cannot be negative";
      document.querySelectorAll(".low .downArrow")[place].classList.add("hidden");
      document.querySelectorAll(".low .downArrow")[place].dataset.reason = "Number drawn cannot be negative";
   }

   //froculate
   calculate(document.querySelectorAll(".drawNum")[place].closest(".groupContainer").classList[1]);
}

document.querySelectorAll(".groupImageContainer")[0].onclick = function(){
   changeColour(this,0,rowGroups[0]%3+1);
}
document.querySelectorAll(".groupImageContainer")[1].onclick = function(){
   changeColour(this,1,6 - rowGroups[1] - rowGroups[2]); //maths things
}
document.querySelectorAll(".groupImageContainer")[2].onclick = function(){
   changeColour(this,2,6 - rowGroups[1] - rowGroups[2]);
}

document.querySelector(".deckEditor").onclick = function(){
   // preLoadDeck("deckEditor",deckID);
   checkSave("deckEditor");
}
document.querySelector(".mainMenu").onclick = function(){
   // var base_url = window.location.origin;
   // window.location = `${base_url}/home`;
   checkSave("home");
}

function displayChance(c,rowNum){
   var m = 2.5; //multiplier
   document.querySelectorAll(".chanceDisplayRow")[rowNum].innerHTML = `Chance: ${c}%`;
   //display chance
   if(c > 75){
      m -= (c-75)/20;
      //make greens appear darker
   }
   else if(c < 20){
      m-= (20-c)/20;
      //make reds appear darker
   }
   document.querySelectorAll(".chanceDisplayRow")[rowNum].style.color = `rgb(calc(${m}*(100 - ${c})),calc(${m} * ${c}),0)`;
   //starts of at red, as c -> 100 it becomes green
}



var factorials = [1];
var num = 1;
for(var x=1;x<60;x++){
   num = num * x;
   factorials.push(num);
}

function choose(n,r){
   return factorials[n] / (factorials[r]) / factorials[n-r];
}

//take an element that's inside a group container, return all the rows
//that are part of the container

//calculate the chance for a set of 1-3 rows
function calculate(groupNum){
   if(groupNum == "one"){
      var rowNums = [0];
   }
   else if (groupNum == "two"){
      var rowNums = [1,2];
   }
   else{
      var rowNums = [3,4,5];
   }

   var n = colours[0] + colours[1] + colours[2] + colours[3];//number in deck
   var c = handSize;//number in hand
   var perGroup = [];//number of cards per groups
   var draw = [];//minimum,maximum to draw from each group

   rowNums.forEach(function(rowNum){
      //rowNum = the row of one of the groups in question
      //rowGroups[rowNum] = the group of that row
      //colours[rowGroups[rowNum]] = the number of cards in that group
      perGroup.push(colours[rowGroups[rowNum]]);
      draw.push([
         parseInt(document.querySelectorAll(".drawNum")[rowNum].innerHTML.split(" ")[1]),
         parseInt(document.querySelectorAll(".toNum")[rowNum].innerHTML.split(" ")[1]),
      ])
      //the lower bound of that row, the upper bound of that row
   })

   var chance = 0.0;
   var r = perGroup[0]; //number of cards in the first group
   if (draw.length == 1){
     for (var d=draw[0][0];d<draw[0][1]+1;d++){
       if (d > r || n-r < c-d || d > c || r > n || c > n){
         continue;
       }
       chance += choose(n-r,c-d) * choose(r,d) / choose(n,c);
      }
   }
   else if(draw.length == 2){
     var r2 = perGroup[1] //number of cards in the second group
     for (var d = draw[0][0]; d <draw[0][1]+1; d++){
       for (var d2 = draw[1][0]; d2 <draw[1][1]+1; d2++){ //numbers for second group
         if(d>r || d2>r2 || n-r-r2 < c-d-d2 || d+d2>c || r+r2>n || c>n){
           continue;
         }
         chance += choose(n-r-r2,c-d-d2) * choose(r,d) * choose(r2,d2) / choose(n,c);
       }
     }
   }
//   #   elif len(draw) == 3:
// #     r2 = perGroup[1]
// #     r3 = perGroup[2]
// #     for d in range(draw[0][0],draw[0][1]+1):
// #       for d2 in range(draw[1][0],draw[1][1]+1):
// #         for d3 in range(draw[2][0],draw[2][1]+1):
// #           #0-0-0,0-0-1,0-0-2,0-1-0,0-1-1...
// #           if d>r or d2>r2 or d3>r3 or n-r-r2-r3 < c-d-d2-d3 or d+d2+d3>c or r+r2+r3>n or c>n:
// #             continue
// #             #as above

// #           chance += choose(n-r-r2-r3,c-d-d2-d3) * choose(r,d) * choose(r2,d2) * choose(r3,d3) / choose(n,c)
// #           #the formula for two at the same time
   else{
     var r2 = perGroup[1];
     var r3 = perGroup[2];
     for (var d = draw[0][0]; d <draw[0][1]+1; d++){
       for (var d2 = draw[1][0]; d2 <draw[1][1]+1; d2++){
         for (var d3 = draw[2][0]; d3 <draw[2][1]+1; d3++){
          if (d>r || d2>r2 || d3>r3 || n-r-r2-r3 < c-d-d2-d3 || d+d2+d3>c || r+r2+r3>n || c>n){
             continue;
          }
          chance+=choose(n-r-r2-r3,c-d-d2-d3) * choose(r,d) * choose(r2,d2) * choose(r3,d3) / choose(n,c);
         }
       }
     }
   }
   chance = Math.round(chance * 100000) / 1000;
   displayChance(chance,rowNums.length-1);
}


document.querySelector(".largeImage").onclick = function(){
   if(this.innerHTML.trim() !== ""){
      cardInfoDisplay(this.innerHTML.split("smallImages/")[1].split(".jpg")[0]);
   }
}
document.querySelector(".cardInfoDisplay .close").onclick = function(){
   cardInfoDisplay(false);
}

function save(){
   var out = []
   document.querySelectorAll(".mainDeckRow .smallImage").forEach(function(box){
      if (box.innerHTML.trim() !== ""){
      var group = (box.innerHTML.includes("group") ? parseInt(box.innerHTML.split("group")[1][0]) : 0);
      //if it has a group, find what comes after. if not, it's "0"
         out.push(group);
      }
   })
   var xml = new XMLHttpRequest();
   xml.open("POST","./chancesModeSaveGroups",true);
   //when it sends data, send it to the route @/chancesModeSaveGroups
   xml.setRequestHeader("Content-type","application/x-www-form-urlencoded");

   xml.send(JSON.stringify({"ID":deckID,"colours":out}));
   //send to back end
   xml.onload = function(){
      var response = JSON.parse(this.responseText);
      if(response === "Deck Saved!"){
         document.querySelector(".saveGroups").classList.remove("enabled");
         document.querySelector(".saveGroups").innerHTML = "Groups Saved!";
         alertBoxGreen("Groups saved!");
      }
      else{
         alertBox(response);
      }

   }
}

document.querySelector(".saveGroups").onclick = function(){
   if(this.classList.contains("enabled")){
      save();
   }
}

function checkSave(route){
   if(document.querySelector(".saveGroups.enabled") !== null && confirm("Save groups before leaving?")){
      save();
   }
   if(route == "home"){
      window.location = `${window.location.origin}/home`;
   }
   else{
   preLoadDeck("deckEditor",deckID);
   }
}



deckOptionsAddClick();
switchDeck();