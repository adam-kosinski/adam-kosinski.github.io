#loop through start letters
#check if letter after each occurence is same, store a list of options

text = open('ciphertext1.txt').read().upper().replace(' ','')
LETTERS = 'ABC'

print(text)

repeats = []

for L in LETTERS:
    storage = []
    textIndex = 0
    for i in text:
        if i == L:
            if textIndex < len(text)-1: #make sure digraph exists
                digraph = text[textIndex:textIndex+2]
                
                #compare to see if match anything in storage, add to repeats list if so
                for x in storage:
                    if digraph == x:
                        repeats.append(digraph)
                        print(digraph)
                
                #add digraph to storage
                storage.append(digraph)
        textIndex += 1
