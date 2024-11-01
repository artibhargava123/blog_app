FROM python:3.8
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN python manage.py migrate
EXPOSE 9000
CMD ["python3", "manage.py", "runserver", "0.0.0.0:9000"]
