"""from django.urls import path
from .views import process_data

urlpatterns = [
    path('process-data/', process_data, name='process_data'),
]
# data_processing_backend/data_processing_app/urls.py """

from django.urls import path
from .views import process_data, upload_csv, get_ongoing_tasks, get_uploaded_files, view_result

urlpatterns = [
    path('http://localhost:8000/api/process-data/', process_data, name='process_data'),
    path('http://localhost:8000/api/upload-csv/', upload_csv, name='upload_csv'),
    path('http://localhost:8000/api/get-ongoing-tasks/', get_ongoing_tasks, name='get_ongoing_tasks'),
    path('http://localhost:8000/api/get-uploaded-files/', get_uploaded_files, name='get_uploaded_files'),
    path('http://localhost:8000/api/view-result/<int:task_id>/', view_result, name='view_result')

    # Add other endpoints as needed
]
