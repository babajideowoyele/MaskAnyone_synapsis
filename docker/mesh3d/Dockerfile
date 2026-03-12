# ANNY 3D body model fitting service
# Lightweight: no compilation needed, pure PyTorch + ANNY
FROM pytorch/pytorch:2.7.1-cuda12.6-cudnn9-runtime

WORKDIR /app

RUN pip install --upgrade --no-cache-dir \
    fastapi \
    uvicorn[standard] \
    python-multipart \
    anny

WORKDIR /app
