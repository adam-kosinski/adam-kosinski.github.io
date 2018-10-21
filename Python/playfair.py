text = 'This is a very interestinng message' #no punctuation
key = 'gibson'
mode = 'encrypt' #'encrypt' or 'decrypt'

#----------------- Preliminary actions -------------------------------------
text = text.upper().replace(' ','').replace('J','I') #all j's and i's will be i's to make 25-letter alphabet
key = key.upper().replace(' ','').replace('J','I')
LETTERS = ['A','B','C','D','E','F','G','H','I','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'] #used to avoid repetition of key in polybius grid

#space apart double letters
prevLetter = ''
for i in range(len(text)):
    if prevLetter == text[i] and i%2 == 1: #if a double char, that ends at an odd index -> will be grouped
        text = text[:i] + 'X' + text[i:] #'X' is junk character
    prevLetter = text[i]

#if odd number of chars
if len(text)%2 == 1:
    text += 'X'

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

def lookupChar(char): #loop through grid and identify matches
    for r in range(5):
        for c in range(5):
            if grid[r][c] == char:
                return [r,c]

outputString = ''
for i in range(0,len(text),2): #step through text in blocks of 2 characters
    pos1 = lookupChar(text[i])
    pos2 = lookupChar(text[i+1])
    
    newpos1 = pos1[:] #slice entire list
    newpos2 = pos2[:]
    #will replace values later; want to retain original while doing so
    
    if pos1[0] != pos2[0] and pos1[1] != pos2[1]: #if not in same row or col
        newpos1[1] = pos2[1] #flip column indexes, keep row
        newpos2[1] = pos1[1]
    elif pos1[0] == pos2[0]: #if in same row
        if mode == 'encrypt':
            newpos1[1] = (newpos1[1] + 1) % 5 #shift to right one
            newpos2[1] = (newpos2[1] + 1) % 5
        elif mode == 'decrypt':
            newpos1[1] = (newpos1[1] - 1) % 5 #shift to left one
            newpos2[1] = (newpos2[1] - 1) % 5
    elif pos1[1] == pos2[1]: #if in same col
        if mode == 'encrypt':
            newpos1[0] = (newpos1[0] + 1) % 5 #shift down one
            newpos2[0] = (newpos2[0] + 1) % 5
        elif mode == 'decrypt':
            newpos1[0] = (newpos1[0] - 1) % 5 #shift up one
            newpos2[0] = (newpos2[0] - 1) % 5

    newchar1 = grid[newpos1[0]][newpos1[1]] #get new characters from grid
    newchar2 = grid[newpos2[0]][newpos2[1]]
    outputString += (newchar1 + newchar2)

if mode == 'encrypt': print(outputString)
if mode == 'decrypt': print(outputString.lower())

