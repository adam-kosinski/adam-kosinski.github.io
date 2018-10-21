import pygal

text = open('ciphertextFrenchVigenere.txt').read()


def freqCount(text):
    LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    text = text.upper().replace(' ','') #so if called from other files, still makes sure of this
    counter = [0]*26 #create storage list for frequencies
    for i in text: #loop through input(ciphertext)
        counter[LETTERS.find(i)] += 1 #add one to the appropriate index in counter
    return counter



def barchart(text): #uses ciphertext as an input
    line_chart = pygal.Bar() #create object to refer to - name for bar chart object
    line_chart.title = 'Frequency Distribution' #give graph a title
    line_chart.x_labels = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'] #define bar labels - x-axis
    line_chart.add('Ciphertext', freqCount(text)) #add data w/ label 'Ciphertext'
    line_chart.render_to_file('Barchart_Frequency_Distribution.svg') #render graph onto a file



def ioc(text):
    text = text.upper().replace(' ','')
    counter = freqCount(text) #determine frequencies, store in an alphabatized list
    prob = 0 #will add the probabilites of each event to this, final sum will be end probability
    for i in range(0,26): #loop through each letter index
        p1 = counter[i]/len(text) #probability of 1st letter drawn being this index
        p2 = (counter[i]-1)/(len(text)-1) #probability of 2nd letter drawn being this index as well (no replacement when drawing)
        prob += p1*p2 #add probability of both events happening to total probability
    return prob



def separateIntoBlocks(text,keyLength):
    storage = ['']*keyLength #begin making the blocks (same number of blocks as key length)
    text = text.upper().replace(' ','')

    for i in range(0,len(text)): #loop through indexes of text and assign characters to appropriate block
        storage[i%keyLength] += text[i] #concatenate character onto appropriate block

    return storage



def friedman(text):
    text.upper().replace(' ','')
    n = len(text) #get length of message
    return (0.027*n)/((n-1)*ioc(text) - (0.038*n) + 0.065) #use formula

for n in range(1,1):
    blocks = separateIntoBlocks(text,n)
    print('')
    for i in range(n):
        print(ioc(blocks[i]))

barchart(separateIntoBlocks(text,5)[4])
