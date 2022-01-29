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

options = webdriver.ChromeOptions()
options.add_argument('headless')
options.add_argument('window-size=1920x1080')
options.add_argument("disable-gpu")

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

init_chart_data()
get_chart()
print(chart_data_list)

driver.quit()