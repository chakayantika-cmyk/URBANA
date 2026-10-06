import os
import sys

# Add the backend folder to sys.path so that 'app' module can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.main import app
