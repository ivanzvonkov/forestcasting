# -*- coding: utf-8 -*-
"""9-historic_weather_aveages.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/18BeqvdVGcM7mEhDrUdxR22me-0QtP3Dy

## Input
\<province\>_dataset.csv.gz

## Output
\<province\>_daily_avg_weather.csv.gz

## Psuedo-Code:
1. Drop non-weather data
2. Create month-day columns
3. group by locatio|key and month-day
4. average all numeric columns **bold text**
"""

from google.colab import files, drive
import pandas as pd
import numpy as np
import os

drive.mount('/content/gdrive')
root_path = '/content/gdrive/My Drive/Capstone Public Folder/Data/'
province  = "MB"
weather = pd.read_csv(root_path + f'{province} Location/{province}_weather_location_grid.csv.gz', compression = 'gzip')

def getMonthDay(locationDateKey):
  date = locationDateKey.split("|")[2]
  sep_date = date.split("-")

  monthDay = sep_date[1] + "-" + sep_date[2]

  return monthDay

def standardize_col_names(col_name):
  name = col_name.split('(')[0].upper()
  names = name.split(' ')
  final =""
  j=0
  while j<len(names)-2:
    final += names[j]+'_'
    j=j+1
  final += names[j]    
  return final

# Remove unnecessary columns from weather df
 cols_to_delete = ['Province',
                   'Latitude (Decimal Degrees)',	
                   'Longitude (Decimal Degrees)',	
                   'Name',
                   'Latitude',
                   'Longitude',
                   'Elevation (m)',
                   'First Year',
                   'Last Year',	
                   'geometry',
                   'Climate ID_x',
                   'Climate ID_y',
                   'STATION_ID',
                   'Station ID',
                   'BACKUP_STATION_ID',  
                   'Date/Time', 
                   'Station Name', 
                   'Longitude (x)', 
                   'Latitude (y)', 
                   'Year',  
                   'Day', 
                   'Data Quality', 
                   'Max Temp Flag', 
                   'Min Temp Flag', 
                   'Mean Temp Flag',
                   'Heat Deg Days Flag', 
                   'Cool Deg Days Flag', 
                   'Total Rain Flag', 
                   'Total Snow Flag',
                   'Total Precip Flag', 
                   'Snow on Grnd Flag', 
                   'Dir of Max Gust Flag', 
                   'Spd of Max Gust Flag']

weather = weather.drop(cols_to_delete, axis=1)

# Standardize other columns
cols_to_rename = ['Max Temp (°C)',
                  'Min Temp (°C)',
                  'Mean Temp (°C)',
                  'Heat Deg Days (°C)',
                  'Cool Deg Days (°C)',
                  'Total Rain (mm)',
                  'Total Snow (cm)',
                  'Total Precip (mm)',
                  'Snow on Grnd (cm)',
                  'Dir of Max Gust (10s deg)',
                  'Spd of Max Gust (km/h)']

for i in cols_to_rename:
  weather.rename(columns={i: standardize_col_names(i) }, inplace = True)

weather = weather[['LOCATION_KEY', 'LOCATION_DATE_KEY', 'MAX_TEMP', 'MIN_TEMP', 'MEAN_TEMP', 'TOTAL_RAIN', 'TOTAL_SNOW',
       'TOTAL_PRECIP', 'SNOW_ON_GRND', 'DIR_OF_MAX_GUST', 'SPD_OF_MAX_GUST', 'TEMP_12_4', 'DEW_TEMP_12_4', 'REL_HUM_12_4']]

weather.fillna(0)

weather["MONTH_DAY"] = np.vectorize(getMonthDay)(weather["LOCATION_DATE_KEY"])

# Fix wind values 
def fix_wind(row):
  try:
   row['SPD_OF_MAX_GUST'] = int(row['SPD_OF_MAX_GUST'])
  except:
    row['SPD_OF_MAX_GUST'] = int(float(row['SPD_OF_MAX_GUST'][1:]))
  return row
  
weather = weather.fillna(0)
weather = weather.apply(lambda row: fix_wind(row), axis=1)

weatherStats = weather.groupby(["LOCATION_KEY", "MONTH_DAY"], as_index=False).agg({'MAX_TEMP': 'mean', 
                                                                  'MIN_TEMP': 'mean', 
                                                                  'MEAN_TEMP': 'mean',
                                                                  'TOTAL_RAIN': 'mean', 
                                                                  'TOTAL_SNOW': 'mean',
                                                                  'TOTAL_PRECIP': 'mean', 
                                                                  'SNOW_ON_GRND': 'mean', 
                                                                  'DIR_OF_MAX_GUST': 'mean', 
                                                                  'SPD_OF_MAX_GUST': 'mean', 
                                                                  'TEMP_12_4': 'mean', 
                                                                  'DEW_TEMP_12_4': 'mean', 
                                                                  'REL_HUM_12_4': 'mean'})

weatherStats.to_csv(root_path + province + " Location/" + province + "_daily_avg_weather.csv.gz", compression = "gzip", index = False)

test = pd.read_csv(root_path + province + " Location/" + province + "_daily_avg_weather.csv.gz", compression = "gzip",)
test[test["MONTH_DAY"] == "08-24"]