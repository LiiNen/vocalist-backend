import os
import json
import time
import requests

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import load_dotenv

from datetime import date, timedelta

load_dotenv(verbose=True)

TJ_CHART_SRC=os.getenv('TJ_CHART')
TJ_NEW_SRC=os.getenv('TJ_NEW')
MOVIE_URL=os.getenv('MOVIE_URL')
SEARCH_BASE=os.getenv('SEARCH_BASE')
POST_URL=os.getenv('POST_URL')
PATCH_URL=os.getenv('PATCH_URL')
CHART_VERSION_URL=os.getenv('CHART_VERSION_URL')
MAINTENANCE_URL=os.getenv('MAINTENANCE_URL')

music_data_list = []
error = 0
patch = 0
post = 0
exist = 0

date_query = ''

def init_chart_data():
  global music_data_list, error, patch, post, exist
  music_data_list = []
  error = 0
  patch = 0
  post = 0
  exist = 0


def add_row(param):
  global music_data_list
  music_data_list.append({
    'chart': param[0],
    'number': param[1],
    'title': param[2],
    'artist': param[3],
    'isMR': param[4],
    'isMV': param[5],
    'isLIVE': param[6]
  })

def date_setter():
  global date_query
  date_query = ''
  today = date.today()
  patch_chart(today, 2)
  date_query = '&EYY=' + str(today.year) + '&EMM=' + str(today.month) + '&EDD=' + str(today.day) + date_query
  week = today - timedelta(days=6)
  patch_chart(week, 3)
  date_query = 'SYY=' + str(week.year) + '&SMM=' + str(week.month) + '&SDD=' + str(week.day) + date_query

def get_chart():
  global date_query
  init_chart_data()

  driver.get(TJ_CHART_SRC + date_query)
  chart_list = driver.find_elements(By.CSS_SELECTOR, '#BoardType1 tbody tr')
  chart_list.pop(0)

  for chart in chart_list:
    chart_td = chart.find_elements(By.CSS_SELECTOR, 'td')
    add_row([chart_td[0].text, chart_td[1].text, chart_td[2].text, chart_td[3].text, False, False, False])
  
  post_data()


def get_new():
  init_chart_data()

  driver.get(TJ_NEW_SRC)
  new_list = driver.find_elements(By.CSS_SELECTOR, '#BoardType1 tbody tr')
  new_list.pop(0)
  
  for new in new_list:
    new_td = new.find_elements(By.CSS_SELECTOR, 'td')
    add_row([-1, new_td[0].text, new_td[1].text, new_td[2].text, False, False, False])

  post_data()


def post_data():
  global music_data_list, error, patch, post, exist
  res = requests.patch(PATCH_URL)
  for chart_data in music_data_list:
    request_body = {
      'chart': chart_data['chart'],
      'number': chart_data['number'],
      'title': chart_data['title'],
      'artist': chart_data['artist'],
      'isMR': chart_data['isMR'],
      'isMV': chart_data['isMV'],
      'isLIVE': chart_data['isLIVE']
    }
    res = requests.post(POST_URL, json=request_body)
    if(res.json()['status'] == False):
        error = error + 1
    else:
      if(res.json()['body'] == 'patch'):
        patch = patch + 1
      if(res.json()['body'] == 'post'):
        post = post + 1
      if(res.json()['body'] == 'exist'):
        exist = exist + 1
    if (error+patch+post+exist == len(music_data_list)):
      print(error, patch, post, exist)

# id 2 for today, 3 for week ago
def patch_chart(target, id):
  target_date = str(target.year) + '/' + str(target.month) + '/' + str(target.day)
  request_body = {
    'date': target_date,
    'id': id,
  }
  res = requests.patch(CHART_VERSION_URL, json=request_body)

def get_movie():
  res = requests.get(MOVIE_URL)
  empty_movie_list = res.json()['body']
  request_body_list = []
  for empty_movie in empty_movie_list:
    count = 0
    while(True):
      try:
        driver.get(SEARCH_BASE + empty_movie['artist'] + '+' + empty_movie['title'])
        code = driver.find_elements(By.CSS_SELECTOR, 'a#video-title')[0].get_attribute('href')
        request_body_list.append([empty_movie['id'], code.split('watch?v=')[1]])
        break
      except:
        if(count > 10):
          break
        count += 1
        continue
  success = 0
  error = 0
  for request_body in request_body_list:
      datas = {
        'id': request_body[0],
        'code': request_body[1]
      }
      res = requests.patch(MOVIE_URL, json=datas)
      if(res.json()['status'] == False):
        error = error + 1
      else:
        success = success + 1
  print('movie patch: ', error, success)

def delete_movie():
  res = requests.delete(MOVIE_URL)

def maintenance_update(state):
  request_body = {
    'build': state
  }
  res = requests.patch(MAINTENANCE_URL, json=request_body)

options = webdriver.ChromeOptions()
options.add_argument('headless')
options.add_argument('window-size=1920x1080')
options.add_argument("disable-gpu")

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

delete_movie()
maintenance_update(1)

get_new() # get/set new musics
date_setter() # get/set week(7days) date query
get_chart() # get/set week chart
get_movie() # get/set movie data if not exists

maintenance_update(0)

driver.quit()