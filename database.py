import sqlite3
import random
import requests
import os.path
import time
def dict_factory(cursor,row):
  d={}
  for idx,col in enumerate(cursor.description):
    d[col[0]] = row[idx]
  return d

data = sqlite3.connect("database.db")
data.row_factory = dict_factory



def reset(cardInfo):
  '''Resets the database information'''
  import hashlib
  data.execute("DROP TABLE users")
  data.execute("DROP TABLE decks")
  data.execute("DROP TABLE cardInstances")
  # data.execute("DROP TABLE publicDecks")
  # data.execute("DROP TABLE publicCardInstances")
  # data.execute("DROP TABLE likes")

  data.execute("""CREATE TABLE if not exists users
  (ID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL);""")

  data.execute("""CREATE TABLE if not exists decks
  (ID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  userID INTEGER NOT NULL,
  name TEXT NOT NULL,
  legal BOOLEAN NOT NULL);""")

  data.execute("""CREATE TABLE if not exists cardInstances
  (cardID TEXT NOT NULL,
  deckID INTEGER NOT NULL,
  idx INTEGER NOT NULL,
  colour INTEGER DEFAULT 0);""")

  data.execute("""CREATE TABLE if not exists publicDecks
  (ID INTEGER PRIMARY KEY NOT NULL,
  userID INTEGER NOT NULL,
  name TEXT NOT NULL,
  likes INTEGER DEFAULT 0);""")

  data.execute("""CREATE TABLE if not exists publicCardInstances
  (cardID TEXT NOT NULL,
  deckID INTEGER NOT NULL,
  idx INTEGER NOT NULL);""")

  data.execute("""CREATE TABLE if not exists likes
  (deckID INTEGER NOT NULL,
  userID INTEGER NOT NULL);""")
  data.commit()
  return
  data.execute("INSERT INTO users(name,password) VALUES(?,?)",["ben",hashlib.sha256(bytes('1',encoding="utf-8")).hexdigest()])
  data.execute("INSERT INTO decks(userID,name,legal) VALUES(?,?,?)",[1,"deck1",False,1])


  main = ['2511', '10000', '27551', '32864', '35699', '39015', '41546', '41777', '44818', '50755', '56889', '62121','96540']
  extra = ['97584719','97584719']
  side = ['10000','10000','97584719']
  data.commit()
  print(updateDeck(main,extra,side,1,1,False,cardInfo))

def cardDataSetup():
  '''Set up data from the API and check for new images'''
  jrfeuifhnpoi = time.time()
  databaseInfo = requests.get("https://db.ygoprodeck.com/api/v7/cardinfo.php?misc=yes").json()["data"]
  print("API RESPONSE TIME: {:0.3f} SECONDS".format(time.time()-jrfeuifhnpoi))
  cardInfo = {}
  #cardInfo will be a dicitonary of dicitonaries - each key will correspond to the card art's ID,
  #meaning a card with multiple artworks has multiple entries. in each entry will have all the card's info:
  #monsters: card id,type,name,desc,subtype,type,attribute,level,atk,def,legality
  #spells/traps: card id,type,name,desc,subtype,legality
  bans = {"Banned":0,"Limited":1,"Semi-Limited":2, "Forbidden":0}
  for card in databaseInfo:
    if "OCG" not in card["misc_info"][0]["formats"] and "TCG" not in card["misc_info"][0]["formats"]:
      continue
    for art in card["card_images"]:
      id = str(art["id"])
      cardInfo[id] = {}
    #   id=34541863
    #   if os.path.isfile(f"./static/images/largeImages/{int(id)}.jpg"):
    #     print("h")
    #   else:
    #     exit()
      if False and not os.path.isfile(f"./static/images/smallImages/{int(id)}.jpg"):

        #if the card's image isn't in my database - because it is new

        print(f"new {id} {card['name']}")

        img = requests.get(art["image_url_small"], allow_redirects=True)
        open(f"./static/images/smallImages/{int(id)}.jpg","wb").write(img.content)
        #adds the image
        time.sleep(0.6) #don't want to get IP banned for too many requests
        # img = requests.get(art["image_url"], allow_redirects=True)
        # open(f"./static/images/largeImages/{int(id)}.jpg","wb").write(img.content)
        # time.sleep(0.6)
        # exit()
      if "Monster" not in card["type"]: #spell or trap
        cardInfo[id] = {
          "cardID":card["id"],
          "cardType":card["type"].split()[0].lower(), #spell or trap
          "name":card["name"],
          "desc":card["desc"],
          "subtype":card["race"].lower(),
          "format": "TCG" if "TCG" in card["misc_info"][0]["formats"] else "OCG",
          "limit": 3 if "TCG" in card["misc_info"][0]["formats"] else 0
          #if the card is allowed to be used in tournament play in the UK
        }
      else: #monsters
        cardInfo[id] = {
          "cardID":card["id"],
          "cardType":"monster",
          "name":card["name"],
          "desc":card["desc"],
          "subtype":card["type"].replace("Monster","").lower(),
          "type":card["race"].lower(),
          "attribute":card["attribute"].lower(),
          "atk":card["atk"],
          "format": "TCG" if "TCG" in card["misc_info"][0]["formats"] else  "OCG",
          "limit": 3 if "TCG" in card["misc_info"][0]["formats"] else 0
        }
        if "level" in card:
          cardInfo[id]["level"] = card["level"]
          cardInfo[id]["def"] = card["def"]
        elif "rank" in card:
          cardInfo[id]["level"] = card["rank"]
          cardInfo[id]["def"] = card["def"]
        else:
          cardInfo[id]["level"] = card["linkval"]
        if "fusion" in cardInfo[id]["subtype"] or "synchro" in cardInfo[id]["subtype"] or "xyz" in cardInfo[id]["subtype"] or "link" in cardInfo[id]["subtype"]:
          cardInfo[id]["extraDeck"] = True
        if "pendulum" in cardInfo[id]["subtype"]:
          desc = card["desc"].replace("[ Flavor Text ]","[ Monster Effect ]").replace("\r\n----------------------------------------\r\n","").replace("[ Pendulum Effect ]","").split("[ Monster Effect ]")
          if len(desc) == 2:
            cardInfo[id]["pend"] = desc[0]
            cardInfo[id]["desc"] = desc[1]
          if "scale" not in card:
            cardInfo[id]["scale"] = 0
          else:
            cardInfo[id]["scale"] = card["scale"]
      if "banlist_info" in card and "ban_tcg" in card["banlist_info"]:
        cardInfo[id]["limit"] = bans[card["banlist_info"]["ban_tcg"]]
      if "card_sets" in card:
        prints = []
        for set in card["card_sets"]:
          prints.append([set["set_name"],set["set_code"],set["set_rarity"]])
          # if len(card["card_sets"]) == 1 and (set["set_code"][:4] == "DABL"):
          # #for enter sets to reset their images ince they came out
          #   img = requests.get(art["image_url"], allow_redirects=True)
          #   # print(f"new {id}")
          #   open(f'./project/static/images/largeImages/{id}.jpg',"wb").write(img.content)
          #   time.sleep(0.6)
        cardInfo[id]["printings"] = prints
        #if the card has restrictions, add them on
      # ocg+= str(card["misc_info"][0]["formats"])+"\n"
  # open("./project/ocg.txt","w").write(ocg)
  #add the list of ocg cards back to file

  # import json
  # with open('info.json', 'w', encoding='utf-8') as f:
  #   json.dump(cardInfo, f, ensure_ascii=False, indent=4)
  return cardInfo



def getDeckCards(cardInfo,data,deckID,public=False):
  '''Get a list of main, extra, side, restricted cards from the deck
  data is the SQLite connection'''
  if public:
    deckList = data.execute("SELECT cardID,idx FROM publicCardInstances WHERE deckID = ?",[deckID]).fetchall()
  else:
    deckList = data.execute("SELECT cardID,idx,colour FROM cardInstances WHERE deckID = ?",[deckID]).fetchall()

  main,extra,side,limitedCards = [[],[],[],{}]
  for card in deckList:
    if cardInfo[card[0]]["format"] != "TCG":
      limitedCards[card[0]] = cardInfo[card[0]]["format"]
      #if it is not out yet
    elif cardInfo[card[0]]["limit"] != 3:
      limitedCards[card[0]] = cardInfo[card[0]]["limit"]
      #if it is restricted
    if card[1] < 60:    #first 60 main
      main.append(card[0])
    elif card[1] < 75:    #next 15 extra
      extra.append(card[0])
    else:    #last 15 side
      side.append(card[0])
  return {"main":main,"extra":extra,"side":side,"limitedCards":limitedCards}

def search(cachedData,filters,data):
  '''Search with these filters using the stored ones to help, returns a list of image IDs
  cachedData: all previous filters and their results
  data: SQL connection'''
  #cachedData will be a list of dictionaries, each of which has
  #filters
  #results that match
  #number of pages (20) it would take to display

  start = time.time()
  lenCachedFilters = []
  #stores the length of data for each cached filter. if it is incompatible with new filter, legth is ~12000

  if len(cachedData) != 0:
    for i in range(len(cachedData)):
      cFilters = cachedData[i]["filters"]
      #e.g {"name":"blue","level",8,"type":"dragon"}

      if cFilters == filters:
        #done this exact search before
        print("time taken (match)",time.time() - start)
        return [cachedData,cachedData[i]["data"]]

      lenCachedFilters.append(len(cachedData[i]["data"]))
      #number of results for that filter

      for cFilter in cFilters:
        #e.g "name"

        #about to check for all sources of not matching
        if cFilter not in filters:
          lenCachedFilters[-1] = len(data)
          break
        elif (cFilter == "name" or cFilter == "desc"):
          if cFilters[cFilter] not in filters[cFilter]:
            #e.g cFilters["name"] = "blue" but they only searched "bl", not applicable
            lenCachedFilters[-1] = len(data)
            break
        elif cFilters[cFilter] != filters[cFilter]:
          lenCachedFilters[-1] = len(data)
          break

        #as the lenChachedFilters already added the number of results,
        #that doesn't need to happen here. If it didn't match,
        #it would have already been changed to ~12000

    if min(lenCachedFilters) < len(data):
      #one of the filters applied to the search
      dataIDs = cachedData[lenCachedFilters.index(min(lenCachedFilters))]["data"]
      #dataIDs is a list of all card (image) IDs that may apply
      #set the data to search equal to the data of the corresponding filter - all results will be here
    else:
      dataIDs = list(data.keys())
  else:
    dataIDs = list(data.keys())


  print("length of data searching through",len(dataIDs))

  #now search through data by checking all IDs that are in dataIDs - all IDs that could apply
  outputIDs = []
  for id in dataIDs:
    check = True
    card = data[id]
    for filter in filters:
      #about to check for all sources of not matching
      if filter not in card:
        #card does not have required property
        check = False
        break
      elif filter == "name" or filter == "desc" or filter == "subtype":
        if filters[filter] not in card[filter].lower():
          #same as the filter check system
          check = False
          break
      # elif filter == "name":
      #   if tempName not in card["name"].lower():
      #     check = False
      #     break
      elif filters[filter] != card[filter]:
        #wrong level or type...
        check = False
        break
    #if it reaches here, it has passed all the filters and matches
    if check and (card["format"] == "TCG" or card["format"] == "OCG"):
      outputIDs.append(id)

  # cachedFilters.append(filters)
  if "name" not in filters or len(filters["name"]) < 6:
    cachedData.append({"filters":filters,"data":outputIDs})
  #add the new filters and applicable data to the cache

  print("time taken", time.time() - start)
  # print("length of results",len(outputIDs))
  # print("amount",len(cachedData))
  return [cachedData,outputIDs]

def validateDeck(main,extra,side,cardInfo):
  '''Check a deck is legal before saving it'''
  cardNames = {}
  #creates a dictionary with name as the key and
  #number of appearances as the info
  if len(main) < 40:
    return {"status":"illegal","message":"main deck too short"}
  for deck in [main,extra,side]:
    #do the following with main, then extra, then side
    for card in deck:
      # print(card)
      # print(cardInfo[card])
      name = cardInfo[card]["name"]
      #name of the card
      if name not in cardNames:
        cardNames[name] = 0
      cardNames[name] += 1
      if cardNames[name] > cardInfo[card]["limit"]:
        #more appear in the deck than allowed
        return {"status":"illegal","message":"too many of a restriced card"}
      elif cardNames[name] > 3:
        return {"status":"illegal","message":"too many of an unrestriced card"}

  #if it got here then no problems with too many cards
  return {"status":"legal"}

def updateDeck(main,extra,side,deckID,userId,newDeckName,cardInfo):
  '''Update this deck maybe with a new name'''
  #deckID can be 0 if new. newDeckName can be false if not renaming/creating a new deck
  response = {}
  #status is either legal, illegal, error
  #message
  #deckID

  #the following cases of illegal decks are checked before because
  #they will not be saved
  if main == [] and extra == [] and side == []:
    return {"status":"error","message":"Empty deck"}
  elif len("main") > 60:
    return {"status":"error","message":"Main deck too long"}
  elif len("extra") > 15:
    return {"status":"error","message":"Extra deck too long"}
  elif len("side") > 15:
    return {"status":"error","message":"Side deck too long"}

  data = sqlite3.connect("database.db")

  if deckID > 0 and len(data.execute("SELECT * FROM decks WHERE ID = ? AND userID = ?",[deckID,userId]).fetchall()) != 1:
    return {"status":"error","message":"Deck appears not to match user"}
    #check the deck belongs to user - user could have manipulated javaScript

  if newDeckName: #renaming or creating a new deck
    if newDeckName.strip().lower() == "new deck" or newDeckName.strip() == "" or len(newDeckName) > 30 or ">" in newDeckName or "<" in newDeckName or "=" in newDeckName:
      return {"status":"error","message":"Invalid deck name"}
    if (newDeckName,) in data.execute("SELECT name FROM decks WHERE ID != ? AND userID = ?",[deckID,userId]).fetchall():
      return {"status":"error","message":"You have another deck under that name"}

    if deckID == 0:
      #add a new deck
      data.execute("INSERT INTO decks(userId,name,legal) VALUES (?,?,?)",[userId,newDeckName.strip(),True])
      deckID = data.execute("SELECT last_insert_rowid()").fetchone()[0]
    else:
      data.execute("UPDATE decks SET name = ? WHERE ID = ? AND userID = ?",[newDeckName.strip(),deckID,userId])
      #change deck name (to implement)
    data.commit()
  #delete the cards from the deck and re-insert them

  response = validateDeck(main,extra,side,cardInfo)
  #check for cases of too many restricted cards
  #done after previous checks because this will not prevent saving
  if response["status"] == "illegal":
    data.execute("UPDATE decks SET legal = ? WHERE ID = ?",[False,deckID])
  else:
    data.execute("UPDATE decks SET legal = ? WHERE ID = ?",[True,deckID])

  data.execute("DELETE FROM cardInstances WHERE deckID = ?",[deckID])

  sqlStatement = ["INSERT INTO cardInstances(cardID, deckID, idx) VALUES",[]]
  #base statement to be added to

  for x in range(len(main)):
    #main index 0-59
    sqlStatement[0] += "(?,?,?),"
    sqlStatement[1] += [main[x],deckID,x]
    #cardID is main[x], deckID is deckID, idx is x
  for x in range(len(extra)):
    #extra index 60-74
    sqlStatement[0] += "(?,?,?),"
    sqlStatement[1] += [extra[x],deckID,x+60]
  for x in range(len(side)):
    #side index 75-89
    sqlStatement[0] += "(?,?,?),"
    sqlStatement[1] += [side[x],deckID,x+75]
  # print(sqlStatement)
  #remove last character from the statement
  data.execute(sqlStatement[0][:-1],sqlStatement[1])
  data.commit()


  response["deckID"] = int(deckID)

  return response

def deleteDeck(deckID,userId):
  '''Delete this deck'''
  data = sqlite3.connect("database.db")
  if len(data.execute("SELECT * FROM decks WHERE ID = ? AND userID = ?",[deckID,userId]).fetchall()) != 1:
    return "Error: Deck seems to not match user"
  data.execute("DELETE FROM cardInstances WHERE deckID = ?",[deckID])
  data.execute("DELETE FROM publicCardInstances WHERE deckID = ?",[deckID])
  data.execute("DELETE FROM decks WHERE ID = ?",[deckID])
  data.execute("DELETE FROM publicDecks WHERE ID = ?",[deckID])
  data.execute("DELETE FROM likes WHERE deckID = ?",[deckID])
  data.commit()
  return 0

"""def calculateChances(n,c,perGroup,draw):

#   '''Chance of drawing from the groups in a deck
#   n: deck size
#   c: hand size
#   perGroup: List of how many cards in each group
#   draw: 2d list, first index is min and max for first group...'''
#   chance = 0
#   r = perGroup[0] #number of cards in the first group
#   if len(draw) == 1:
#     for d in range(draw[0][0],draw[0][1]+1):
#       #draw[0][0] is the minimum to draw from the first group. draw[0][1] is the max
#       #from min to max, add up the chances of drawing exactly that many from the group
#       if d > r or n-r < c-d or d > c or r > n or c > n:
#         continue
#         #if d > r, the number drawn from the group would be more than in the group (inverse of below)
#         #if n-r < c-d, the number drawn not from the group would be more than the number not in the group
#         #if d > c, the number drawn from the group would be more than the hand
#         #if c > n, drawing more than the entire deck
#         #if r > n, more in the group than in the deck
#         #all of these can alternatively be found by looking at the equation and what would cause errors


#       chance += choose(n-r,c-d) * choose(r,d) / choose(n,c)
#       #the formula
#       #split the hand into two 'hands', one with d cards from the group, one with c-d cards not from the group
#       #r choose d is the number of possibilities for "hand 1"
#       #n-r choose c-d is the number of possibilities for "hand 2"
#       #and n choose c is the number of total hands that exists
#   elif len(draw) == 2:
#     r2 = perGroup[1] #number of cards in the second group
#     for d in range(draw[0][0],draw[0][1]+1):
#       for d2 in range(draw[1][0],draw[1][1]+1): #numbers for second group
#         #draw 0 red and 0 yellow, then 0 red and 1 yellow, then 0-2,1-0,1-1,1-2...
#         if d>r or d2>r2 or n-r-r2 < c-d-d2 or d+d2>c or r+r2>n or c>n:
#           continue
#           #using the numbers inside of choose functions (where left side >= right side and both >0)
#           #to determine what needs to be true for a real value
#           #one more condition because of the additional choose function

#         chance += choose(n-r-r2,c-d-d2) * choose(r,d) * choose(r2,d2) / choose(n,c)
#         #the formula for two at the same time
#   elif len(draw) == 3:
#     r2 = perGroup[1]
#     r3 = perGroup[2]
#     for d in range(draw[0][0],draw[0][1]+1):
#       for d2 in range(draw[1][0],draw[1][1]+1):
#         for d3 in range(draw[2][0],draw[2][1]+1):
#           #0-0-0,0-0-1,0-0-2,0-1-0,0-1-1...
#           if d>r or d2>r2 or d3>r3 or n-r-r2-r3 < c-d-d2-d3 or d+d2+d3>c or r+r2+r3>n or c>n:
#             continue
#             #as above

#           chance += choose(n-r-r2-r3,c-d-d2-d3) * choose(r,d) * choose(r2,d2) * choose(r3,d3) / choose(n,c)
#           #the formula for two at the same time
#   #round to 3dp
#   chance = str(f"{chance*100:0.3f}")
#   while chance[-1] == "0":
#     chance = chance[:-1]
#   return chance if chance[-1] != "." else chance[:-1]#if it ends in a . then remove it
  return"""

def searchDecks(*req):
  '''Search for public decks with these requirements'''
  req = req[0] #a dictionary, with potential arguments:
  #name: include decks with this in their name
  #card: decks with a card with this in its name
  #cardInfo: for determining cards names
  #legal: true means only legal decks
  #user: the online user, ~~don't show them their own decks~~
  #sort: random
  #number: which deck (4 means fifth deck)

  # print(req) #NOT WHEN CARD IS A FILTER!!!
  data = sqlite3.connect("database.db")
  #INNER JOIN cardInstances ON cardInstances.deckID = decks.ID
  statement = ["""SELECT publicDecks.ID,publicDecks.name,publicDecks.likes,users.name FROM publicDecks
  INNER JOIN users
  ON publicDecks.userID = users.ID""",[]]
  if "name" in req:
    statement[0]+=" AND publicDecks.name LIKE ?"
    statement[1].append("%{}%".format(req["name"]))
  if "searchUser" in req:
    statement[0] += " AND users.name LIKE ?"
    statement[1].append("%{}%".format(req["searchUser"]))
  if "legal" in req: #add this to the SQL query
    statement[0]+=" INNER JOIN likes ON likes.deckID = publicDecks.ID WHERE likes.userID = ?"
    statement[1].append(req["user"])
    #means the name parameter can appear anywhere in the deck's name
  decks = data.execute(statement[0],statement[1]).fetchall()
  print("decks",decks)
  #list of deck IDs

  tempDecks = []
  if "card" in req:
    for deck in decks:
      cards = data.execute("SELECT cardID FROM publicCardInstances WHERE deckID = ?",[deck[0]]).fetchall()
      for card in cards:
        if req["card"].lower() in req["cardInfo"][card[0]]["name"].lower():
          tempDecks.append(deck)
          break
    decks = tempDecks

  if len(decks) == 0:
    return [0,"No results!"]
  if "sort" in req and req["sort"] == "random":
    return [decks[random.randint(0,len(decks)-1)],"random"]

  if req["number"]>=len(decks)-1:
    return [decks[-1],"Last deck"]
  return [decks[req["number"]],"fine"]

def savePublicDeck(name,ID,user):
  '''Save someone else's deck
  name: the name it's saved under
  ID: the ID of the deck being copied
  user: the ID of the current user'''
  if user == 0:
    return "Not logged in!"
  if name.strip() == "" or name.strip().lower() == "new deck" or len(name) > 30 or ">" in name or "<" in name or "=" in name:
    return "Invalid name"
  data = sqlite3.connect("database.db")

  if (name,) in data.execute("SELECT name FROM publicDecks WHERE userID = ?",[user]).fetchall():
    #they already have a deck under that name
    return "You already have a deck called that"

  #find out the creator and legality of the deck
  if data.execute("SELECT userID FROM publicDecks WHERE ID = ?",[ID]).fetchone() == None:
    return "Deck seems to not exist"

  #get the cards
  cards = data.execute("SELECT cardID,idx FROM publicCardInstances WHERE deckID = ?",[ID]).fetchall()
  if cards == []:
    #should not happen but just in case an empty deck is saved
    return "Deck seems to not exist"

  data.execute("INSERT INTO decks(userID,name,legal) VALUES (?,?,?)",[user,name,1])
  #create the deck
  ID = data.execute("SELECT last_insert_rowid()").fetchone()[0]
  #now the ID of the new deck

  statement = [f"INSERT INTO cardInstances(cardID,deckID,idx) VALUES {','.join(['(?,?,?)' for x in cards])}",[]]
  for x in cards:
    #add card ID, deck ID, index
    statement[1] += [x[0],ID,x[1]]

  data.execute(statement[0],statement[1])
  data.commit()
  return f"{name} saved successfully!"

def chancesModeSaveGroups(ID,groups,user):
  data = sqlite3.connect("database.db")
  print(len(groups))
  if len(data.execute("SELECT * FROM decks WHERE ID = ? AND userID = ?",[ID,user]).fetchall()) != 1:
    return "Error: Deck does not match user"
  if len(data.execute("SELECT * FROM cardInstances WHERE deckID = ? AND idx < 60",[ID]).fetchall()) != len(groups):
    return "Error: Wrong amount of cards"

  for x in range(len(groups)):
    data.execute("UPDATE cardInstances SET colour = ? WHERE deckId = ? AND idx = ?",[groups[x],ID,x])

  data.commit()
  print(data.execute("SELECT * FROM cardInstances WHERE deckID = ?",[ID]).fetchall())
  return "Deck Saved!"

def publishDeck(deckID,userID):
  data = sqlite3.connect("database.db")
  legal = data.execute("SELECT legal FROM decks WHERE ID = ? AND userID = ?",[deckID,userID]).fetchone()
  #if deck is legal, will return (1,)
  #if deck belongs to user...

  if legal == None:
    return "error"
  #and it is legal...
  if not legal[0]:
    return "illegal"

  name = data.execute("SELECT name FROM publicDecks WHERE ID = ?",[deckID]).fetchone()
  #if deck is published, will return (name,)
  #if ID not in published decks:
  oldName = data.execute("SELECT name FROM decks WHERE ID = ?",[deckID]).fetchone()
  if name == None:
    #add ID to published decks
    data.execute("INSERT INTO publicDecks(ID,userID,name) VALUES (?,?,?)",[deckID,userID,oldName[0]])
  else:
    data.execute("UPDATE publicDecks SET likes = ? WHERE ID = ?",[0,deckID])
    data.execute("UPDATE publicDecks SET name = ? WHERE ID = ?",[oldName[0],deckID])
    data.execute("DELETE FROM publicCardInstances WHERE deckID = ?",[deckID])

  #copy card instances from decks table to published decks table
  cards = data.execute("SELECT cardID,idx FROM cardInstances WHERE deckID = ?",[deckID]).fetchall()
  statement = [f"INSERT INTO publicCardInstances(cardID,deckID,idx) VALUES {','.join(['(?,?,?)' for x in cards])}",[]]
  for x in cards:
    #add card ID, deck ID, index
    statement[1] += [x[0],deckID,x[1]]

  data.execute(statement[0],statement[1])
  data.commit()
  if name == None:
    return "publish"
  return "update"

def likeDeck(deckID,userID):
  data = sqlite3.connect("database.db")

  #if the deck exists
  info = data.execute("SELECT userID,likes FROM publicDecks WHERE ID = ?",[deckID]).fetchone()
  if info == None:
    return [0,"Error"]
  if info[0] == userID:
    return [0,"This is your deck!"]

  if data.execute("SELECT userID FROM likes WHERE userID = ? AND deckID = ?",[userID,deckID]).fetchone() != None:
    #user has liked this deck; remove the like
    data.execute("UPDATE publicDecks SET likes = ? WHERE ID = ?",[info[1] - 1,deckID])
    data.execute("DELETE FROM likes WHERE userID = ? AND deckID = ?",[userID,deckID])
    data.commit()
    return [1,"Removed like!"]

  else:
    #add a like
    data.execute("INSERT INTO likes(deckID,userID) VALUES (?,?)",[deckID,userID])
    data.execute("UPDATE publicDecks SET likes = ? WHERE ID = ?",[info[1] + 1,deckID])
    data.commit()
    return [1,"Deck Liked!"]