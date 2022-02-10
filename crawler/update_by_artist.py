import os
import json
import time
import requests

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import load_dotenv

from tqdm import tqdm

load_dotenv(verbose=True)

TJ_CHART_SRC=os.getenv('TJ_CHART')
TJ_NEW_SRC=os.getenv('TJ_NEW')
MOVIE_URL=os.getenv('MOVIE_URL')
SEARCH_BASE=os.getenv('SEARCH_BASE')
POST_URL=os.getenv('POST_URL')
PATCH_URL=os.getenv('PATCH_URL')
ARTIST_GETTER=os.getenv('ARTIST_GETTER')
ARTIST_SEARCH_BASE=os.getenv('ARTIST_SEARCH_BASE')
ARTIST_SEARCH_QUERY=os.getenv('ARTIST_SEARCH_QUERY')

music_data_list = []
error = 0
patch = 0
post = 0
exist = 0

options = webdriver.ChromeOptions()
options.add_argument('headless')
options.add_argument('window-size=1920x1080')
options.add_argument("disable-gpu")

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

def dict_parser(dict):
  return dict['artist']

res = requests.get(ARTIST_GETTER + '?all=0')
artist_json_list = res.json()['body']
artist_list = list(map(dict_parser, artist_json_list))

music_data_list = []
number_list = []
error = 0
patch = 0
post = 0
exist = 0

def init_music_data():
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

for artist in tqdm(artist_list):
  for acc in range(0, 2): #acc=1 for exact search
    search_name = artist.replace(' ', '')
    # search combined artist
    try:
      driver.get(ARTIST_SEARCH_BASE+search_name+ARTIST_SEARCH_QUERY+str(acc))
      search_result_list = driver.find_elements(By.CSS_SELECTOR, '#BoardType1 tbody tr')
      
      if search_result_list[1].text != '검색결과를 찾을수 없습니다.':
        search_result_list.pop(0)
        for search_result in search_result_list:
          try:
            result_td = search_result.find_elements(By.CSS_SELECTOR, 'td')
            badge = result_td[1].find_elements(By.CSS_SELECTOR, '.mr_icon')
            isMR, isMV, isLIVE = False, False, False
            if len(badge) > 0:
              badge_type = badge[0].get_attribute('src').split('/')[-1].split('_')[0]
              if badge_type == 'mr':
                isMR = True
              elif badge_type == 'live':
                isLIVE = True
              else:
                print(artist, 'exception', badge_type)
            
            # check duplicant & add
            if result_td[0].text in number_list:
              continue
            add_row([-1, result_td[0].text, result_td[1].text, result_td[2].text, isMR, isMV, isLIVE])
            number_list.append(result_td[0].text)
          except:
            print(search_name, 'search error')
            continue
    except:
      print(search_name, 'artist error')
    
    # search each artist
    search_name_list = artist.replace(' ', '').split(',')
    if "(" in artist and artist[0] != '(':
      search_name_list.append(artist.replace(' ', '').split('(')[0])
    if len(search_name_list) == 1:
      continue
    for search_name in search_name_list:
      search_name_query = search_name
      if ")" in search_name and "(" not in search_name:
        search_name_query = search_name.replace(")", "")
      try:
        driver.get(ARTIST_SEARCH_BASE+search_name_query+ARTIST_SEARCH_QUERY+str(acc))
        search_result_list = driver.find_elements(By.CSS_SELECTOR, '#BoardType1 tbody tr')
        
        if search_result_list[1].text != '검색결과를 찾을수 없습니다.':
          search_result_list.pop(0)
          for search_result in search_result_list:
            try:
              result_td = search_result.find_elements(By.CSS_SELECTOR, 'td')
              badge = result_td[1].find_elements(By.CSS_SELECTOR, '.mr_icon')
              isMR, isMV, isLIVE = False, False, False
              if len(badge) > 0:
                badge_type = badge[0].get_attribute('src').split('/')[-1].split('_')[0]
                if badge_type == 'mr':
                  isMR = True
                elif badge_type == 'live':
                  isLIVE = True
                else:
                  print(artist, 'exception', badge_type)
                    
              # check duplicant & add
              if result_td[0].text in number_list:
                continue
              add_row([-1, result_td[0].text, result_td[1].text, result_td[2].text, isMR, isMV, isLIVE])
              number_list.append(result_td[0].text)
            except:
              print(search_name, 'search error')
              continue
      except:
        print(search_name, 'artist error')
        continue

def post_data():
  global music_data_list, error, patch, post, exist
  for music_data in music_data_list:
    request_body = {
      'chart': -1,
      'number': music_data['number'],
      'title': music_data['title'],
      'artist': music_data['artist'],
      'isMR': music_data['isMR'],
      'isMV': music_data['isMV'],
      'isLIVE': music_data['isLIVE']
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

post_data()
res = requests.patch(ARTIST_GETTER)
driver.quit()