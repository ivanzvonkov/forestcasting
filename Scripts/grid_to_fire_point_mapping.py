import pandas as pd
import numpy as np
import sys

# Input: fire_point data csv
# Output: fire_point csv with added locationKey column
# Command: python grid_to_fire_point_mapping.py <fire_point_data_file>

fire_point = sys.argv[1]

def roundToFifth(number):
    rounded = round(number*5)/5
    return(rounded)

def createKey(lat, long):
    lowerLat = roundToFifth(lat)
    lowerLong = roundToFifth(long)

    key = str(lowerLat) + "|" + str(lowerLong)
    return(key)


def main():
    fire_point_df = pd.read_csv(fire_point)

    fire_point_df['locationKey'] = np.vectorize(createKey)(fire_point_df['LATITUDE'], fire_point_df['LONGITUDE'])
    fire_point_df.to_csv("../Data/fire_point_location_key.csv", index = False)

if __name__ == "__main__":
    main()
    quit()
