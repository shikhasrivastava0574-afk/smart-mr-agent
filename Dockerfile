# Use a lightweight official Python image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Set work directory
WORKDIR /app

# Copy the project files to the container
COPY . /app

# Expose the port the app runs on
EXPOSE 8000

# Run the python web server
CMD ["python", "server.py"]
