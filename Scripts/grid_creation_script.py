import pandas as pd
import sys
import json
import requests
from decimal import *

# Input: province being considered
# Output: csv of lat|long grids 0.2 * 0.2 degrees (~ 22 * 22km)
# Command: python grid_creation_script.py alberta

# API Key: AIzaSyD9dw4113kvXJdxcyIvRYG16jve6Posz78
province = sys.argv[1].lower()

provinceBounds = {"alberta":{"longMax":-110.00 , "longMin":-120.00 , "latMax": 60.00, "latMin": 49.00}}

def checkProvinceBonds(lat,long):
    apiKey = "AIzaSyD9dw4113kvXJdxcyIvRYG16jve6Posz78"
    url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=%s,%s&sensor=false" % (str(lat), str(long))
    data = {'key', apiKey}
    request = requests.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + str(lat) + "," + str(long) + "&key=AIzaSyD9dw4113kvXJdxcyIvRYG16jve6Posz78")
    response = json.loads(request.text)

    try:
        components = response['results'][0]['address_components']
    except:
        print("ERROR ", response)
        return False

    for c in components:
        if "administrative_area_level_1" in c['types']:
            if c['long_name'].lower() == province:
                return True

    return False


def main():
    longMax = provinceBounds[province]["longMax"]
    longMin = provinceBounds[province]["longMin"]
    latMax = provinceBounds[province]["latMax"]
    latMin = provinceBounds[province]["latMin"]

    currLong = longMin
    currLat = latMin

    validLong = list()
    validLat = list()

    ## List of all valid long values
    while currLong <  longMax:
        validLong.append(currLong)
        currLong += 0.2
        currLong = round(currLong, 5)

    ## List of all valid lat values
    while currLat < latMax:
        validLat.append(currLat)
        currLat += 0.2
        currLat = round(currLat, 5)

    # format is lat|long, latitude, longitude
    validLatLong = []

    for lat in validLat:
        for long in validLong:
            latLong = str(lat) + "|" + str(long)
            centroid = str(round(lat + 0.1, 5)) + "|" + str(round(long + 0.1, 5))
            # check that lat, long values are within province bounds
            if checkProvinceBonds(lat, long) == True:
                validLatLong.append([latLong, lat, long, centroid])

    print(validLatLong)

    validDf = pd.DataFrame(validLatLong, columns = ['KEY', 'LATITUDE', 'LONGITUDE', 'CENTROID'])
    validDf.to_csv("../Data/" + province + "_grid_system.csv", index = False)


if __name__ == "__main__":
     main()
     quit()
