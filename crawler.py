import os
import json
import time
import requests

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import load_dotenv


chart_data_list = []
load_dotenv(verbose=True)
TJ_SRC=os.getenv('TJ_CHART')
POST_URL=os.getenv('POST_URL')
PATCH_URL=os.getenv('PATCH_URL')

def init_chart_data():
  chart_data_list = []

def add_chart_row(param):
  chart_data_list.append({
    'chart': param[0],
    'number': param[1],
    'title': param[2],
    'artist': param[3],
    'isMR': param[4],
    'isMV': param[5]
  })

def get_chart():
  driver.get(TJ_SRC)
  chart_list = driver.find_elements(By.CSS_SELECTOR, '#BoardType1 tbody tr')
  chart_list.pop(0)

  for chart in chart_list:
    chart_td = chart.find_elements(By.CSS_SELECTOR, 'td')
    add_chart_row([chart_td[0].text, chart_td[1].text, chart_td[2].text, chart_td[3].text, False, False])

def post_chart():
  res = requests.patch(PATCH_URL)
  error = 0
  patch = 0
  post = 0
  for chart_data in chart_data_list:
    request_body = {
      'chart': chart_data['chart'],
      'number': chart_data['number'],
      'title': chart_data['title'],
      'artist': chart_data['artist'],
      'isMR': chart_data['isMR'],
      'isMV': chart_data['isMV']
    }
    res = requests.post(POST_URL, json=request_body)
    if(res.json()['status'] == False):
        error = error + 1
    else:
        if(res.json()['body'] == 'patch'):
            patch = patch + 1
        if(res.json()['body'] == 'post'):
            post = post + 1
    if (error+patch+post == 100):
      print(error, patch, post)

options = webdriver.ChromeOptions()
options.add_argument('headless')
options.add_argument('window-size=1920x1080')
options.add_argument("disable-gpu")

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

init_chart_data()
get_chart()
post_chart()

driver.quit()