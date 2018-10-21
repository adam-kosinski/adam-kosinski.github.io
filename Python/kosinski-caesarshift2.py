# input area ---------------------------------------------
plaintext = 'This is my plaintext'
ciphertext = ''
key = 4

mode = 'decrypt' #'encrypt' or 'decrypt'

# --------------------------------------------------------

plaintext = plaintext.upper().replace(' ','')
ciphertext = ciphertext.upper().replace(' ','')

#define both alphabets
LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
CIPHERLETTERS = LETTERS

#shift over cipheralphabet the required number of times
for i in range(key):
    CIPHERLETTERS = CIPHERLETTERS[1:] + CIPHERLETTERS[0] #move 1st character to end

if mode == 'encrypt':
    for i in plaintext:
        ciphertext += CIPHERLETTERS[LETTERS.find(i)]
        if len(ciphertext.replace(' ','')) % 5 == 0:
            ciphertext += ' '
    print(ciphertext)

if mode == 'decrypt':
    for i in ciphertext:
        plaintext += LETTERS[CIPHERLETTERS.find(i)]
    print(plaintext.lower())
