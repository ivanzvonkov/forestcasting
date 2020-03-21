# -*- coding: utf-8 -*-
"""7-train.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1P_WHGSuLu1J4oHGFyg4o7oeMmht7Zsiq

# Training 
Inputs:
- {province}_processed_sample_dataset.csv.gz


Trains various model on sample dataset.

# Setup
"""

!pip install catboost
!pip install lightgbm

# Imports
import pandas as pd
import numpy as np
from google.colab import files, drive
from datetime import datetime
from os import path
from matplotlib.pyplot import figure
import sys

# keras for dnn
from keras.layers.core import Dense, Activation
from keras.utils.np_utils import to_categorical
from keras.models import Sequential
from keras.layers import LeakyReLU
from keras.wrappers.scikit_learn import KerasClassifier

# sklearn for simpler models
from sklearn.linear_model import LogisticRegression, Perceptron, SGDClassifier
from sklearn.svm import SVC, LinearSVC
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, GradientBoostingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.feature_selection import SelectKBest, chi2, mutual_info_classif
from sklearn.decomposition import PCA
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV, RandomizedSearchCV
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, roc_curve, auc, confusion_matrix, roc_curve, roc_auc_score
from sklearn.externals import joblib
from sklearn.utils.multiclass import unique_labels

# xgboost
import xgboost as xgb

# catboost
from catboost import CatBoostClassifier

# LGM
from lightgbm import LGBMClassifier

import matplotlib.pyplot as plt

from scipy.stats import pearsonr

# Mount Google Drive
drive.mount('/content/gdrive')

# Set path to data folder
root_path = '/content/gdrive/My Drive/Capstone Public Folder/Data/'
model_path = '/content/gdrive/My Drive/Capstone Public Folder/Models/'

# Read in results
results_path = root_path + f'ML Data/results.csv.gz'
tune_results_path = root_path + f'ML Data/tune_results.csv.gz'
try:
  results_df = pd.read_csv(results_path, compression='gzip')
except:
  results_df = ''

try:
  tune_results_df = pd.read_csv(tune_results_path, compression='gzip')
except:
  tune_results_df = ''

tune_results_df

"""# Load and Split Data"""

# Read in data sets from different data sets
provinces = ['BC', 'AL', 'SK', 'MB', 'ON', 'QB']
dfs = []
for province in provinces:
  df_path = root_path + f'{province} Location/{province}_processed_sample_dataset.csv.gz'
  dfs.append(pd.read_csv(df_path))
df = pd.concat(dfs)
df

# Before one hot encoding, get all values to use in production
eco_labels = ['ECOZONE', 'ECOREGION', 'ECODISTRICT']
ohe_dict = {}
for label in eco_labels:
  ohe_dict[label] = df[label].unique()

ohe_dict

df = df.set_index('LOCATION_DATE_KEY')

df = pd.get_dummies(df, columns=eco_labels)

# Sampling after getting eco_labels ensure no eco_labels are left behind
df = df.sample(frac=0.2)

# Since the dataframe is sampled shuffling is not necessary
train, test = train_test_split(df, test_size=0.1, shuffle=False)

# Sample train - Make 40 fire / 60 no fire split
upsample_fire_to_be = 0.1
train_fire = train[train['FIRE'] == 1]
train_no_fire = train[train['FIRE'] == 0]
fire_amount = len(train_fire)
no_fire_amount = len(train_no_fire)
desired_no_fire_amount = fire_amount*((1-upsample_fire_to_be)/upsample_fire_to_be)
desired_no_fire_fraction = desired_no_fire_amount / no_fire_amount
train_no_fire_sample = train_no_fire.sample(frac=desired_no_fire_fraction)
train_sample = pd.concat([train_fire, train_no_fire_sample], axis=0)

X_train = train_sample.drop(['FIRE'], axis=1)
y_train = train_sample['FIRE']

X_test = test.drop(['FIRE'], axis=1)
y_test = test['FIRE']

# # Create test and training sets
# df = df.set_index('LOCATION_DATE_KEY')
# X = df.drop('FIRE', axis=1)
# y = df['FIRE']
# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3)

# print(f'Train df size: {len(X_train)}')
# print(f'Test df size: {len(X_test)}')

"""## Correlations"""

# Feature correlation
for col in X_train.columns.tolist()[0:]:
  print(f'{col}: {pearsonr(X_train[col], y_train)}')

# Evaluating PCA
pca = PCA(n_components=39)
pca.fit(X_train)

plt.plot(np.cumsum(pca.explained_variance_ratio_))
plt.xlabel('Number of components')
plt.ylabel('Cumulative explained variance')

# From above we see that variance does not really change after 5 components
# pca = PCA(n_components=35)
# X_pca_train = pca.fit_transform(X_train)
# X_pca_test = pca.transform(X_test)
# pca_std = np.std(X_pca_train)

# print(X_train.shape)
# print(X_pca_train.shape)

"""# Testing out Different Models"""

# Setup sklearn tests
algorithms = {
  #Sklearn models
  #'SVC': SVC(), # Look into hyper parameter tuning
  'LogisticRegression': LogisticRegression(),
  'RandomForestClassifier': RandomForestClassifier(),
  #'KNeighborsClassifier': KNeighborsClassifier(),
  #'GaussianNB': GaussianNB(),
  'DecisionTreeClassifier': DecisionTreeClassifier(),
  #'ExtraTreesClassifier': ExtraTreesClassifier(), 
  #'GradientBoostingClassifier': GradientBoostingClassifier(),

  #XGboost models
  'XGBoost': xgb.XGBClassifier(),
  #'XGBoostRandomForest': xgb.XGBRFClassifier(),

  #Catboost models
  'CatBoostClassifier': CatBoostClassifier(),

  #Light GBM
  'LGBMClassifier': LGBMClassifier(),
}

# Test algorithms
results = {}
for key in algorithms:
  ml_algorithm = algorithms[key]
  print(key)
  cv_scores = cross_val_score(ml_algorithm, X_train, y_train, cv = 5, scoring = 'neg_log_loss')
  results[key] = -cv_scores.mean()

  # ml_algorithm.fit(X_train, y_train)
  # y_pred = ml_algorithm.predict(X_test)
  # acc_log = round(accuracy_score(y_pred, y_test) * 100, 2)

results

"""# Neural Network with Keras

Useful: [How to Grid Search Hyperparameters for Deep Learning Models in Python With Keras](https://machinelearningmastery.com/grid-search-hyperparameters-deep-learning-models-python-keras/)
"""

feature_num = X_train.shape[1]
def create_model(
    hidden_units=64, 
    layers=3, 
    #activation_func=Activation('relu')
  ):

  # Try decreasing and increasing hidden units
  # Try larger amount of parameters
  model = Sequential()
  model.add(Dense(hidden_units, input_shape=(feature_num,)))
  for i in range(layers):
    model.add(Dense(hidden_units))
    model.add(Activation('relu'))
  model.add(Dense(1))
  model.add(Activation('softmax')) # Output activation
  model.compile(
      loss='binary_crossentropy', 
      optimizer='adam', 
      metrics=['accuracy']
      )
  return model

model = KerasClassifier(
    build_fn=create_model, 
    hidden_units=64, 
    layers=3)
    #activation_func=Activation('relu'))

param_grid = {
    'epochs': [10],#[10,50,100],
    'batch_size': [10],#[10,20,100],#[10,20,40,60,80,100],
    'hidden_units': [32,64],#[16, 32, 64],
    'layers': [3,4]#[3,4,5],
}

grid = GridSearchCV(estimator=model, param_grid=param_grid, n_jobs=1, cv=5)
grid_result = grid.fit(X_train, y_train)

print("Best: %f using %s" % (grid_result.best_score_, grid_result.best_params_))

results['keras'] = grid_result.best_score_

# Add to results data table 
now = datetime.now()
results['DateTime'] = now.strftime("%Y-%m-%d %H:%M:%S")
results['Note'] = 'First run with multiple provinces: AL, BC, QB'
if len(results_df) == 0:
  results_df = pd.DataFrame(results, index=[0])
else:
  results_df = results_df.append(results, ignore_index=True)

results_df

results_df.to_csv(results_path, compression='gzip', index=False)

transposed_df = results_df[
  ['LogisticRegression',	
   'keras',
   'RandomForestClassifier', 
   'XGBoost', 
   'CatBoostClassifier',
   'ExtraTreesClassifier',
   'GradientBoostingClassifier'
   ]].tail(1).T
transposed_df

ax = transposed_df.plot.bar( rot=45, legend=False, title='Best Performing Models', figsize=(10,8))
ax.set_ylabel('Validation Log Likelihood Loss')

"""# Identifying top models
Best performing models seem to be:

* RandomForestClassifier
* XGBoost
* CatBoostClassifier
* LGBMClassifier

Can we tune the hyperparameters to get further performance?

Links to look at: [Hyperparameter Tuning Random Forest](https://towardsdatascience.com/hyperparameter-tuning-the-random-forest-in-python-using-scikit-learn-28d2aa77dd74)

# Hyperparameter Tuning
"""

def randomSearch(estimator, param_grid):
  rf_random = RandomizedSearchCV(
    estimator=estimator, 
    param_distributions=param_grid, 
    cv=5, 
    scoring='neg_log_loss', 
    verbose=3)
  rf_random_result = rf_random.fit(X_train, y_train)
  return rf_random_result

tune_results = {}
def setTuneResults(model_name, random_result, model):
  tune_results[model_name] = {}
  tune_results[model_name]['score'] = -random_result.best_score_
  tune_results[model_name]['params'] = random_result.best_params_
  tune_results[model_name]['model'] = model

"""### Logistic Regression"""

param_grid = {
  "C":np.logspace(-3,3,7), 
  "penalty":["l2"]
}
lr_random_result = randomSearch(LogisticRegression(), param_grid)

# After getting more data and more feature engineering can start hyper parameter tuning
print("Best: %f using %s" % (-lr_random_result.best_score_, lr_random_result.best_params_))
setTuneResults('LogisticRegression', lr_random_result, LogisticRegression(**lr_random_result.best_params_))

"""### Random Forest Classifier"""

param_grid = {
  'n_estimators': [128], # Number of trees - increasing has negligible improvement
  'max_features': ['auto'], # Number of features to consider at every split
  'max_depth': [None], # Maximum number of levels in tree
  'min_samples_split': [5], # Minimum number of samples required to split a node
  'min_samples_leaf': [2], # Minimum number of samples required at each leaf node
}
rf_random_result = randomSearch(RandomForestClassifier(), param_grid)

# After getting more data and more feature engineering can start hyper parameter tuning
print("Best: %f using %s" % (-rf_random_result.best_score_, rf_random_result.best_params_))
setTuneResults('RandomForest', rf_random_result, RandomForestClassifier(**rf_random_result.best_params_))

"""### Catboost Classifier"""

param_grid = {
  'depth':[6,8,10], # tree depth - optimal 6-10 per docs
  'iterations':[250,1000], # number of trees
  'learning_rate':[0.01,0.1], # speed of reducing gradient step
  'l2_leaf_reg':[1,10,100], # regularization amount
  'border_count':[10,128,254], 
}
cb_random_result = randomSearch(CatBoostClassifier(), param_grid)

# After getting more data and more feature engineering can start hyper parameter tuning
print("Best: %f using %s" % (-cb_random_result.best_score_, cb_random_result.best_params_))
setTuneResults('Catboost', cb_random_result, CatBoostClassifier(**cb_random_result.best_params_))

"""### XGBoost
[Parameter descriptions](https://www.analyticsvidhya.com/blog/2016/02/complete-guide-parameter-tuning-gradient-boosting-gbm-python/)

[Params source](https://towardsdatascience.com/doing-xgboost-hyper-parameter-tuning-the-smart-way-part-1-of-2-f6d255a45dde)
"""

param_grid = {
  "learning_rate": [0.05, 0.30 ], 
  "max_depth": [ 3, 10],
  'max_features': ['sqrt'],
  "min_child_weight": [ 1, 3],
  "gamma": [ 0.0, 0.2 ],
  "colsample_bytree": [ 0.3, 0.5  ] 
}
random_result = randomSearch(xgb.XGBClassifier(), param_grid)

# After getting more data and more feature engineering can start hyper parameter tuning
print("Best: %f using %s" % (-random_result.best_score_, random_result.best_params_))
setTuneResults('XGBoost', random_result, xgb.XGBClassifier(**random_result.best_params_))

"""### LGBMClassifier

[Docs](https://lightgbm.readthedocs.io/en/latest/pythonapi/lightgbm.LGBMClassifier.html)
"""

param_grid = {
  "learning_rate": [0.05, 0.10, 0.15, 0.20, 0.25, 0.30 ],
  'num_leaves': [30,60,100,200],
  'max_depth': [ 3, 4, 5, 6, 8, 10, 12, 15],
  'n_estimators': [50,100,150]
}
random_result = randomSearch(LGBMClassifier(), param_grid)

# After getting more data and more feature engineering can start hyper parameter tuning
print("Best: %f using %s" % (-random_result.best_score_, random_result.best_params_))
setTuneResults('LGBM', random_result, LGBMClassifier(**random_result.best_params_))

"""### Latest hyperparameter tuning 
To do - make this into df
* RandomForestClassifier: 0.356090
* CatBoostClassifier: 0.344191
* XGBoostClassifier: 0.345161
* LGBMClassifier: 0.345304

Looks like all boosting classifiers have about the same loss.

# Winner Classifier Dump
"""

tune_results

tune_results_for_df = {}
for model_name in tune_results: 
  print(model_name)
  winning_model = tune_results[model_name]['model']
  winning_model.fit(X_train, y_train)
  y_pred = winning_model.predict(X_test)
  prf = precision_recall_fscore_support(y_test, y_pred)
  # joblib.dump(winning_model, model_path + model_name + '.joblib.z')

  tune_results_for_df[model_name+'_accuracy'] = accuracy_score(y_test, y_pred)
  tune_results_for_df[model_name+'_score'] = tune_results[model_name]['score']
  tune_results_for_df[model_name+'_precision'] = str(prf[0])
  tune_results_for_df[model_name+'_recall'] = str(prf[1])
  tune_results_for_df[model_name+'_fscore'] = str(prf[2])
  tune_results_for_df[model_name+'_conf'] = confusion_matrix(y_test, y_pred)
  y_pred_probs = winning_model.predict_proba(X_test)
  auc = roc_auc_score(y_test, y_pred_probs[:,1])
  print('ROC AUC=%.3f' % (auc))
  fpr, tpr, _ = roc_curve(y_test, y_pred_probs[:,1])
  # plot the roc curve for the model
  plt.plot(fpr, tpr, linestyle='--')
  # axis labels
  plt.xlabel('False Positive Rate')
  plt.ylabel('True Positive Rate')

plot_confusion_matrix(y_test, y_pred_probs[:,1]>0.5, np.array(['No fire', 'Fire']))

def plot_confusion_matrix(y_true, y_pred, classes,
                          normalize=False,
                          title=None,
                          cmap=plt.cm.Blues):
    """
    This function prints and plots the confusion matrix.
    Normalization can be applied by setting `normalize=True`.
    """
    if not title:
        if normalize:
            title = 'Normalized confusion matrix'
        else:
            title = 'Confusion matrix, without normalization'

    # Compute confusion matrix
    cm = confusion_matrix(y_true, y_pred)
    # Only use the labels that appear in the data
    classes = classes[unique_labels(y_true, y_pred).astype(int)]
    if normalize:
        cm = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]
        print("Normalized confusion matrix")
    else:
        print('Confusion matrix, without normalization')

    fig, ax = plt.subplots()
    ax.axis('equal')
    im = ax.imshow(cm, interpolation='nearest', cmap=cmap)
    ax.figure.colorbar(im, ax=ax)
    # We want to show all ticks...
    ax.set(xticks=np.arange(cm.shape[1]),
           yticks=np.arange(cm.shape[0]),
           # ... and label them with the respective list entries
           xticklabels=classes, yticklabels=classes,
           title=title,
           ylabel='True label',
           xlabel='Predicted label')

    # Rotate the tick labels and set their alignment.
    plt.setp(ax.get_xticklabels(), rotation=45, ha="right",
             rotation_mode="anchor")

    # Loop over data dimensions and create text annotations.
    fmt = '.2f' if normalize else 'd'
    thresh = cm.max() / 2.
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(j, i, format(cm[i, j], fmt),
                    ha="center", va="center",
                    color="white" if cm[i, j] > thresh else "black")
    fig.tight_layout();
    return ax

tune_results_for_df

len(y_pred_probs[:,1])

now = datetime.now()
tune_results_for_df['DateTime'] = now.strftime("%Y-%m-%d %H:%M:%S")
tune_results_for_df['Note'] = 'All provinces, 0.01 fire'
if len(tune_results_df) == 0:
  tune_results_df = pd.DataFrame(tune_results_for_df, index=[0])
else:
  tune_results_df = results_df.append(tune_results_for_df, ignore_index=True)

tune_results_df

tune_results_df.to_csv(tune_results_path, compression='gzip', index=False)

"""# Helper for production function"""

X.columns