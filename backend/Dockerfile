# Use an official Python runtime as the base image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

COPY gabeo-poc-ca4ac93f6fd1.json .

# Copy the requirements file to the working directory
COPY requirements.txt ./

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose port 5000 for the Flask app
EXPOSE 5000

# Run the Flask application using gunicorn
CMD ["gunicorn", "-w", "9", "-b", "0.0.0.0:5000", "-k", "gevent", "--timeout", "120", "main:app"]
