#Enigma Key ----------------------------------------------------------------------------------
key = {
    'rotors': [2,1,5], #rotor numbers; order corresponds to: [r3,r2,r1] (computer-read vars) because of rotor layout - electricity goes through rotor on right first
    'rotorStartingPoints': ['F','R','A'], #aka 'message key'; corresponds to 'rotors'
    'ringSettings': ['A','A','A'], #can use single uppercase letters or numbers here (where A=1 and Z=26); corresponds to 'rotors'
    'reflector': 'B',
    'plugboard': ['AB','IR','UX','KP'] #don't use a letter in more than one pair
}





LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' #I repeat this later b/c it makes it easier to see substitution

#Define functions! ----------------------------------------------------------------------------
def rotateRotor(r): #r is the rotor, should be a reference to r1,r2,or r3; thus function will change values of r1,r2,or r3 without needing to return anything
    for i in range(0,2): #rotate both strings
        #pop off first letter and move to end -> increments rotor in progressive alphabetical direction
        r[i] = r[i][1:] + r[i][0]


def setRotor(r,pos): #used to initialize rotor positions, pos is a letter
    pos = pos.upper() #precaution
    while r[0][0] != pos:
        rotateRotor(r)


def incrementRotors():
    #turn rotors and check for turnover points, this function called before encoding each character
    if r2Turnover == r2[0][0]:
        rotateRotor(r1) #rotate all rotors
        rotateRotor(r2)
        rotateRotor(r3)
    elif r1Turnover == r1[0][0]:
        rotateRotor(r1) #rotate right and middle rotors
        rotateRotor(r2)
    else:
        rotateRotor(r1) #rotate right rotor


def sendThrough(thing,index,direction): #thing is r1,r2,r3,reflector,or plugboard, index is input index, direction is 'in' or 'out'
    #take index as input, convert to letter w/ 1st string, use .find() to find letter in other string, this is index output
    str1 = ''
    str2 = ''
    if direction == 'in':
        str1 = thing[0]
        str2 = thing[1]
    if direction == 'out':
        str1 = thing[1]
        str2 = thing[0]
    return str2.find(str1[index])


def electricityThrough(char):
    #run 'electricity' through enigma: input char -> plugboard, r1, r2, r3, reflector, r3, r2, r1, plugboard -> output char
    char = char.upper()
    
    index = LETTERS.find(char)
    index = sendThrough(plugboard,index,'in')
    index = sendThrough(r1,index,'in')
    index = sendThrough(r2,index,'in')
    index = sendThrough(r3,index,'in')
    index = sendThrough(reflector,index,'in')
    index = sendThrough(r3,index,'out')
    index = sendThrough(r2,index,'out')
    index = sendThrough(r1,index,'out')
    index = sendThrough(plugboard,index,'out')

    return LETTERS[index]


def enterMessage(text): #function used to execute program, text can only be letters and spaces
    output = ''
    text = text.upper().replace(' ','')
    for i in text:
        incrementRotors()
        output += electricityThrough(i)
    return output
        

#Hardcoded stuff ---------------------------------------------------------------------------
#Rotor substitution rules - take index as input, convert to letter w/ 1st string, use .find() to find letter in other string, this is index output
#thus, the letters in these strings are really just markers, linking one index to another
ROTORS = [
    ['ABCDEFGHIJKLMNOPQRSTUVWXYZ',  #rotor 1 in
     'UWYGADFPVZBECKMTHXSLRINQOJ'], #rotor 1 out

    ['ABCDEFGHIJKLMNOPQRSTUVWXYZ',  #rotor 2 in
     'AJPCZWRLFBDKOTYUQGENHXMIVS'], #rotor 2 out

    ['ABCDEFGHIJKLMNOPQRSTUVWXYZ',  #rotor 3 in
     'TAGBPCSDQEUFVNZHYIXJWLRKOM'], #rotor 3 out

    ['ABCDEFGHIJKLMNOPQRSTUVWXYZ',  #rotor 4 in
     'HZWVARTNLGUPXQCEJMBSKDYOIF'], #rotor 4 out

    ['ABCDEFGHIJKLMNOPQRSTUVWXYZ',  #rotor 5 in
     'QCYLXWENFTZOSMVJUDKGIARPHB'], #rotor 5 out
]

#Reflector - same mechanism as rotor substitution
REFLECTORS = [
    ['ABCDEFGHIJKLMNOPQRSTUVWXYZ',  #reflector B in
     'YRUHQSLDPXNGOKMIEBFZCWVJAT'], #reflector B out

    ['ABCDEFGHIJKLMNOPQRSTUVWXYZ',  #reflector C in
     'FVPJIAOYEDRZXWGCTKUQSBNMHL'], #reflector C out
]

#Original turnover notch locations (w/o ring setting offset)
TURNOVER_NOTCHES = ['Q','E','V','J','E'] #for rotor 1,2,3,4,5 respectively




# A note on ring settings:
# My rotor storage system letters are used primarily as a way to represent the wiring - put in A, find where A is on the other string, there's your output.
# Thus, for me, "rotating" the rotor storage strings is essentially rotating the wiring, while the index in the string is the true method of alignment.
# In the real enigma, letters signified the index.
# The turnover point would always be at the same index/letter, though the wiring might rotate for the ring setting.
# Setting a ring setting would constitute of rotating a rotor BACKWARDS the offset number of times.
# Thus for me, having a ring setting of say, C, is equivalent to rotating the wiring 2 units (backwards, A is now at index 2), but keeping the turnover index the same.
# This would mean that my turnover LETTER advances 2 letters anti-alphabetically if looking at my alphabetical rotor string
#   -for rotor 1, turnover letter is Q-2->'O' for ring setting C(aka 2, aka 03 if you start counting at 1 instead of 0 like the Germans did).

# -------------------------------------------------------------------------------------------------------------------------------------------------------------
#Determine computer-read values; interpret key (done in same order as when defining the key) ------------------------------------------------------------------
#Computer-read values are: r1,r2,r3,r1Turnover,r2Turnover,r3Turnover,reflector,plugboard
#   -although r3Turnover is never used

def resetEnigma(): #used for initialization and resetting of computer-read values based on user-inputted key
    global r1,r2,r3,r1Turnover,r2Turnover,r3Turnover,reflector,plugboard #variables should be readable by other functions - make them global
    
    #electricity goes, by computer-read variables: plugboard,r1,r2,r3,reflector,r3,r2,r1,plugboard
    r1 = ROTORS[(key['rotors'])[2]-1] #index 0 is in-string, index 1 is out-string
    r2 = ROTORS[(key['rotors'])[1]-1]
    r3 = ROTORS[(key['rotors'])[0]-1]
    
    setRotor(r1,key['rotorStartingPoints'][2])
    setRotor(r2,key['rotorStartingPoints'][1])
    setRotor(r3,key['rotorStartingPoints'][0])

    #To interpret ring settings, determine offset value, rotate wheel that many backwards, and offset the turnover letter that many anti-alphabetically
    rotorList = [r3,r2,r1] #solely used to interpret ring settings
    for rotorIndex in range(3): #loop through rotors, left to right
        offset = key['ringSettings'][rotorIndex]
        if isinstance(offset,int): offset -= 1 #if user-provided as an integer, will be in form A=1 and Z=26, need to subtract one
        if isinstance(offset,str): offset = LETTERS.find(offset) #convert letter to integer if necessary
        for i in range(26-offset): #rotate rotor backwards 'offset' number of times, same as rotating forwards 26-offset number of times
            rotateRotor(rotorList[rotorIndex])
            
        turnoverLetter = TURNOVER_NOTCHES[key['rotors'][rotorIndex]-1] #get non-offset turnover letter from hardcoded list
        turnoverLetter = LETTERS[(LETTERS.find(turnoverLetter) - offset) % 26] #convert letter to number, subtract offset, convert back to letter

        #assign turnover letter to the appropriate variable
        if rotorIndex == 2: r1Turnover = turnoverLetter
        if rotorIndex == 1: r2Turnover = turnoverLetter
        if rotorIndex == 0: r3Turnover = turnoverLetter

    reflector = ['','']
    if key['reflector'] == 'B': reflector = REFLECTORS[0]
    if key['reflector'] == 'C': reflector = REFLECTORS[1]

    plugboard = ['ABCDEFGHIJKLMNOPQRSTUVWXYZ', #default function - do nothing; uses same mechanism as rotor substitution
                 'ABCDEFGHIJKLMNOPQRSTUVWXYZ']
    for pair in key['plugboard']: #flip paired characters
        p = plugboard #shorter variable
        pos0 = p[1].find(pair[0]) #could search for position in plugboard[0] or plugboard[1], decided the latter b/c that's what I'm modifying
        pos1 = p[1].find(pair[1])
        p[1] = p[1][:pos0] + pair[1] + p[1][pos0+1:] #replace char0 w/ char1 - when slicing, it's okay if index isn't in string, it will return empty string
        p[1] = p[1][:pos1] + pair[0] + p[1][pos1+1:] #replace char1 w/ char0

    print('Enigma is set to start settings.')

resetEnigma() #call for initialization of computer-read variables
