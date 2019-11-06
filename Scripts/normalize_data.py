"""
Inputs: (1) shape file components of province vegetation index:
            (a) AVICrownIndex.shp
            (b) AVICrownIndex.prj
            (c) AVICrownIndex.shx
        (2) {prov}_location_grid.csv : csv of province location key grid to be narrowed
Output: {prov}_location_grid_usefulness.csv
Command: python3.6.5 normalize_data
"""

import pyproj
from functools import partial
from shapely.geometry import box
from shapely.ops import transform
from shapely.geometry import Point
import fiona
import pandas as pd
from pathlib import Path
import argparse
import sys


def read_shape_file():
    """
    Reads shape file from AVICrownIndex.shp and converts coordinates to latitude and longitude format
    :return: shapely Polygon of converted forest coordinates within the province
    """
    # import shape file
    shape = fiona.open("../Data/Location/AVICrownIndex.shp")

    # convert shape file into a Polygon of lat/long coordinates
    p_in = pyproj.Proj(shape.crs)
    bound_box = box(*shape.bounds)
    p_out = pyproj.Proj({'init': 'EPSG:4326'})  # aka WGS84
    project = partial(pyproj.transform, p_in, p_out)
    bound_box_wgs84 = transform(project, bound_box)

    # return converted polygon
    return bound_box_wgs84


def update_location_grid(input_polygon, location_df):
    """
    Reads location grid keys and eliminates coordinates outside of input_polygon
    :param input_polygon: Polygon of forest coordinates in province
    :param location_df: Pandas data frame with complete locations keys of province
    :return: Pandas data frame with location keys that fall within input_polygon
    """

    # create updated list to add the rows inside the Polygon
    valid_points = []

    # keep track of the number of points inside / outside of the polygon
    inside = 0
    outside = 0

    for index, row in location_df.iterrows():
        if index > 0:
            # turn every coordinate into a shapely Point
            lat = row[1]
            lon = row[2]
            point = Point(float(lon), float(lat))

            # check if the polygon contains the point
            if input_polygon.contains(point):
                inside += 1
                valid_points.append(row)
            else:
                outside += 1

    print(f'Eliminated: {outside} points.')
    print(f'Updated dataset has: {inside} points.')

    # return updated location grid
    return pd.DataFrame(valid_points, columns=['KEY', 'LATITUDE', 'LONGITUDE'])


def setup_script_arguments():
    """
    Sets up script arguments
    :return: Ready made argument parser
    """
    ap = argparse.ArgumentParser()
    ap.add_argument('-p', type=str, default=2018, help='province to narrow location grid for', action='store',
                    required=False)

    return ap


if __name__ == "__main__":
    # set file name (province) from command line
    province = sys.argv[1:]
    filename = f'{province[:1][0]}_location_grid_usefulness.csv'

    # read shape file
    forest_polygon = read_shape_file()

    # read location key file
    df = pd.read_csv(Path('../Data/Location/alberta_grid_system.csv'))

    # narrow location key file
    updated_df = update_location_grid(forest_polygon, df)

    # output updated location key file
    updated_df.to_csv(Path(f'../Data/Location/{filename}'))
    print('Wrote to ' + str(Path(f'../Data/Location/{filename}')))
