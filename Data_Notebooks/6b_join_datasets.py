# -*- coding: utf-8 -*-
"""6b-join_datasets.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1i45c1n0Q53m7Tx_-Dm-cTiTO0a02or1X

# Join Datasets

Inputs:

(1) Dataset #1: {dataset1}.csv

(2) Dataset #1: {dataset2}.csv

Output:

{joint_dataset}.csv
"""

dataset1 = "AL_dataset_stats" # make sure the incoming dataset does not have unnamed cols -> set index=False when exporting
folder1 = "Colab Data"
dataset2 = "AL_dataset"
folder2 = "Colab Data"
jointdataset = "AL_dataset"

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

# Shima's root path
#root_path = '/content/gdrive/My Drive/Capstone Public Folder/Data/'

# Ivan's root path
root_path = '/content/gdrive/My Drive/U - SE 4455 Software Design/Capstone Public Folder/Data/'

# Access fire data gzip directly
dataset1_file_path = root_path + f'{folder1}/{dataset1}.csv.gz'
dataset1_df = pd.read_csv(dataset1_file_path, compression='gzip', index_col=0)
dataset1_df.head()

# Access fire data gzip directly
dataset2_file_path = root_path + f'{folder2}/{dataset2}.csv.gz'
dataset2_df = pd.read_csv(dataset2_file_path, compression='gzip', index_col=0)
dataset2_df.head()

# Outer merge to combine datasets
merged_df = pd.merge(dataset1_df, dataset2_df, how='outer')
del merged_df['locationKey']

# for now - delete unnamed column - but must be fixed in imported csv
del merged_df['Unnamed: 0.1']
merged_df.head()

# Compress csv
merged_df.to_csv(f'{jointdataset}.csv.gz', compression='gzip', index=False)
merged_df.head()

# Download the file locally 
files.download(f'{jointdataset}.csv.gz')

# Save file to google drive
output_path = root_path + f'Colab Data/{jointdataset}.csv.gz'
shutil.copy(f'{jointdataset}.csv.gz', output_path)