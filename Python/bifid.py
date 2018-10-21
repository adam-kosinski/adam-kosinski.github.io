text = open('plaintext.txt').read() #no punctuation
text = 'I wish you a wonderful fifteenth birthday and that life is going well at Carrboro and hopefully better in general from adam'
key = 'eofdpvaqhtnumbiwlcrkgzxys'
mode = 'encrypt' #'encrypt' or 'decrypt'



#----------------- Preliminary actions -------------------------------------
text = text.upper().replace(' ','').replace('J','I') #all j's and i's will be i's to make 25-letter alphabet
key = key.upper().replace(' ','').replace('J','I')
LETTERS = ['A','B','C','D','E','F','G','H','I','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'] #used to avoid repetition of key in polybius grid

grid = [[],[],[],[],[]]
keyIndex = 0
for r in range(5):
    for c in range(5):
        if keyIndex < len(key): #use key if applicable
            executeLoop = True
            while executeLoop:
                if key[keyIndex] in LETTERS: #if letter wasn't used before, use it
                    grid[r].append(key[keyIndex]) #add letter into grid
                    LETTERS.remove(key[keyIndex]) #denote that that letter has been used
                    executeLoop = False #stop searching for next char in key
                keyIndex += 1
        else: #use rest of alphabet, in order
            grid[r].append(LETTERS.pop(0)) #remove first item in LETTERS and add to end of row

#------------------ Begin Main Program -------------------------------------

def lookupChar(char): #loop through grid and identify match
    for r in range(5):
        for c in range(5):
            if grid[r][c] == char:
                return [r,c]

if mode == 'encrypt':
    row1 = '' #for row coords
    row2 = '' #for col coords

    for i in text: #fill in rows 1 and 2 with number coords of characters
        coords = lookupChar(i)
        row1 += str(coords[0])
        row2 += str(coords[1])

    nString = row1+row2 #put coord strings into one long string

    #now convert to letters
    ciphertext = ''
    for i in range(0,len(nString),2):
        ciphertext += grid[int(nString[i])][int(nString[i+1])]
    print(ciphertext)


if mode == 'decrypt':
    nString = ''

    #convert to numbers
    for i in text:
        nString += str(lookupChar(i)[0]) + str(lookupChar(i)[1]) #concatenate both coords of letter onto nString

    #split nString in half
    halfLength = int(len(nString)/2) #slice indices can't be a float; division returns a float
    row1 = nString[:halfLength]
    row2 = nString[halfLength:]

    #get plaintext
    plaintext = ''
    for i in range(len(row1)):
        plaintext += grid[int(row1[i])][int(row2[i])] #the index i works for both rows of numbers

    print(plaintext.lower())
