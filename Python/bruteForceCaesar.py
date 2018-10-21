#input area - define main variables --------------------------------------

plaintext = ''
ciphertext = open('challenge01-caesar.txt').read()

# ------------------------------------------------------------------------

LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

#remove all spaces
ciphertext = ciphertext.replace(' ','')

for key in range(0,26):
    for i in range(len(ciphertext)):
        num = LETTERS.find(ciphertext[i]) #convert character to number
        num -= key #determine ciphertext/plaintext number by adding/subtracting key, respectively
        num = num % 26 #make sure index is 0 to 25
        plaintext += LETTERS[num] #add new character to ciphertext

    plaintext = plaintext.lower()

    if 'the' in plaintext:
        print(key)
        print(plaintext)
        print('')

    plaintext = ''
