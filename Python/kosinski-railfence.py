# NOTE: I decided to use extra things I already knew about python to create a comprehensive railfence program - spaces and punctuation, any number of rows

#input section
plaintext = 'a rose by any other name would smell as sweet.' #lowercase only
nOfRows = 2 #an integer 2 or greater

#define other variables
ciphertext = ''

rows = []
i=0
while i<nOfRows:
    rows.append('')
    i+=1

cRow = 0 #current row, matches index of row in rows list
direction = 1 # 1 means moving down through rows, -1 means moving up

index = 0 #index in original plaintext
letterIndex = 0 #index in imaginary plaintext only w/ letters; only gets incremented each time a letter is processed

#iterate through plaintext
while index < len(plaintext):
    if plaintext[index] in 'abcdefghijklmnopqrstuvwxyz': #only consider characters belonging to the alphabet
        char = plaintext[index].upper()
        rows[cRow]+=char #add character to appropriate row

        #adjust direction if necessary
        if cRow==(nOfRows-1) and (direction==1): direction = -1 #if need to turn to go up
        if (cRow==0) and (direction==-1): direction = 1 #if need to turn to go down

        cRow+=direction
    index+=1

#concatenate the rows
i=0
while i<nOfRows:
    ciphertext+=rows[i]
    i+=1

print(ciphertext)
