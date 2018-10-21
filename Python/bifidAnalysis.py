text = open('bifidCiphertext.txt').read() #only letters and spaces

def freqCount(text):
    text = text.upper().replace(' ','') #so if called from other files, still makes sure of this
    LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    
    counter = [[0]*26,[0]*26,[0]*26,[0]*26,[0]*26,[0]*26,[0]*26,[0]*26,[0]*26,[0]*26,[0]*26,[0]*26,[0]*26,[0]*26,[0]*26,[0]*26,[0]*26,[0]*26,[0]*26,[0]*26,[0]*26,[0]*26,[0]*26,[0]*26,[0]*26,[0]*26,]
    #index in this list signifies first letter, index in list in this list signifies second letter
    
    for i in range(0,len(text),2): #loop through input(ciphertext) in blocks of 2 (b/c this is for bifid analysis)
        firstPos = LETTERS.find(text[i])
        secondPos = LETTERS.find(text[i+1])
        counter[firstPos][secondPos] += 1 #add one in counter for the appropriate digraph
    return counter


counter = freqCount(text)


def getCommonDigraphs(text,amount): #amount is number of digraphs to return, ordered most common first
    counter = freqCount(text)
    LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

    for i in range(amount):
        #loop through digraphs, find most common one
        currentMax = 0
        currentDigraph = ''
        for L in range(len(counter)):
            for i in range(len(counter[L])):
                if counter[L][i] > currentMax:
                    currentMax = counter[L][i]
                    currentDigraph = LETTERS[L] + LETTERS[i]
                    counter[L][i] = -1 #set to negative so when run through next time, won't retrieve this one
        print(currentDigraph,currentMax)




def analyze(text):
    text = text.upper().replace(' ','')
    row1 = text[:len(text)//2]
    row2 = text[len(text)//2:]

    #put rows together into a string in which ciphertext digraphs correspond to plaintext digraphs
    newString = ''
    for i in range(len(row1)):
        newString += row1[i] + row2[i]

    print(getCommonDigraphs(newString, 10))

    newString = newString.replace('HE','he')
    newString = newString.replace('RQ','th')
    newString = newString.replace('QQ','ta')
    newString = newString.replace('NM','co')
    newString = newString.replace('IQ','sa')
    newString = newString.replace('QM','re')
    newString = newString.replace('ST','st')

    print(newString)
    

analyze(text)
