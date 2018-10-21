#input area - define main variables --------------------------------------

plaintext = 'Zebras eat grass.'
ciphertext = ''

key = 3
mode = 'encrypt' #'encrypt' or 'decrypt'

# ------------------------------------------------------------------------

LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

#if deciphering, treat ciphertext like plaintext - plaintext variable is essentially input; ciphertext variable is output
if mode == 'decrypt':
    plaintext = ciphertext
    ciphertext = ''

#convert plaintext to upper case
plaintext = plaintext.upper()

#remove all characters except letters
tempStorage = ''
for i in plaintext:
    if i in LETTERS: tempStorage += i
plaintext = tempStorage


#loop through plaintext, convert each letter to ciphertext version
lettersInBlock = 0 #to determine when to add a space to make a new block

if mode == 'decrypt': key *= -1 #subtract key if deciphering
for i in plaintext:
    num = LETTERS.find(i) #convert character to number
    num += key #determine ciphertext/plaintext number by adding/subtracting key, respectively
    num = num % 26 #make sure index is 0 to 25
    ciphertext += LETTERS[num] #add new character to ciphertext
    if mode == 'encrypt': #only need to make blocks if enciphering
        lettersInBlock += 1
    if lettersInBlock == 5: #create a new block if applicable
        ciphertext += ' '
        lettersInBlock = 0

if mode == 'decrypt': #output lowercase if deciphering
    ciphertext = ciphertext.lower()

print(ciphertext)
