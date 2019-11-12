"""
Inputs: (1) Weather location grid CSV : {prov}_weather_location_grid.csv
        (2) Fire location grid CSV : {prov}_fire_location_grid.csv
        (2) Narrowed location key CSV: {prov}_location_grid.csv
Output: {prov}__dataset.csv
Command: python join_dataset {prov}
"""

import pandas as pd
from pathlib import Path
import sys

if __name__ == "__main__":
    # set file name (province) from command line
    province = sys.argv[1:]
    filename = f'{province[:1][0]}__dataset.csv'

    # read fire data
    fire_df = pd.read_csv(Path('../Data/Fire/AL_fire_location_grid.csv'))

    # read weather data and delete unused columns
    weather_df = pd.read_csv(Path('../Data/Weather/AL_weather_location_grid.csv'), low_memory=False)
    cols_to_delete = ['KEY', 'STATION ID', 'Station Name', 'Longitude (x)', 'Latitude (y)', 'Climate ID', 'Date/Time', 'Year', 'Month', 'Day', 'Data Quality', 'Max Temp Flag', 'Min Temp Flag', 'Mean Temp Flag', 'Heat Deg Days Flag', 'Cool Deg Days Flag', 'Total Rain Flag', 'Total Snow Flag', 'Total Precip Flag', 'Snow on Grnd Flag', 'Dir of Max Gust Flag', 'Spd of Max Gust Flag',]
    for i in cols_to_delete:
        del weather_df[i]

    # outer merge
    merged_df = pd.merge(left=fire_df, right=weather_df, how='outer', left_on='locationKey', right_on='LOCATION KEY')

    # print null columns count
    null_columns = merged_df.columns[merged_df.isnull().any()]
    print(merged_df[null_columns].isnull().sum())

    # output csv
    merged_df.to_csv(Path(f'../Data/Location/{filename}'))
    print('Wrote to ' + str(Path(f'../Data/Location/{filename}')))