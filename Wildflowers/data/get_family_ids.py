import csv
import requests

families = requests.get(url = "https://api.inaturalist.org/v1/taxa?per_page=417&taxon_id=47125&rank=family&order=desc&order_by=observations_count").json()['results']

to_write = []

for f in families:
    to_write.append({'scientific_name': f['name'], 'id': f['id']})

# sort families by scientific name
def getScientificName(f):
    return f['scientific_name']
to_write.sort(key=getScientificName)


# write to csv
with open("family_ids.csv", mode = "w", newline="") as families_csv:
    fieldnames = ["scientific_name","id"]
    writer = csv.DictWriter(families_csv, fieldnames=fieldnames)

    writer.writeheader()
    for f in to_write:
        writer.writerow(f)
        print(f['scientific_name'])