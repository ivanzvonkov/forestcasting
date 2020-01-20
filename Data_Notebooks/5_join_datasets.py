# -*- coding: utf-8 -*-
"""5-join_datasets.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1i45c1n0Q53m7Tx_-Dm-cTiTO0a02or1X

# Join Datasets

Inputs:

(1) Base_dataset

(2) List of datasets to merge to base

(3) Columns to merge on

Output:

{joint_dataset}.csv
"""

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

jointdataset = "AL_dataset"
# base dataset all other datasets are merged with (ie. left)
base_dataset = {"path": "Colab Data/init_AL_dataset.csv.gz"}

# list of datasets to be merged to base. "key" = column of dataset specifed in path to merge on (ie. right key)
# base_key = column of base_dataset to match it to (ie. left key)
datasets = [{"path": "Colab Data/AL_data_with_eco.csv.gz", "key": "KEY", "base_key": "LOCATION_KEY"},
            {"path": "Colab Data/AL_dataset_stats.csv.gz", "key":"LOCATION_DATE_KEY", "base_key": "LOCATION_DATE_KEY"}]

# Add your root path here
root_path = '/content/gdrive/My Drive/Capstone Public Folder/Data/'

# Outer merge to combine datasets
merged_df =  pd.read_csv(root_path + base_dataset["path"], compression = 'gzip')
for data in datasets:
  data_df = pd.read_csv(root_path + data["path"], compression = 'gzip')
  merged_df = pd.merge(merged_df, data_df, how='left', left_on = data["base_key"], right_on = data["key"])

del merged_df['KEY']
merged_df.head()

# Which features contain null or NaN values
null_columns=merged_df.columns[merged_df.isnull().any()]
merged_df[null_columns].isnull().sum()

# Save file to google drive
output_path = root_path + f'Colab Data/{jointdataset}.csv.gz'
merged_df.to_csv(output_path, compression = "gzip", index = False)

# Download the file locally 
files.download(f'{jointdataset}.csv.gz')