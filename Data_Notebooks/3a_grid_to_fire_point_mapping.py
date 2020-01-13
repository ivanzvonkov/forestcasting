# -*- coding: utf-8 -*-
"""3a-grid_to_fire_point_mapping.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/173q_9PGVCPPwX3oFmyYTwQcBuMsr6XOC
"""

import pandas as pd
import numpy as np
import sys

# Mount Google Drive
drive.mount('/content/gdrive')
root_path = '/content/gdrive/My Drive/Capstone Public Folder/Data/'
province = "al"
fire_point = root_path + {path_to_fire_data}

def roundToDecimal(number, toDecimal):
    rounded = round(number*toDecimal)/toDecimal
    return(rounded)

def createKey(lat, long):
    lowerLat = roundToDecimal(lat, 5)
    lowerLong = roundToDecimal(lng, 5)

    key = str(lowerLat) + "|" + str(lowerLong)
    return(key)

fire_point_df = pd.read_csv(fire_point)
  fire_point_df['locationKey'] = np.vectorize(createKey)(fire_point_df['LATITUDE'], fire_point_df['LONGITUDE'])
  fire_point_df.to_csv(root_path + province + _fire_location_grid.csv", index = False)