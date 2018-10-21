letters = 'abcdefghijklmnopqrstuvwxyz'
def f(l):
    return letters.find(l)

def F(word):
    for i in word:
        print(f(i))

def d(n):
    return letters[n%26]

def D(nString):
    returnString = ''
    for i in range(0,len(nString),2):
        returnString += d(int(nString[i:i+2]))
    return returnString

#input section ----------------------------------------------------------
plaintext = 'Fluffy animals play around the rainbow.'
key = 0 #0 to 3 for now - which quarter of 100 to start with

#------------------------------------------------------------------------

#convert plaintext to only lowercase letters and replace u with v to yield a 25 letter alphabet
plaintext = plaintext.lower().replace('u','v')
tempStorage = ''
for i in plaintext:
    if i in letters:
        tempStorage+=i
plaintext = tempStorage

def encipherBlock(block):
    quarter = key
    nString = '' #number string

    for i in block:
        strNum = str(letters.find(i) + (25*quarter))
        if len(strNum) == 1: strNum = '0'+strNum #for single digit numbers, put a 0 in front

        nString += strNum
        quarter = (quarter + 1) % 4

    nString = encipherRailfence(nString)
    return D(nString)

def encipherRailfence(plainstring):
    cipherstring = ''
    for i in range(0,2):
        index = i
        while index < len(plainstring):
            cipherstring += plainstring[index]
            index += 2
    return cipherstring
