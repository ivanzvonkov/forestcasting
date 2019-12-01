"""
Inputs: (1) Weather location data: {prov}_weather_location_grid.csv
        (2) Fire location data: {prov}_fire_location_grid.csv
Output: {prov}_dataset.csv
        & prints stats about null columns
Command: python3.6 join_datasets.py {prov}
"""

import pandas as pd
from pathlib import Path
import sys
import math


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
    cols_to_delete = ['STATION ID', 'Station Name', 'Longitude (x)', 'Latitude (y)', 'Climate ID',
                      'Year', 'Month', 'Day', 'Data Quality', 'Max Temp Flag', 'Min Temp Flag', 'Mean Temp Flag',
                      'Heat Deg Days Flag', 'Cool Deg Days Flag', 'Total Rain Flag', 'Total Snow Flag',
                      'Total Precip Flag', 'Snow on Grnd Flag', 'Dir of Max Gust Flag', 'Spd of Max Gust Flag', ]

    # delete unused columns
    for i in cols_to_delete:
        del weather_df[i]

    # outer merge to combine fire and weather data
    merged_df = pd.merge(fire_df, weather_df, how='outer')

    # convert FIRE ID to string so we can identify null values
    merged_df['FIRE_ID'] = merged_df['FIRE_ID'].astype(str)

    # Label fire and no fire rows
    merged_df['Fire'] = merged_df['FIRE_ID'].apply(lambda fire_id: 0 if fire_id == "nan" else 1)

    print(merged_df)

    # output csv
    merged_df.to_csv(Path(f'../Data/Location/{filename}'))
    print('Wrote to ' + str(Path(f'../Data/Location/{filename}')))

