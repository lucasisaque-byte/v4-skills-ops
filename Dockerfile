FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Código da aplicação
COPY api/ ./api/
COPY skills/ ./skills/

# data/ e clients/ são montados como volumes em runtime

EXPOSE 8000

CMD ["python3", "-m", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
