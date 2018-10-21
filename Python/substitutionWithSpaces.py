text = open('plaintextDaddy.txt').read() #no punctuation
mode = 'encrypt' #'encrypt' or 'decrypt'
LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
CLETTERS ='UWDVGKMYLPRCBJZXQAFOSEHTNI'

text = text.upper()

output = ''
if mode == 'encrypt':
    for i in text:
        if i in LETTERS:
            char = CLETTERS[LETTERS.find(i)]
        else:
            char = i
        output += char
    print(output)
if mode == 'decrypt':
    for i in text:
        if i in CLETTERS:
            char = LETTERS[CLETTERS.find(i)]
        else:
            char = i
        output += char
    print(output.lower())
