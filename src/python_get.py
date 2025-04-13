import requests
import json
api_url = "https://jsonplaceholder.typicode.com/todos/1"
response = requests.get(api_url)
print(json.dumps(response.json()))  # Explicitly output as JSON string
