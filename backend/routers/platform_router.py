import logging
import os

from fastapi import APIRouter

from config import MASK_ANYONE_PLATFORM_MODE

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/platform",
)


@router.get("/mode")
def register_worker():
    return {
        'platform_mode': MASK_ANYONE_PLATFORM_MODE,
    }


@router.get("/resources")
def get_system_resources():
    resources: dict = {
        'gpu': None,
        'ram_total_gb': None,
        'cpu_model': None,
        'cpu_count': os.cpu_count(),
    }

    # GPU info via pynvml (talks directly to NVIDIA driver, no CUDA needed)
    try:
        import pynvml
        pynvml.nvmlInit()
        handle = pynvml.nvmlDeviceGetHandleByIndex(0)
        gpu_name = pynvml.nvmlDeviceGetName(handle)
        if isinstance(gpu_name, bytes):
            gpu_name = gpu_name.decode('utf-8')
        mem_info = pynvml.nvmlDeviceGetMemoryInfo(handle)
        gpu_vram_gb = round(mem_info.total / (1024 ** 3), 1)
        resources['gpu'] = {
            'name': gpu_name,
            'vram_gb': gpu_vram_gb,
        }
        pynvml.nvmlShutdown()
    except Exception as e:
        logger.debug(f"Could not detect GPU: {e}")

    # RAM from /proc/meminfo (Linux containers)
    try:
        with open('/proc/meminfo', 'r') as f:
            for line in f:
                if line.startswith('MemTotal:'):
                    mem_kb = int(line.split()[1])
                    resources['ram_total_gb'] = round(mem_kb / (1024 ** 2), 1)
                    break
    except Exception as e:
        logger.debug(f"Could not read /proc/meminfo: {e}")

    # CPU model from /proc/cpuinfo
    try:
        with open('/proc/cpuinfo', 'r') as f:
            for line in f:
                if line.startswith('model name'):
                    resources['cpu_model'] = line.split(':')[1].strip()
                    break
    except Exception as e:
        logger.debug(f"Could not read /proc/cpuinfo: {e}")

    return resources
