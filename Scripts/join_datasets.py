"""
Inputs: (1) Weather location data: {prov}_weather_location_grid.csv
        (2) Fire location data: {prov}_fire_location_grid.csv
        (2) Location grid: {prov}_location_grid.csv
Output: {prov}_dataset.csv
        & prints stats about null columns
Command: python3.6 join_datasets.py {prov}
"""

import pandas as pd
from pathlib import Path
import sys


if __name__ == "__main__":
    # set file name (province) from command line
    input = sys.argv[1:]
    province = input[:1][0]
    filename = f'{province}_dataset.csv'

    # read fire data and create new key
    fire_df = pd.read_csv(Path(f'../Data/Fire/{province}_fire_location_grid.csv'))
    fire_df["KEY"] = fire_df["locationKey"].map(str) + "|" + fire_df["START_DATE"]

    # read weather data
    weather_df = pd.read_csv(Path('../Data/Weather/AL_weather_location_grid.csv'), low_memory=False)
    cols_to_delete = ['KEY', 'STATION ID', 'Station Name', 'Longitude (x)', 'Latitude (y)', 'Climate ID',
                      'Year', 'Month', 'Day', 'Data Quality', 'Max Temp Flag', 'Min Temp Flag', 'Mean Temp Flag',
                      'Heat Deg Days Flag', 'Cool Deg Days Flag', 'Total Rain Flag', 'Total Snow Flag',
                      'Total Precip Flag', 'Snow on Grnd Flag', 'Dir of Max Gust Flag', 'Spd of Max Gust Flag', ]

    # delete unused columns
    for i in cols_to_delete:
        del weather_df[i]

    # create new key
    weather_df["KEY"] = weather_df["LOCATION KEY"].map(str) + "|" + weather_df["Date/Time"]

    # left merge to combine fire and weather data
    merged_df = pd.merge(fire_df, weather_df, how='left')

    # read location data
    location_df = pd.read_csv(Path('../Data/Location/alberta_grid_system.csv'))

    # outer merge with location grid
    merged_df = pd.merge(merged_df, location_df, how='outer', left_on='locationKey', right_on='KEY')

    # print null columns count
    null_columns = merged_df.columns[merged_df.isnull().any()]
    print(merged_df[null_columns].isnull().sum())

    # output csv
    merged_df.to_csv(Path(f'../Data/Location/{filename}'))
    print('Wrote to ' + str(Path(f'../Data/Location/{filename}')))

