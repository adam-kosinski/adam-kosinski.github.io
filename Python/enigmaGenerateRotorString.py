def generateRotorString(substitution):
    #example: substitution = 'EKMFLGDQVZNTOWYHXUSPAIBRCJ'
    #means A->E, B->K, C->M, etc.
    output = ''

    LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

    for i in LETTERS:
        index = substitution.find(i) #get index of letter that mapped to this spot
        letter = LETTERS[index] #get letter that mapped to this spot
        output += letter

    return output
