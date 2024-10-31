# from calendar import c
# from contextlib import _RedirectStream
from flask import Flask, render_template, redirect, url_for, request, session, flash, jsonify
import sqlite3
import logIn
import random

#setup
import database

"""







THE ONLINE VERSION NEEDS TO BE COPIED HERE, SOME CHANGES HAVE BEEN MADE TO IT









"""
#reset database if needed
import time
cardInfo = database.cardDataSetup()
cachedData = []

# database.reset(cardInfo)

data = sqlite3.connect("database.db")
# print(data.execute("""SELECT * FROM likes""").fetchall())
#print(data.execute("""SELECT * FROM decks""").fetchall())
app = Flask(__name__)
app.secret_key = "hhabgggubttrbcdr"
#main

@app.route("/", methods = ["POST","GET"])
def slash():
  if "user" in session:
    return redirect(url_for("home"))
    #don't need to log in
  return render_template("login.html")

@app.route("/login", methods = ["POST","GET"])
def login():
  username,password,signup = request.get_json(force=True)
  # #print(username,password,signup)
  if signup: #if they are signing up
    if "signedUp" in session:
      return jsonify("You have already signed up")
    x = logIn.sign(username.strip(),password.strip(),sqlite3.connect("database.db"))
    if isinstance(x,int):
      session["signedUp"] = True
  else:
    if "loggedIn" in session and session["loggedIn"] == 5:
      return jsonify("You have tried to log in too many times")
    x = logIn.log(username.strip(),password.strip(),sqlite3.connect("database.db"))
  if isinstance(x,int):
    session["user"] = x
    #logged in/signed up successfully
  else:
    if "loggedIn" not in session:
      session["loggedIn"] = 0
    session["loggedIn"] += 1
  #could be an error
  return jsonify(x)

@app.route("/home", methods = ["POST","GET"])
def home():
  if "user" in session:
    return render_template("home.html",user=session["user"],data=sqlite3.connect("database.db"))
  return redirect(url_for("slash")) #if not logged in

@app.route("/logout", methods = ["POST","GET"])
def logout():
  session.clear()
  return redirect(url_for("slash"))

@app.route("/help")
def help():
  return render_template("help.html")

@app.route("/deckEditor", methods = ["POST","GET"])
def deckEditor():
  if "user" not in session:
    return redirect(url_for("slash"))

  data = sqlite3.connect("database.db")
  decks = data.execute("SELECT ID,name,legal FROM decks WHERE userID = ?",[session["user"]]).fetchall()
  #e.g [(1,"deck1",true),(2,"deck2",false)]
  #all the decks that the user has
  #print(decks)

  return render_template("deckEditor.html", decks = decks, deckID = session.pop("preLoadDeck",[""])[0])

@app.route("/deckEditorSwitchDeck", methods = ["POST","GET"])
def deckEditorSwitchDeck():
  deckID = request.get_json(force=True)
  #print(deckID) #a deck ID
  data = sqlite3.connect("database.db")
  if data.execute("SELECT userID FROM decks WHERE ID = ?",[deckID]).fetchall() != [(session["user"],)]:
    return "error"

  deckList = database.getDeckCards(cardInfo,data,deckID)
  deckList["legal"] = data.execute("SELECT legal FROM decks WHERE ID = ? AND userID = ?",[deckID,session["user"]]).fetchall()[0][0]

  return jsonify(deckList)

@app.route("/deckEditorSearch", methods = ["POST","GET"])
def deckEditorSearch():
  formRequest = request.get_json(force=True)
  #print(formRequest)

  global cardInfo, cachedData

  cachedData,searchResult = database.search(cachedData,formRequest["filters"],cardInfo)
  maxPages = 1 + (len(searchResult)-1)//20
  pageNumber = int(formRequest["pageNumber"])
  if pageNumber < 0:
    pageNumber = 1
  if pageNumber > maxPages:
    pageNumber = maxPages

  searchResult = searchResult[20*(pageNumber-1):20*(pageNumber)]
  limitedCards = {}
  for card in searchResult:
    if cardInfo[card]["format"] != "TCG":
      limitedCards[card] = cardInfo[card]["format"]
      #if it is not out yet
    elif cardInfo[card]["limit"] != 3:
      limitedCards[card] = cardInfo[card]["limit"]
      #if it is restricted

  searchResultToJson = {"data":searchResult,"pageNumber":pageNumber,"maxPages":maxPages,"limitedCards":limitedCards}
  return jsonify(searchResultToJson)

@app.route("/deckEditorSave", methods = ["POST","GET"])
def deckEditorSave():
  formRequest = request.get_json(force=True)
  #print(formRequest)

  if "delete" in formRequest:
    return jsonify(database.deleteDeck(
      int(formRequest["deckID"]),
      session["user"]
    ))

  return jsonify(database.updateDeck(
    formRequest["main"],
    formRequest["extra"],
    formRequest["side"],
    int(formRequest["deckID"]), #False if a new deck
    session["user"],
    formRequest["newDeckName"], #False if not renaming a deck
    cardInfo
  ))
  #will return a dictionary of status, maybe message, maybe deckID

@app.route("/exportDeck", methods = ["POST","GET"])
def exportDeck():
  deckList = request.get_json(force=True)

  #for each of main,extra,side
  #start with #main
  #the a line for each card ID
  fileContent = "\n".join(["#"+deck+"\n" + "\n".join([str(cardInfo[card]["cardID"]) if card in cardInfo else "*error*" for card in deckList[deck]]) for deck in ["main","extra","side"]]).replace("#side","!side")
  # if "#extra\n\n" in fileContent:
  fileContent = fileContent.replace("#extra\n\n","#extra\n")
  fileContent = fileContent + "\n"
  if "*error*" in fileContent: #if a card doesn't exist
    return "error"
  print(fileContent)

  return jsonify(fileContent)

@app.route("/publishDeck", methods = ["POST","GEt"])
def publishDeck():
  deckID = request.get_json(force=True)
  if deckID == 0:
    return "not saved"
  return jsonify(database.publishDeck(deckID,session["user"]))

@app.route("/preLoadDeck", methods = ["POST","GET"])
def preLoadDeck():
  data = sqlite3.connect("database.db")
  deckID = request.get_json(force=True)
  if deckID == 0:
    #if they aren't on a deck but do have one, load their first deck
    deck = data.execute("SELECT ID FROM decks WHERE userID = ?",[session["user"]]).fetchone()
    if deck != None:
      session["preLoadDeck"] = deck
      return "good"
    #they have no decks
    return "bad"

  #if they are in the deck editor
  deck = data.execute("SELECT ID FROM decks WHERE ID = ? AND userID = ?",[deckID,session["user"]]).fetchone()
  #print(deck)
  if deck != None:
    session["preLoadDeck"] = deck
    return "good"
  #they altered the javascript
  return "bad"


@app.route("/chancesMode", methods = ["POST","GET"])
def chancesMode():
  if "user" not in session:
    return redirect(url_for("slash"))

  data = sqlite3.connect("database.db")

  decks = data.execute("SELECT ID,name FROM decks WHERE userID = ?",[session["user"]]).fetchall()
  #e.g [(1,"deck1"),(2,"deck2")]
  if decks != None:
    return render_template("chancesMode.html",decks = decks, deckID = session.pop("preLoadDeck",[""])[0])
  return redirect(url_for("slash"))


@app.route("/chancesModeSwitchDeck", methods = ["POST","GET"])
def chancesModeSwitchDeck():
  deckID = request.get_json(force=True)

  data = sqlite3.connect("database.db")
  info = data.execute("SELECT userID,name FROM decks WHERE ID = ?",[deckID]).fetchall()
  if info[0][0] != session["user"]:
    return "error"
  deckList = data.execute("SELECT cardID,idx,colour FROM cardInstances WHERE deckID = ?",[deckID]).fetchall()
  #tuple of all the cards in that deck, first the card ID then the index

  main,colours = [],[]
  for card in deckList:
    if card[1] < 60:    #first 60 main
      main.append(card[0])
      colours.append(card[2]) #the colour

  return jsonify({"main":main,"groups":colours,"name":info[0][1]})

# @app.route("/chancesModeCalculate", methods = ["POST","GET"])
# def chancesModeCalculate():
#   calcInfo = request.get_json(force=True)
#   #print(calcInfo)
#   chance = database.calculateChances(calcInfo["deck"],calcInfo["hand"],calcInfo["perGroup"],calcInfo["draw"])
#   return jsonify(chance)

@app.route("/chancesModeSaveGroups", methods = ["POST","GET"])
def chancesModeSaveGroups():
  req = request.get_json(force=True)
  return jsonify(database.chancesModeSaveGroups(req["ID"],req["colours"],session["user"]))


@app.route("/decks", methods = ["POST","GET"])
def decks():#insert the card it's looking for into the search bar
  return render_template("decks.html",search = session.pop("searchForDecksWith",""))

@app.route("/searchForDecksWith", methods = ["POST","GET"])
def searchForDecksWith():
  cardID = str(request.get_json(force=True))
  if cardID in cardInfo:
    session["searchForDecksWith"] = cardInfo[cardID]["name"]
    #the name to be put in the search bar
    return "good"
  return "bad"

@app.route("/deckSearch", methods = ["POST","GET"])
def deckSearch():
  req = request.get_json(force=True)
  #print(req)

  req["user"] = session["user"] if "user" in session else 0
  if "card" in req:
    req["cardInfo"] = cardInfo

  deck = database.searchDecks(req)
  # #print(deck)
  if deck[1] == "No results!":
    return {"message":"No results!"}

  deckList = database.getDeckCards(cardInfo,sqlite3.connect("database.db"),deck[0][0])
  deckList["message"] = deck[1]
  deckList["deckNumber"] = req["number"]
  deckList["name"] = deck[0][1]
  deckList["likes"] = deck[0][2]
  deckList["user"] = deck[0][3]
  deckList["ID"] = deck[0][0]
  deckList["liked"] = sqlite3.connect("database.db").execute("SELECT userID FROM likes WHERE deckID = ? AND userID = ?",[deck[0][0],session["user"]]).fetchone() != None if "user" in session else 0
  #print(deckList)
  return jsonify(deckList)

@app.route("/savePublicDeck", methods = ["POST","GET"])
def savePublicDeck():
  req = request.get_json(force=True)
  #print(req)
  msg = database.savePublicDeck(req["name"],req["ID"],session["user"] if "user" in session else 0)
  return jsonify(msg)

@app.route("/likeDeck", methods = ["POST","Get"])
def likeDeck():
  deckID = request.get_json(force=True)
  if "user" not in session:
    return [0,"Please log in first"]
  return jsonify(database.likeDeck(deckID,session["user"]))

@app.route("/cards/<id>")
def getCard(id):
  if id in cardInfo:
    return jsonify(cardInfo[id])
  return jsonify(False)

@app.route("/testArena")
def testArena():
  id = session.pop("preLoadDeck",[0])[0]
  if "user" not in session:
    return redirect(url_for("slash"))
  if id == 0:
    data = sqlite3.connect("database.db")
    id = data.execute("""SELECT ID FROM decks WHERE userID = ?""",[session["user"]]).fetchone()
    if id == None:
      return redirect(url_for("slash"))
    id = id[0]



  #assume the value is correct otherwise preLoadDeck would be 0
  return render_template("testArena.html", deckID = id)

@app.route("/testArenaGetDeck", methods = ["POST","GET"])
def testArenaGetDeck():
  id = request.get_json(force=True)
  #print(id) #a deck ID
  data = sqlite3.connect("database.db")

  deck = data.execute("""SELECT cardInstances.cardID,cardInstances.idx FROM decks
  INNER JOIN cardInstances ON decks.ID = cardInstances.deckID
  WHERE decks.ID = ? AND decks.userID = ?""",[id,session["user"]]).fetchall()
  #empty if deck doesn't (exist and) belong to the user
  #otherwise a list, each is (id,index)
  if deck == []:
    return "error"

  main,extra,types,subtypes = [[],[],{},{}]
  for card in deck:
    if card[1] < 60:
      types[card[0]] = cardInfo[card[0]]["cardType"]
      subtypes[card[0]] = cardInfo[card[0]]["subtype"].split(" ")[0]
      main.append(card[0])
    elif card[1] < 75:
      types[card[0]] = "extra"
      subtypes[card[0]] = cardInfo[card[0]]["subtype"].split(" ")[0]
      extra.append(card[0])
  random.shuffle(main)
  #print({"main":main,"extra":extra,"types":types,"subtypes":subtypes})
  return jsonify({"main":main,"extra":extra,"types":types,"subtypes":subtypes})

@app.route("/testArenaShuffle", methods = ["POST","GET"]) #shuffle the list
def testArenaShuffle():
  cards = request.get_json(force=True)
  random.shuffle(cards)
  return jsonify(cards)

