"""
Input dataset: current_station_inventory.csv
Output dataset: {prov}_daily_weather_{start_year}_{end_year}.csv'
Command: python weather_collection.py --help
Owner: Ivan Zvonkov
"""

import requests
import pandas as pd
from io import StringIO
import time
import sys
import argparse
from pathlib import Path

def get_weather_data(stationIDs, start_year, end_year, filter_months = []):
    """
    Function to get historical weather data from climate.weather.gc.ca
    :param stationIDs: List of weather station identifiers
    :param start_year: First year to get weather for
    :param end_year: Last year to get weather for
    :return: Pandas dataframe with specified weather data
    """
    df = pd.DataFrame({})
    index = 0
    for stationID in stationIDs:
        index += 1
        start = time.time( )
        for year in range(start_year, end_year+1):
            url = "http://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=csv&" +\
                f"stationID={stationID}&Year={year}&Month=1&Day=14" + "&timeframe=2&submit=Download+Data"
            response = requests.get(url)
            string_data = str(response.content, 'utf-8')
            data = StringIO(string_data)
            new_df = pd.read_csv(data)
            if len(df.index) == 0:
                df = new_df
            else:
                df = pd.concat([df, new_df], ignore_index=True)
        end = time.time()
        total_time = end - start
        print('Got data from ' + str(index) + ' of ' + str(len(stationIDs)) +
              ' weather stations in: ' + str(total_time))

    if len(filter_months) > 0:
        print('Filter by months: ', filter_months)
        df = df.loc[df['Month'].isin(filter_months)]
    return df


def get_stationIDs(province=''):
    """
    Gets station IDs from current_station_inventory.csv
    :param province: Indicates province to get weather stations for
    :return: List of weather station IDs
    """
    df = pd.read_csv(Path('../Data/Weather/current_station_inventory.csv'))
    if province:
        df = df.loc[df['Province'] == province.upper()]
    stationID_list = df['Station ID'].tolist()
    stationID_set = set(stationID_list)
    if len(stationID_list) > len(stationID_set):
        print('Non unique elements found in station ID list returning unique set.')
    return list(stationID_set)


def setup_script_arguments():
    """
    Sets up script arguments
    :return: Ready made argument parser
    """
    ap = argparse.ArgumentParser()
    ap.add_argument('-start', type=int, default=2018, help='first year to get weather for',
                    action='store', required=False)
    ap.add_argument('-end', type=int, default=2019, help='last year to get weather for', action='store',
                    required=False)
    ap.add_argument('-p', type=str, default=2018, help='first year to get weather for', action='store',
                    required=False)
    ap.add_argument('-m', type=int, nargs='+', default=[], help='first year to get weather for',
                    action='store', required=False)

    return ap


if __name__ == '__main__':

    argv = sys.argv[1:]
    argument_parser = setup_script_arguments()
    arg_values = vars(argument_parser.parse_args(argv))

    # Setup values
    province = arg_values['p']
    start_year = arg_values['start']
    end_year = arg_values['end']
    filter_months = arg_values['m']
    filename = f'{province[:2]}_daily_weather_{start_year}_{end_year}.csv'
    # Collect data
    stationIDs = get_stationIDs(province)
    complete_start = time.time()
    result = get_weather_data(stationIDs, start_year, end_year, filter_months)
    complete_end = time.time()
    total_time = (complete_end - complete_start)/60
    print(f'Total time: {total_time}')

    # Output to file
    result.to_csv(Path(f'../Data/Weather/{filename}'))
    print('Wrote to '+ str(Path(f'../Data/Weather/{filename}')))
