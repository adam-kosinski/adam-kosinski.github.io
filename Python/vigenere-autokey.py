plaintext = ''
ciphertext = 'XPRMK LDRDL DHFBR KAIOZ JBGGT XTPUB OWOZW XUXWY HHIKU IVVKZ NZZIC IRRXI NMYXH WEYDI BX UHXRV IWIGV VMTSU RZFDY TRMPG BIQXZ'
mode = 'decrypt'
key = 'BIRTHDAY'

LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

plaintext = plaintext.upper().replace(' ', '')  # this will make your message all caps and remove spaces
ciphertext = ciphertext.upper().replace(' ', '') # this will make your message all caps and remove spaces
key = key.upper() #make key upper case so I can look up corresponding numbers in LETTERS

if mode == 'encrypt':
    key = key + plaintext
    for i in range(len(plaintext)): #loop through each index in plaintext
        pos = LETTERS.find(plaintext[i]) #look up plaintext character in the string LETTERS and return the position
        currentKey = LETTERS.find(key[i]) #reference correct letter in key (key always longer than plaintext - no mod), and look up corresponding number, return that
        newpos = (pos + currentKey) % 26 #determine the new position by adding and then using mod

        ciphertext += LETTERS[newpos] # Adds whatever letters is in the newpos to ciphertext
    
        if len(ciphertext.replace(' ', '')) % 5 == 0: # if length of ciphertext without spaces is divisible by 5, add a space
            ciphertext += ' '
        
    print(ciphertext)

if mode == 'decrypt':
    for i in range(len(ciphertext)): #loop through each index in plaintext
        pos = LETTERS.find(ciphertext[i]) #look up plaintext character in the string LETTERS and return the position
        currentKey = LETTERS.find(key[i]) #reference correct letter in key (key always longer than plaintext - no mod), and look up corresponding number, return that
        newpos = (pos - currentKey) % 26 #determine the new position by subtracting and then using mod

        plaintext += LETTERS[newpos] # Adds whatever letters is in the newpos to ciphertext
        key += LETTERS[newpos] #add it to the key as well

    print(plaintext.lower())
