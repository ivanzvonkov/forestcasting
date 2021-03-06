# -*- coding: utf-8 -*-
"""protectedAreaShpConvert.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1aMRlQDGuVR9xhS4KTc9vHoVneyVPQbk9

# Inputs
1.    \<province\>_grid_system.csv.gz
2.   WDPA_Feb2020_CAN-shapefile-polygons.shp

#  Output
1.    \<province\>_protected_areas_grid.csv.gz   
Schema: ```'KEY' ,'PA_COUNT'```
2. \<province\>protected_area_stats.csv.gz  
Schema: 
```
'LOCATION_KEY', 'WDPA_PID', 'PA_DEF', 'NAME', 'ORIG_NAME', 'DESIG',
'DESIG_ENG', 'DESIG_TYPE', 'IUCN_CAT', 'INT_CRIT', 'MARINE', 'REP_M_AREA',
'GIS_M_AREA', 'REP_AREA', 'GIS_AREA', 'NO_TAKE', 'NO_TK_AREA', 'STATUS',
'STATUS_YR', 'GOV_TYPE', 'OWN_TYPE', 'MANG_AUTH', 'MANG_PLAN', 'VERIF',
'METADATAID', 'SUB_LOC', 'PARENT_ISO', 'ISO3'
```

Link To Data: https://www.protectedplanet.net/country/CA
"""

from osgeo import ogr
from google.colab import files, drive
import pandas as pd
import numpy as np
import os

drive.mount('/content/gdrive')
root_path = '/content/gdrive/My Drive/Capstone Public Folder/Data/'
provinces ={"SK"}
province = "SK"

def getFeatureSchema(file):
  layer = file.GetLayer()
  schema = []
  ldefn = layer.GetLayerDefn()
  
  for n in range(ldefn.GetFieldCount()):
      fdefn = ldefn.GetFieldDefn(n)
      schema.append(fdefn.name)
  schema.pop(0)
  return(schema)


def getAllFeatures(lyr):
  count = lyr.GetFieldCount()
  results = []
  for i in range(1, count):
    results.append(lyr.GetField(i))
  
  return(results)

def getLatLongFromShp(file, columns):
  lyr = file.GetLayerByIndex(0)
  lyr.ResetReading()
  arr = []

  for feat in lyr:
      # get bounding coords in minx, maxx, miny, maxy format
      env = feat.GetGeometryRef().GetEnvelope()
      # get bounding coords in miny, minx, maxy, maxx format
      bbox = getAllFeatures(feat)
      bbox.extend([env[0], env[2], env[1], env[3]])
      arr.append(bbox)
  df = pd.DataFrame(arr, columns = columns)
  return(df)

def checkRange(minx, maxx, miny, maxy, lat, longitude):
  if (lat >= minx) and (lat <= maxx) and (longitude <= maxy) and (longitude >= miny):
      return True
  return False

wdpa = ogr.Open(root_path + "ProtectedAreas/WDPA_Feb2020_CAN-shapefile/polygon/WDPA_Feb2020_CAN-shapefile-polygons.shp")

columns = getFeatureSchema(wdpa)
columns.extend(["miny", "minx", "maxy", "maxx"])

protectedAreaDf = getLatLongFromShp(wdpa, columns)

def getPaOcurrence(latitude, longitude):
    count = 0
    for index, polyId in protectedAreaDf.iterrows():
      found = checkRange(polyId['minx'], polyId['maxx'], polyId['miny'], polyId['maxy'], latitude, longitude)

      if found:
        count = count + 1

    return count

grids = []
 
for pr in provinces:
  grids.append(pd.read_csv(root_path + f'/{pr} Location/{pr}_grid_system.csv.gz', compression = 'gzip'))

grid_df = pd.concat(grids)

grid_df["PA_COUNT"] = np.vectorize(getPaOcurrence)(grid_df["LATITUDE"], grid_df["LONGITUDE"])

grid_count = grid_df[["KEY", "PA_COUNT"]]

grid_count.to_csv(root_path + province + " Location/" + province + "_protected_areas_grid.csv.gz", compression = "gzip", index = False)

def createAreaLocationKeys(latitude, longitude, key):
  df = pd.DataFrame(columns = columns)

  for index, polyId in protectedAreaDf.iterrows():
    found = checkRange(polyId['minx'], polyId['maxx'], polyId['miny'], polyId['maxy'], latitude, longitude)

    if found:
      temp = polyId
      temp["LOCATION_KEY"] = key
      series = pd.Series(temp, index = df.columns)
      df = df.append(series, ignore_index = True)
  
  return(df)

columns = getFeatureSchema(wdpa)
columns.append('LOCATION_KEY')
areaArr = np.vectorize(createAreaLocationKeys)(grid_df["LATITUDE"], grid_df["LONGITUDE"], grid_df["KEY"])

areaDf2 = pd.DataFrame(columns = columns)

for entry in areaArr:
  if not entry.empty:
    areaDf2 = areaDf2.append(entry, ignore_index=True)

areaDf2 = areaDf2[['LOCATION_KEY', 'ORIG_NAME', 'DESIG', 'MANG_AUTH']]

areaDf2.to_csv(root_path + province + " Location/" + province + "_protected_area_stats.csv.gz", compression = "gzip", index = False)