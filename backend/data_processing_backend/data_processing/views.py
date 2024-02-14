

# Create your views here.

# views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import CSVFile, Task
import json
import pandas as pd
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from io import StringIO
from django.core.files.base import ContentFile
from django.urls import reverse
from django.shortcuts import render

@csrf_exempt
def upload_csv(request):
    if request.method == 'POST':
        csv_file = request.FILES.get('csvFile')

        if csv_file:
            CSVFile.objects.create(file=csv_file)

            return JsonResponse({"message": "CSV file uploaded successfully"})
        else:
            return JsonResponse({"error": "No CSV file provided"})

    return JsonResponse({"error": "Invalid request method"})

@csrf_exempt
def process_data(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        processing_function = data.get('processingFunction')
        selected_variable = data.get('selectedVariable')
        csv_file_content = data.get('csvFileContent')

        try:
            df = pd.read_csv(StringIO(csv_file_content))

            if processing_function == 'standardization':
                scaler = StandardScaler()
                df[selected_variable] = scaler.fit_transform(df[[selected_variable]])

            elif processing_function == 'minMaxScaling':
                scaler = MinMaxScaler()
                df[selected_variable] = scaler.fit_transform(df[[selected_variable]])

            updated_csv = df.to_csv(index=False)

            csv_file = CSVFile.objects.create()
            csv_file.file.save(f'file_{csv_file.id}.csv', ContentFile(updated_csv))

            task = Task.objects.create(status='running')
            result_url = reverse('view_result', args=[task.id])  # Assuming you have a view named 'view_result'
            task.result_url = result_url
            task.status = 'completed'
            task.save()

            result = {
                "result": "Success",
                "updatedCsv": updated_csv,
                "taskId": task.id
            }

            return JsonResponse(result)

        except Exception as e:
            error_message = str(e)
            return JsonResponse({"error": error_message})

    return JsonResponse({"error": "Invalid request method"})

@csrf_exempt
def get_uploaded_files(request):
    if request.method == 'GET':
        files = [csv_file.file.name for csv_file in CSVFile.objects.all()]
        return JsonResponse(files, safe=False)

    return JsonResponse({"error": "Invalid request method"})

@csrf_exempt
def get_ongoing_tasks(request):
    if request.method == 'GET':
        tasks = [
            {"id": task.id, "status": task.status}
            for task in Task.objects.filter(status='running') or Task.objects.filter(status='completed')
        ]
        return JsonResponse(tasks, safe=False)

    return JsonResponse({"error": "Invalid request method"})

# Assuming you have a view like this to view the result
def view_result(request, task_id):
    try:
        task = Task.objects.get(id=task_id)
        csv_file = CSVFile.objects.get(task=task)

        # Read CSV content
        with open(csv_file.file.path, 'r') as file:
            csv_content = file.read()

        # Parse CSV content
        csv_rows = [row.split(',') for row in csv_content.split('\n') if row]

        # Extract header and data
        header = csv_rows[0]
        data = csv_rows[1:]

        context = {
            'task_id': task_id,
            'header': header,
            'data': data,
        }

        return render(request, 'view_result.html', context)

    except Task.DoesNotExist or CSVFile.DoesNotExist:
        return JsonResponse({"error": "Task or CSV file not found"})
