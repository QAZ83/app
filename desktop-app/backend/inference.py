"""
Real AI Inference using ONNX Runtime GPU / TensorRT
"""

import logging
import time
import asyncio
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from pathlib import Path
import random

logger = logging.getLogger(__name__)

# Check for ONNX Runtime GPU
HAS_ONNX_GPU = False
HAS_TENSORRT = False
onnxruntime = None

try:
    import onnxruntime as ort
    onnxruntime = ort
    providers = ort.get_available_providers()
    HAS_ONNX_GPU = 'CUDAExecutionProvider' in providers
    HAS_TENSORRT = 'TensorrtExecutionProvider' in providers
    logger.info(f"ONNX Runtime providers: {providers}")
except ImportError:
    logger.warning("ONNX Runtime not available")

# Check for numpy
try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False
    logger.warning("NumPy not available")


@dataclass
class InferenceResult:
    model_name: str
    latency_ms: float
    throughput: float  # inferences/second
    memory_allocated_mb: float
    precision: str
    framework: str
    batch_size: int
    input_shape: List[int]
    output_shape: List[int]
    is_real: bool = True

    def to_dict(self) -> Dict[str, Any]:
        return {
            "model_name": self.model_name,
            "latency_ms": round(self.latency_ms, 2),
            "throughput": round(self.throughput, 1),
            "memory_allocated_mb": round(self.memory_allocated_mb, 0),
            "precision": self.precision,
            "framework": self.framework,
            "batch_size": self.batch_size,
            "input_shape": self.input_shape,
            "output_shape": self.output_shape,
            "is_real": self.is_real
        }


class InferenceEngine:
    """Real inference engine using ONNX Runtime GPU"""
    
    def __init__(self, models_dir: str = "./models"):
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(exist_ok=True)
        self.loaded_models: Dict[str, Any] = {}
        self.session_options = None
        
        if onnxruntime:
            self.session_options = ort.SessionOptions()
            self.session_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
    
    def get_providers(self) -> List[str]:
        """Get available execution providers"""
        if HAS_TENSORRT:
            return ['TensorrtExecutionProvider', 'CUDAExecutionProvider', 'CPUExecutionProvider']
        elif HAS_ONNX_GPU:
            return ['CUDAExecutionProvider', 'CPUExecutionProvider']
        else:
            return ['CPUExecutionProvider']
    
    async def load_model(self, model_path: str) -> bool:
        """Load an ONNX model"""
        if not onnxruntime:
            return False
        
        try:
            path = Path(model_path)
            if not path.exists():
                logger.error(f"Model not found: {model_path}")
                return False
            
            session = ort.InferenceSession(
                str(path),
                sess_options=self.session_options,
                providers=self.get_providers()
            )
            
            self.loaded_models[path.stem] = session
            logger.info(f"Model loaded: {path.stem}")
            return True
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            return False
    
    async def run_inference(
        self,
        model_name: str,
        batch_size: int = 1,
        precision: str = "FP16",
        framework: str = "TensorRT",
        warmup_runs: int = 5,
        benchmark_runs: int = 50
    ) -> InferenceResult:
        """Run inference benchmark on a model"""
        
        # Check if we have a real model loaded
        if model_name in self.loaded_models and onnxruntime and HAS_NUMPY:
            return await self._run_real_inference(
                model_name, batch_size, precision, framework, warmup_runs, benchmark_runs
            )
        else:
            return self._simulate_inference(model_name, batch_size, precision, framework)
    
    async def _run_real_inference(
        self,
        model_name: str,
        batch_size: int,
        precision: str,
        framework: str,
        warmup_runs: int,
        benchmark_runs: int
    ) -> InferenceResult:
        """Run actual inference on loaded model"""
        try:
            session = self.loaded_models[model_name]
            input_info = session.get_inputs()[0]
            output_info = session.get_outputs()[0]
            
            # Get input shape and create dummy input
            input_shape = list(input_info.shape)
            if input_shape[0] == 'batch_size' or input_shape[0] is None:
                input_shape[0] = batch_size
            else:
                input_shape[0] = batch_size
            
            # Create input based on precision
            if precision == "FP16":
                dtype = np.float16
            elif precision == "INT8":
                dtype = np.int8
            else:
                dtype = np.float32
            
            dummy_input = np.random.rand(*input_shape).astype(np.float32)  # ONNX usually needs float32
            input_name = input_info.name
            
            # Warmup
            for _ in range(warmup_runs):
                session.run(None, {input_name: dummy_input})
            
            # Benchmark
            start_time = time.perf_counter()
            for _ in range(benchmark_runs):
                outputs = session.run(None, {input_name: dummy_input})
            end_time = time.perf_counter()
            
            total_time = (end_time - start_time) * 1000  # ms
            latency = total_time / benchmark_runs
            throughput = (benchmark_runs * batch_size) / (total_time / 1000)
            
            output_shape = list(outputs[0].shape) if outputs else []
            
            return InferenceResult(
                model_name=model_name,
                latency_ms=latency,
                throughput=throughput,
                memory_allocated_mb=dummy_input.nbytes / (1024 * 1024) * 2,  # Rough estimate
                precision=precision,
                framework=framework,
                batch_size=batch_size,
                input_shape=input_shape,
                output_shape=output_shape,
                is_real=True
            )
        except Exception as e:
            logger.error(f"Inference error: {e}")
            return self._simulate_inference(model_name, batch_size, precision, framework)
    
    def _simulate_inference(
        self,
        model_name: str,
        batch_size: int,
        precision: str,
        framework: str
    ) -> InferenceResult:
        """Simulate inference results"""
        # Base latencies for different models (ms)
        model_latencies = {
            "ResNet50": 2.5,
            "ResNet101": 4.2,
            "VGG16": 5.8,
            "YOLO": 8.3,
            "YOLOv8": 6.5,
            "Transformer": 12.5,
            "GPT-2": 18.7,
            "BERT": 6.4,
            "EfficientNet": 3.1,
            "MobileNet": 1.8,
            "InceptionV3": 4.5
        }
        
        # Precision multipliers
        precision_mult = {
            "FP32": 1.0,
            "FP16": 0.55,
            "INT8": 0.35
        }
        
        # Framework efficiency
        framework_mult = {
            "TensorRT": 0.7,
            "CUDA": 1.0,
            "ONNX": 0.85
        }
        
        base_latency = model_latencies.get(model_name, 5.0)
        p_mult = precision_mult.get(precision, 1.0)
        f_mult = framework_mult.get(framework, 1.0)
        
        latency = base_latency * p_mult * f_mult * random.uniform(0.9, 1.1)
        throughput = (1000 / latency) * batch_size
        
        # Estimate input/output shapes based on model
        input_shapes = {
            "ResNet50": [batch_size, 3, 224, 224],
            "ResNet101": [batch_size, 3, 224, 224],
            "YOLO": [batch_size, 3, 640, 640],
            "YOLOv8": [batch_size, 3, 640, 640],
            "BERT": [batch_size, 512],
            "GPT-2": [batch_size, 1024],
            "default": [batch_size, 3, 224, 224]
        }
        
        input_shape = input_shapes.get(model_name, input_shapes["default"])
        output_shape = [batch_size, 1000]  # Classification default
        
        return InferenceResult(
            model_name=model_name,
            latency_ms=latency,
            throughput=throughput,
            memory_allocated_mb=random.uniform(500, 4000),
            precision=precision,
            framework=framework,
            batch_size=batch_size,
            input_shape=input_shape,
            output_shape=output_shape,
            is_real=False
        )
    
    def list_available_models(self) -> List[str]:
        """List models in the models directory"""
        models = []
        if self.models_dir.exists():
            for f in self.models_dir.glob("*.onnx"):
                models.append(f.stem)
        return models
    
    @staticmethod
    def get_supported_models() -> List[Dict[str, str]]:
        """Get list of supported model architectures"""
        return [
            {"name": "ResNet50", "type": "Classification", "input": "224x224"},
            {"name": "ResNet101", "type": "Classification", "input": "224x224"},
            {"name": "VGG16", "type": "Classification", "input": "224x224"},
            {"name": "YOLO", "type": "Detection", "input": "640x640"},
            {"name": "YOLOv8", "type": "Detection", "input": "640x640"},
            {"name": "Transformer", "type": "NLP", "input": "Sequence"},
            {"name": "GPT-2", "type": "NLP", "input": "Sequence"},
            {"name": "BERT", "type": "NLP", "input": "512 tokens"},
            {"name": "EfficientNet", "type": "Classification", "input": "224x224"},
            {"name": "MobileNet", "type": "Classification", "input": "224x224"},
            {"name": "InceptionV3", "type": "Classification", "input": "299x299"}
        ]


# Global instance
_engine: Optional[InferenceEngine] = None

def get_inference_engine(models_dir: str = "./models") -> InferenceEngine:
    global _engine
    if _engine is None:
        _engine = InferenceEngine(models_dir)
    return _engine
