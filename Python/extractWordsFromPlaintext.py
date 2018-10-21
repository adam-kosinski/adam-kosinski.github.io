text = open('plaintextDaddy.txt').read().upper()
LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
numbers = [1,5,5,1,1,7,3,5,2,3,1,5,1,1,1,1,6,6,1,1,7,6,2,5,6,4,2,1,3,1,3,2,1,1,5,6,3,4,1,3,1,5,2,3,2,1,1,2,4,6,1,2,5,1,4,1,5,1,3,1,1,1,3,1,1,9,1,7,2,2,1,1,3,1,3,9,1,1,2,1,4,5,2,2,4]
storage = []
wordStarted = False
word = ''
for i in text:
    if i in LETTERS:
        word += i
        wordStarted = True
    elif wordStarted:
        storage.append(word)
        word = ''
        wordStarted = False
    else:
        word = ''
        wordStarted = False
print(storage)

storageIndex = 0
hiddenMessage = ''
def checkNumber(n):
    global storageIndex, hiddenMessage
    char = storage[storageIndex][n-1]
    print(char)
    hiddenMessage += char
    storageIndex += 1

def doCheckNumber(numbers):
    for n in numbers:
        checkNumber(n)

def outputNumbers(numbers):
    output = ''
    for n in numbers:
        output += str(n-4) + '    '
    return output
    
