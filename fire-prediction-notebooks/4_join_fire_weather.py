# -*- coding: utf-8 -*-
"""4-join_fire_weather.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1Kb0dc3BbABra1XqGj0swQ9dcjtEpjIXg

# Join Fire & Weather Data
**Inputs:**

(1) Weather location data: {province}_weather_location_grid.csv

(2) Fire location data: {province}_fire_location_grid.csv

**Output**: 

{province}_dataset.csv
"""

# Set province 
province = 'BC'
# Shima's and Ivan's root path
root_path = '/content/gdrive/My Drive/Capstone Public Folder/Data/'

# Imports
import pandas as pd
import numpy as np
import io
from google.colab import files, drive
import zipfile
import gzip
import shutil

# Mount Google Drive
drive.mount('/content/gdrive')

# Access fire data gzip directly
fire_file_path = root_path + f'{province} Location/{province}_fire_location_grid.csv.gz'
fire_df = pd.read_csv(fire_file_path, compression='gzip')

# Create new key in fire_df : LOCATION + DATE
fire_df["LOCATION_DATE_KEY"] = fire_df["locationKey"].map(str) + "|" + fire_df["START_DATE"]
fire_df['FIRE'] = 1
fire_df = fire_df[['LOCATION_DATE_KEY', 'FIRE']]
fire_df = fire_df.drop_duplicates()
fire_df

# Access weather data gzip directly
weather_file_path = root_path + f'{province} Location/{province}_weather_location_grid.csv.gz'
full_weather_df = pd.read_csv(weather_file_path, compression='gzip')
full_weather_df.head()

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

weather_df = full_weather_df.drop(cols_to_delete, axis=1)

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

for i in cols_to_rename:
  weather_df.rename(columns={i: standardize_col_names(i) }, inplace = True)

weather_df.head()

# Left merge because fire has some points outside specified region
merged_df = pd.merge(weather_df, fire_df, how='left', on='LOCATION_DATE_KEY')
merged_df

# Label fire and no fire rows - WORKS NOW
merged_df['FIRE'] = merged_df['FIRE'].fillna(value = 0);
merged_df

merged_df.describe()

print(f'Length before: {len(merged_df)}')
merged_df = merged_df.drop_duplicates()
print(f'Length after: {len(merged_df)}')

# Compress csv
file_path = root_path + f'{province} Location/{province}_init_dataset.csv.gz'
merged_df.to_csv(file_path, compression='gzip', index=False)

# Download the file locally 
#files.download(f'{province}_dataset.csv.gz')