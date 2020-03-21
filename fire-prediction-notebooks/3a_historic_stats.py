# -*- coding: utf-8 -*-
"""3a_historic_stats.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1_rnIJMBfuuFWIba0NNhZ-l0ucNp8pQd_

# Goal
### {province}_fire_location_grid_full.csv:
#### For each x in {2017, 2018}:
* Do the 4 stats for {1983, ..., (x-1)}
* Keep unique location keys

### {province}_historic_stats.csv:
* Columns: 'YEAR', 'LOCATION_KEY', 'TOTAL_SIZE_HA', 'AVERAGE_SIZE_HA', 'TOTAL_DURATION', 'AVERAGE_DURATION'
"""

# Commented out IPython magic to ensure Python compatibility.
import pandas as pd
import numpy as np
from google.colab import files, drive
import warnings
pd.options.mode.chained_assignment = None
warnings.simplefilter(action='ignore', category=FutureWarning)
import numpy as np
import scipy.stats as st
import matplotlib
from matplotlib import pyplot as plt
from math import isnan

pd.set_option('display.max_columns', 500)

# %matplotlib inline

# Mount Google Drive
drive.mount('/content/gdrive')

# Read in File
province = 'BC'
dataset = {"path": f"/content/gdrive/My Drive/Capstone Public Folder/Data/{province} Location/{province}_fire_location_grid.csv.gz"}
df =  pd.read_csv(dataset["path"], compression = 'gzip')

# Define the set of years here
years_to_iterate = range(2008, 2018+1)

# Check if OUT_DATE is available
out_date_exists = 'OUT_DATE' in df.columns
print(f'Out date exists: {out_date_exists}')

# Check null columns
null_columns=df.columns[df.isnull().any()]
df[null_columns].isnull().sum()

def fill_duration(start_date, out_date):
  try:
    return (abs(pd.to_datetime(out_date) - pd.to_datetime(start_date))).dt.days
  except:
    return np.NaN
    
# Setup duration
df['DURATION'] = np.vectorize(fill_duration)(df['START_DATE'], df['OUT_DATE'])


# Check unfilled values
isnull = df['DURATION'].isnull()
valid = df['DURATION'].notnull()

# Fill empty durations
if len(valid) > len(isnull):
  print('More valid durations, using existing duration distribution')
  duration_sample = df['DURATION'].dropna().sample(isnull.sum(), replace=True).values
  df.loc[isnull, 'DURATION'] = duration_sample
else:
  print('Using computed distribution for durations')
  # Distribution for Durations (Calculated using Alberta Durations)
  a = 0.85
  b = 1.94
  loc = 0.00
  scale = 0.46
  size = len(isnull)
  rv = np.rint(st.betaprime(a=a, b=b, loc=loc, scale=scale).rvs(size=size))
  df.loc[isnull, 'DURATION'] = rv

# Verify no empty duration values
null_columns=df.columns[df['DURATION'].isnull().any()]
df[null_columns].isnull().sum()

# Grab list of df2 columns and future full_df columns
full_df_columns = ['locationKey','TOTAL_SIZE_HA','AVERAGE_SIZE_HA','TOTAL_DURATION','AVERAGE_DURATION','YEAR']

# full_df will store each iteration's results, eventually containing all data
full_df = pd.DataFrame(columns=full_df_columns)

for x in years_to_iterate:
    print('Finished appending year: ' + str(x))
    df_old = df[df['YEAR'] < x]
    
    # Create stats
    df_old['TOTAL_SIZE_HA'] = df_old.groupby(['locationKey'])['SIZE_HA'].transform(sum)
    df_old['AVERAGE_SIZE_HA'] = df_old.groupby(['locationKey'])['SIZE_HA'].transform(np.mean)
    df_old['TOTAL_DURATION'] = df_old.groupby(['locationKey'])['DURATION'].transform(sum)
    #df_old['DURATION'] = df_old['DURATION'].replace({0: np.nan})
    df_old['AVERAGE_DURATION'] = df_old.groupby(['locationKey'])['DURATION'].transform(np.nanmean)
    df_old = df_old.drop(['DURATION'], axis = 'columns')
    
    # Unique locations are kept
    df_old = df_old.drop_duplicates(subset=['locationKey'])
    
    # Dropping unnecessary columns
    df_old['LOCATION_YEAR_KEY'] = df['locationKey'] + '|' + str(x)
    df_old = df_old.drop(['FIRE_ID', 'LATITUDE', 'LONGITUDE', 'OUT_DATE', 'SIZE_HA', 'ECODISTRIC', 'ECOREGION', 'ECOZONE', 'START_DATE'], axis = 'columns')
    
    # Fill nulls with 0
    df_old.fillna(0, inplace=True)
    
    # Append the results
    full_df = full_df.append(df_old, ignore_index=True)
    display(df_old.head())
    print(len(df_old))

# Standardizing column names & order
full_df = full_df[['LOCATION_YEAR_KEY', 'TOTAL_SIZE_HA', 'AVERAGE_SIZE_HA', 'TOTAL_DURATION', 'AVERAGE_DURATION']]

# Export results to stats.csv
output_path = f"/content/gdrive/My Drive/Capstone Public Folder/Data/{province} Location/{province}_historic_stats.csv.gz"
full_df.to_csv(output_path, compression = "gzip", index = False)
display(full_df.head())
print(f'Finished exporting as {province}_historic_stats.csv')