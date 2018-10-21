import time

def removeNonLetters(filename):
    startTime = time.time()
    
    #global text,upperText,substrings,outputText

    
    text = open(filename).read()
    upperText = text.upper()
    nOfFracs = len(text)//100 #tested for optimization
    fracLength = len(text)//nOfFracs
   
    LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    outputText = ''
    substrings = [] #appending to multiple substrings instead of to one long one speeds up the process

    t0 = time.time()
    #iterate through text
    for i in range(len(text)):
        if i%fracLength == 0: #at every fraction of the text, log percent complete message and create a new substring
            substrings.append('')
        if upperText[i] in LETTERS: #if character is a letter, keep it
            substrings[-1] += text[i] #append to last substring added to list

    t1 = time.time()
    
    #concatenate substrings
    for i in substrings:
        outputText += i

    t2 = time.time()
    
    #write outputText to file, overriding input text
    #with open(filename, 'w') as text_file:
    #    print(outputText,file=text_file)

    endTime = time.time()

    return [endTime-startTime, t1-t0, t2-t1]
    #print(endTime - startTime)
    #print(t1 - t0)
    #print(t2 - t1)

def removeNonLetters2(filename):
    startTime = time.time()
    
    global text,upperText,LETTERS,filterChar,outputLetters

    
    text = open(filename).read()
    upperText = text.upper()
   
    LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    outputLetters = []

    t0 = time.time()
    
    #iterate through text
    for i in range(len(text)):
        if upperText[i] in LETTERS: #if character is a letter, keep it
            outputLetters.append(text[i])
    '''

    def filterChar(i):
        if upperText[i] in LETTERS: return text[i]
        else: return ''

    outputLetters = [filterChar(i) for i in range(len(text))]
    '''
    t1 = time.time()
    
    #concatenate substrings
    outputText = "".join(outputLetters)

    t2 = time.time()
    
    #write outputText to file, overriding input text
    #with open(filename, 'w') as text_file:
    #    print(outputText,file=text_file)

    endTime = time.time()

    return [endTime-startTime, t1-t0, t2-t1]
    #print(endTime - startTime)
    #print(t1 - t0)
    #print(t2 - t1)



def lookForNOfFracs():
    for n in range(1,11):
        totalTime = 0
        iterateTime = 0
        concatTime = 0

        for x in range(3):
            result = removeNonLetters('englishText.txt',n*1000)
            totalTime += result[0]
            iterateTime += result[1]
            concatTime += result[2]

        totalTime = (100*totalTime//3)/100
        iterateTime = (100*iterateTime//3)/100
        concatTime = (100*concatTime//3)/100

        print('nOfFrac: '+str(n*1000))
        print(totalTime,iterateTime,concatTime)
        print('')
