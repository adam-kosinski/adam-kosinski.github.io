#input area - define main variables --------------------------------------

plaintext = 'Meet me at the usual place at eight o\'clock.'
ciphertext = ''
mode = 'encrypt' #'encrypt' or 'decrypt'

aKey = 11 #additive key
mKey = 7 #multiplicative key
addFirst = True #True if the program should add before multiplying when enciphering; False if should multiply before add

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



lettersInBlock = 0 #to determine when to add a space to make a new block

#determine inverse of the multiplicative key
mKeyInv = -1 #-1 is placeholder
for i in range(0,26):
    if (mKey * i) % 26 == 1: mKeyInv = i

if mKeyInv == -1: #if no multiplicative inverse found, the key wasn't valid; if one was found, the key was valid - report if wasn't valid
    print('Your multiplicative key was invalid.')

#if deciphering, make keys equal their inverses, and do proper operations later on
if mode == 'decrypt':
    aKey *= -1
    mKey = mKeyInv



#loop through input, convert each letter to output version
for i in plaintext:
    pos = LETTERS.find(i) #convert character to number
    if (addFirst and mode=='encrypt') or (not(addFirst) and mode=='decrypt'):
        pos += aKey
        pos *= mKey
    elif (not(addFirst) and mode=='encrypt') or (addFirst and mode =='decrypt'):
        pos *= mKey
        pos += aKey
    pos = pos % 26 #apply modulus
    ciphertext += LETTERS[pos] #add new character to ciphertext(aka output)
    if mode == 'encrypt': #only need to make blocks if enciphering
        lettersInBlock += 1
    if lettersInBlock == 5: #create a new block if applicable
        ciphertext += ' '
        lettersInBlock = 0

if mode == 'decrypt': #output lowercase if deciphering
    ciphertext = ciphertext.lower()

if not(mKeyInv == -1): #only print output if key was valid, if it was invalid, I ONLY want to display the earlier printed message saying so
    print(ciphertext)
