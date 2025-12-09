"""
GPU Monitor - Real Hardware Reading
Uses pynvml to read actual NVIDIA GPU data
"""

import logging
from typing import Optional, Dict, Any
from dataclasses import dataclass
import subprocess
import re

logger = logging.getLogger(__name__)

# Try to import pynvml for real GPU monitoring
HAS_NVML = False
try:
    import pynvml
    pynvml.nvmlInit()
    HAS_NVML = True
    logger.info("NVML initialized successfully - Real GPU monitoring available")
except Exception as e:
    logger.warning(f"NVML not available: {e} - Using simulation mode")


@dataclass
class GPUInfo:
    name: str
    driver_version: str
    cuda_version: str
    memory_total: float  # GB
    memory_used: float  # GB
    memory_free: float  # GB
    temperature: float  # Celsius
    power_usage: float  # Watts
    power_limit: float  # Watts
    utilization: float  # Percentage
    memory_utilization: float  # Percentage
    clock_speed: float  # MHz
    memory_clock: float  # MHz
    fan_speed: float  # Percentage
    pcie_gen: int
    pcie_width: int
    is_real: bool = True

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "driver_version": self.driver_version,
            "cuda_version": self.cuda_version,
            "memory_total": self.memory_total,
            "memory_used": self.memory_used,
            "memory_free": self.memory_free,
            "temperature": self.temperature,
            "power_usage": self.power_usage,
            "power_limit": self.power_limit,
            "utilization": self.utilization,
            "memory_utilization": self.memory_utilization,
            "clock_speed": self.clock_speed,
            "memory_clock": self.memory_clock,
            "fan_speed": self.fan_speed,
            "pcie_gen": self.pcie_gen,
            "pcie_width": self.pcie_width,
            "is_real": self.is_real
        }


class GPUMonitor:
    """Monitor NVIDIA GPU using NVML or nvidia-smi fallback"""
    
    def __init__(self, device_index: int = 0):
        self.device_index = device_index
        self.handle = None
        
        if HAS_NVML:
            try:
                device_count = pynvml.nvmlDeviceGetCount()
                if device_index < device_count:
                    self.handle = pynvml.nvmlDeviceGetHandleByIndex(device_index)
                    logger.info(f"GPU {device_index} handle acquired")
            except Exception as e:
                logger.error(f"Failed to get GPU handle: {e}")
    
    def get_gpu_info(self) -> GPUInfo:
        """Get current GPU information"""
        if self.handle and HAS_NVML:
            return self._get_nvml_info()
        else:
            return self._get_nvidia_smi_info()
    
    def _get_nvml_info(self) -> GPUInfo:
        """Get GPU info using NVML (fastest method)"""
        try:
            # Basic info
            name = pynvml.nvmlDeviceGetName(self.handle)
            if isinstance(name, bytes):
                name = name.decode('utf-8')
            
            driver_version = pynvml.nvmlSystemGetDriverVersion()
            if isinstance(driver_version, bytes):
                driver_version = driver_version.decode('utf-8')
            
            cuda_version = pynvml.nvmlSystemGetCudaDriverVersion_v2()
            cuda_version_str = f"{cuda_version // 1000}.{(cuda_version % 1000) // 10}"
            
            # Memory
            memory = pynvml.nvmlDeviceGetMemoryInfo(self.handle)
            memory_total = memory.total / (1024 ** 3)  # GB
            memory_used = memory.used / (1024 ** 3)
            memory_free = memory.free / (1024 ** 3)
            
            # Temperature
            temperature = pynvml.nvmlDeviceGetTemperature(self.handle, pynvml.NVML_TEMPERATURE_GPU)
            
            # Power
            try:
                power_usage = pynvml.nvmlDeviceGetPowerUsage(self.handle) / 1000  # Watts
                power_limit = pynvml.nvmlDeviceGetPowerManagementLimit(self.handle) / 1000
            except:
                power_usage = 0
                power_limit = 0
            
            # Utilization
            utilization = pynvml.nvmlDeviceGetUtilizationRates(self.handle)
            gpu_util = utilization.gpu
            mem_util = utilization.memory
            
            # Clocks
            try:
                clock_speed = pynvml.nvmlDeviceGetClockInfo(self.handle, pynvml.NVML_CLOCK_GRAPHICS)
                memory_clock = pynvml.nvmlDeviceGetClockInfo(self.handle, pynvml.NVML_CLOCK_MEM)
            except:
                clock_speed = 0
                memory_clock = 0
            
            # Fan
            try:
                fan_speed = pynvml.nvmlDeviceGetFanSpeed(self.handle)
            except:
                fan_speed = 0
            
            # PCIe
            try:
                pcie_gen = pynvml.nvmlDeviceGetCurrPcieLinkGeneration(self.handle)
                pcie_width = pynvml.nvmlDeviceGetCurrPcieLinkWidth(self.handle)
            except:
                pcie_gen = 0
                pcie_width = 0
            
            return GPUInfo(
                name=name,
                driver_version=driver_version,
                cuda_version=cuda_version_str,
                memory_total=round(memory_total, 2),
                memory_used=round(memory_used, 2),
                memory_free=round(memory_free, 2),
                temperature=temperature,
                power_usage=round(power_usage, 1),
                power_limit=round(power_limit, 1),
                utilization=gpu_util,
                memory_utilization=mem_util,
                clock_speed=clock_speed,
                memory_clock=memory_clock,
                fan_speed=fan_speed,
                pcie_gen=pcie_gen,
                pcie_width=pcie_width,
                is_real=True
            )
        except Exception as e:
            logger.error(f"NVML error: {e}")
            return self._get_simulated_info()
    
    def _get_nvidia_smi_info(self) -> GPUInfo:
        """Fallback: Get GPU info using nvidia-smi command"""
        try:
            result = subprocess.run(
                ['nvidia-smi', '--query-gpu=name,driver_version,memory.total,memory.used,memory.free,temperature.gpu,power.draw,power.limit,utilization.gpu,utilization.memory,clocks.gr,clocks.mem,fan.speed,pcie.link.gen.current,pcie.link.width.current',
                 '--format=csv,noheader,nounits'],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if result.returncode == 0:
                values = result.stdout.strip().split(', ')
                if len(values) >= 15:
                    # Get CUDA version separately
                    cuda_result = subprocess.run(['nvidia-smi', '--query-gpu=driver_version', '--format=csv,noheader'], capture_output=True, text=True)
                    cuda_version = "12.0"  # Default
                    
                    return GPUInfo(
                        name=values[0].strip(),
                        driver_version=values[1].strip(),
                        cuda_version=cuda_version,
                        memory_total=float(values[2]) / 1024,  # Convert MB to GB
                        memory_used=float(values[3]) / 1024,
                        memory_free=float(values[4]) / 1024,
                        temperature=float(values[5]),
                        power_usage=float(values[6]) if values[6].strip() != '[N/A]' else 0,
                        power_limit=float(values[7]) if values[7].strip() != '[N/A]' else 0,
                        utilization=float(values[8]),
                        memory_utilization=float(values[9]),
                        clock_speed=float(values[10]),
                        memory_clock=float(values[11]),
                        fan_speed=float(values[12]) if values[12].strip() != '[N/A]' else 0,
                        pcie_gen=int(values[13]),
                        pcie_width=int(values[14]),
                        is_real=True
                    )
        except FileNotFoundError:
            logger.warning("nvidia-smi not found")
        except Exception as e:
            logger.error(f"nvidia-smi error: {e}")
        
        return self._get_simulated_info()
    
    def _get_simulated_info(self) -> GPUInfo:
        """Return simulated data when no GPU is available"""
        import random
        return GPUInfo(
            name="NVIDIA GeForce RTX 5090 (Simulated)",
            driver_version="560.94",
            cuda_version="12.6",
            memory_total=32.0,
            memory_used=round(random.uniform(4.0, 16.0), 2),
            memory_free=round(random.uniform(16.0, 28.0), 2),
            temperature=round(random.uniform(35.0, 75.0), 1),
            power_usage=round(random.uniform(100.0, 450.0), 1),
            power_limit=575.0,
            utilization=round(random.uniform(10.0, 95.0), 1),
            memory_utilization=round(random.uniform(10.0, 80.0), 1),
            clock_speed=round(random.uniform(2000.0, 2900.0), 0),
            memory_clock=round(random.uniform(10000.0, 12000.0), 0),
            fan_speed=round(random.uniform(30.0, 80.0), 0),
            pcie_gen=5,
            pcie_width=16,
            is_real=False
        )
    
    @staticmethod
    def get_device_count() -> int:
        """Get number of NVIDIA GPUs"""
        if HAS_NVML:
            try:
                return pynvml.nvmlDeviceGetCount()
            except:
                pass
        
        try:
            result = subprocess.run(['nvidia-smi', '-L'], capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                return len([l for l in result.stdout.strip().split('\n') if l.startswith('GPU')])
        except:
            pass
        
        return 0
    
    @staticmethod
    def is_gpu_available() -> bool:
        """Check if NVIDIA GPU is available"""
        return GPUMonitor.get_device_count() > 0 or HAS_NVML


# Global monitor instance
_monitor: Optional[GPUMonitor] = None

def get_monitor() -> GPUMonitor:
    global _monitor
    if _monitor is None:
        _monitor = GPUMonitor()
    return _monitor
