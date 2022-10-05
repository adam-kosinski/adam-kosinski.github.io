# all_genuses = requests.get(url = 'https://api.inaturalist.org/v1/taxa?taxon_id=47125&rank=genus').json()['results'] # taxon id for angiosperms

# issue with over 10K genuses in the angiosperms (hitting request limit), maybe only get what I need