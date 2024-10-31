function login(usr,pw,sign){
   //POST username and password
   var xml = new XMLHttpRequest();
   xml.open("POST","./login",true);
   //when it sends data, send it to the route @/chancesModeCalculate
   xml.setRequestHeader("Content-type","application/x-www-form-urlencoded");

   xml.onload = function(){
      var result = JSON.parse(this.responseText);
      if(parseInt(result)){
         //if it's a number, logged in
         var base_url = window.location.origin;
         window.location = `${base_url}/home`;
      }
      else{
         //error message
         alertBox(result);
      }
   }
   if(!usr.trim()){
      alertBox("Please enter a username");
      return;
   }
   if(!pw.trim()){
      alertBox("Please enter a password");
      return;
   }
   if(usr.includes(">") || usr.includes("<")){
      alertBox("Invalid username");
      return;
   }
   if(pw.includes(">") || pw.includes("<")){
      alertBox("Invalid username");
      return;
   }
   xml.send(JSON.stringify([usr,pw,sign]));
}

document.querySelector(".logButton.login").onclick = function(){
   login(document.querySelector(".inputBox[name=username]").value,document.querySelector(".inputBox[name=password]").value,false);
   //username , password
}

document.querySelector(".logButton.signup").onclick = function(){
   login(document.querySelector(".inputBox[name=username]").value,document.querySelector(".inputBox[name=password]").value,true);
   //username , password, true means it is trying to sign up
}
document.querySelector(".inputBox[name=username]").onkeydown = function(e){
    if(e.keyCode==13){
        login(document.querySelector(".inputBox[name=username]").value,document.querySelector(".inputBox[name=password]").value,false);
    }
}

document.querySelector(".inputBox[name=password]").onkeydown = function(e){
    if(e.keyCode==13){
        login(document.querySelector(".inputBox[name=username]").value,document.querySelector(".inputBox[name=password]").value,false);
    }
}
