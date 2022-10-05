import csv
import requests
import re


def capitalizeWordMatch(match):
    word = match.group(0)
    return word.capitalize() if word != "and" else "and"
def capitalize(txt):
    return re.sub(r"[\w']+", capitalizeWordMatch, txt)


#use per_page = 400 to get all 340 results at once
dicot_families = requests.get(url = 'https://api.inaturalist.org/v1/taxa?taxon_id=47124&rank=family&per_page=400').json()['results']

# use per_page = 100 to get all 77 results at once
monocot_families = requests.get(url = 'https://api.inaturalist.org/v1/taxa?taxon_id=47163&rank=family&per_page=100').json()['results']


# get families ready to write
families_to_write = []

def addFlowerClass(families, class_name):
    print(class_name)

    for i, f in enumerate(families):
        print(f"{i+1}/{len(families)}: {f['name']}")

        img = f['default_photo']
        if img:
            img['attribution'] = re.sub("\n", "", img['attribution'])

        elpel_text = requests.get(url = f"https://www.wildflowers-and-weeds.com/Plant_Families/{f['name']}.htm").text
        keywords_match = re.search(re.compile('Key Words.*?(?=</B>)', re.DOTALL), elpel_text)
        if keywords_match:
            #print(keywords_match.group(0))
            keywords = re.sub('<BR>', " ", keywords_match.group(0))
            keywords = re.sub('"|<.*?>|\n', "", keywords)
            #print(keywords)
        img_match = re.search(re.escape(f"{f['name']}.jpg"), elpel_text)
        
        families_to_write.append({
            'scientific_name': f['name'],
            'common_name': capitalize(f['preferred_common_name']) if 'preferred_common_name' in f else None,
            'class': class_name,
            'image_url': img['square_url'] if img else None,
            'license': img['license_code'] if img else None,
            'attribution': img['attribution'] if img else None,
            'id_notes': keywords if keywords_match else None,
            'elpel_image_exists': True if img_match else False
        })

addFlowerClass(dicot_families, "Dicots")
addFlowerClass(monocot_families, "Monocots")

# sort families by scientific name
def getScientificName(f):
    return f['scientific_name']

families_to_write.sort(key=getScientificName)


# write to csv
with open("families.csv", mode = "w", newline="") as families_csv:
    fieldnames = ["scientific_name","common_name","class","image_url","license","attribution","id_notes","elpel_image_exists"]
    writer = csv.DictWriter(families_csv, fieldnames=fieldnames)

    writer.writeheader()
    for f in families_to_write:
        try:
            writer.writerow(f)
            print(f['scientific_name'])
        except UnicodeEncodeError:
            print("")
            print(f['scientific_name'])
            print(f"ERROR, failed to encode attribution string: {f['attribution']}\n")
            f['attribution'] = None
            writer.writerow(f)