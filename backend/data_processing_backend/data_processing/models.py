
# models.py
from django.db import models

class CSVFile(models.Model):
    file = models.FileField(upload_to='csv_files/')

    def __str__(self):
        return self.file.name

class Task(models.Model):
    STATUS_CHOICES = [
        ('running', 'Running'),
        ('completed', 'Completed'),
    ]

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='running')
    result_url = models.URLField(null=True, blank=True)  # Add this field for result URL

    def __str__(self):
        return f'Task ID: {self.id}, Status: {self.status}'
