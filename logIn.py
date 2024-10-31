import hashlib
# x = "hello"
# print(hashlib.sha256(bytes(x,encoding="utf-8")).hexdigest())#  --> hashes 'hello'
def log(username,password,data):
   if username == "":
      return "Please enter a username"
   if ">" in username or "<" in username:
      return "Invalid username"
   if password == "":
      return "Please enter a password"
   if ">" in password or "<" in password:
      return "Invalid password"
   passs = data.execute("SELECT password FROM users WHERE name = ?",[username]).fetchone()

   if passs == None:
      return "Incorrect username"
   if passs[0] != hashlib.sha256(bytes(password,encoding="utf-8")).hexdigest():
      #check if the has of the input matches the stored password
      return "Incorrect password"

   return data.execute("SELECT ID FROM users WHERE name = ?",[username]).fetchone()[0]

def sign(username,password,data):
   if username == "":
      return "Please enter username"
   if len(username) > 30:
      return "Username is too long"
   if password == "":
      return "Please enter password"
   if len(data.execute("SELECT name FROM users WHERE name = ?",[username]).fetchall())!=0:
      return "That username is already taken"

   data.execute("INSERT INTO users(name,password) VALUES(?,?)",[username,hashlib.sha256(bytes(password,encoding="utf-8")).hexdigest()])
   data.commit()
   #add user to database
   return data.execute("SELECT ID FROM users WHERE name = ?",[username]).fetchone()[0]