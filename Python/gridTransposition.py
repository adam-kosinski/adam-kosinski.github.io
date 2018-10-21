def encipher(plainstring):
    cipherstring = ''
    nOfRows = 3
    for i in range(0,nOfRows): #each iteration reads out a transposed row
        index = i
        while index < len(plainstring):
            cipherstring += plainstring[index]
            index += nOfRows #next char will be this many over, since letters are filled into the grid one column at a time
    return cipherstring
