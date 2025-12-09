"""
AI Forge Studio - Desktop Backend Server
Complete API server with real hardware support
"""

from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import os
import json
import uuid
import asyncio
import logging
from pathlib import Path
from datetime import datetime, timezone

# Import our modules
from gpu_monitor import GPUMonitor, get_monitor, GPUInfo
from benchmarks import BenchmarkRunner, get_benchmark_runner, BenchmarkResult
from inference import InferenceEngine, get_inference_engine, InferenceResult

# Try to import emergent integrations for AI chat
HAS_EMERGENT = False
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    HAS_EMERGENT = True
except ImportError:
    pass

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# App setup
app = FastAPI(
    title="AI Forge Studio API",
    description="Desktop GPU monitoring and AI inference application",
    version="2.0.0"
)

api_router = APIRouter(prefix="/api")

# Config
CONFIG_FILE = Path("./config.json")
MODELS_DIR = Path("./models")

# =============================================================================
# Pydantic Models
# =============================================================================

class AppSettings(BaseModel):
    id: str = "default_settings"
    models_directory: str = str(MODELS_DIR)
    display_resolution: str = "1920x1080"
    enable_gpu_animations: bool = True
    default_ai_model: str = "gpt-4o-mini"
    ai_provider: str = "openai"
    api_key: str = ""  # Stored encrypted in production
    theme: str = "dark"
    language: str = "ar"
    auto_refresh_interval: int = 2000  # ms
    updated_at: str = ""

class SettingsUpdate(BaseModel):
    models_directory: Optional[str] = None
    display_resolution: Optional[str] = None
    enable_gpu_animations: Optional[bool] = None
    default_ai_model: Optional[str] = None
    ai_provider: Optional[str] = None
    api_key: Optional[str] = None
    theme: Optional[str] = None
    language: Optional[str] = None
    auto_refresh_interval: Optional[int] = None

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    preset: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

class InferenceRequest(BaseModel):
    model_name: str = "ResNet50"
    batch_size: int = 1
    precision: str = "FP16"
    framework: str = "TensorRT"

class BenchmarkRequest(BaseModel):
    benchmark_type: str
    iterations: Optional[int] = 100

# =============================================================================
# Helper Functions
# =============================================================================

def load_config() -> AppSettings:
    """Load config from file"""
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE) as f:
                data = json.load(f)
                return AppSettings(**data)
        except Exception as e:
            logger.error(f"Error loading config: {e}")
    return AppSettings()

def save_config(settings: AppSettings):
    """Save config to file"""
    try:
        settings.updated_at = datetime.now(timezone.utc).isoformat()
        with open(CONFIG_FILE, 'w') as f:
            json.dump(settings.model_dump(), f, indent=2)
    except Exception as e:
        logger.error(f"Error saving config: {e}")

# Chat presets
PRESET_PROMPTS = {
    "gpu_problem": "أنا أواجه مشكلة في أداء بطاقة الرسومات GPU. هل يمكنك مساعدتي في تشخيص المشكلة وتقديم حلول؟",
    "benchmark_analysis": "قم بتحليل نتائج اختبار الأداء Benchmark الأخيرة واقترح تحسينات ممكنة.",
    "optimal_settings": "ما هي الإعدادات المثالية لبطاقة RTX 5090 للحصول على أفضل أداء في الألعاب والتطبيقات الاحترافية؟",
    "app_guide": "أنا مستخدم جديد، هل يمكنك شرح واجهة التطبيق AI Forge Studio وكيفية استخدام الميزات المختلفة؟"
}

# Chat sessions storage (in-memory for desktop app)
chat_sessions: Dict[str, List[Dict]] = {}

# =============================================================================
# API Routes
# =============================================================================

@api_router.get("/")
async def root():
    return {
        "message": "AI Forge Studio API v2.0",
        "status": "running",
        "gpu_available": GPUMonitor.is_gpu_available(),
        "cuda_available": get_benchmark_runner().is_cuda_available()
    }

@api_router.get("/system/info")
async def get_system_info():
    """Get system capabilities"""
    return {
        "gpu_available": GPUMonitor.is_gpu_available(),
        "gpu_count": GPUMonitor.get_device_count(),
        "cuda_available": get_benchmark_runner().is_cuda_available(),
        "has_emergent_ai": HAS_EMERGENT,
        "models_directory": str(MODELS_DIR),
        "available_models": get_inference_engine().list_available_models()
    }

# GPU Routes
@api_router.get("/gpu/info")
async def get_gpu_info():
    """Get current GPU information"""
    monitor = get_monitor()
    info = monitor.get_gpu_info()
    return info.to_dict()

@api_router.get("/gpu/devices")
async def get_gpu_devices():
    """Get list of available GPUs"""
    count = GPUMonitor.get_device_count()
    devices = []
    for i in range(count):
        monitor = GPUMonitor(i)
        info = monitor.get_gpu_info()
        devices.append({"index": i, "name": info.name})
    return {"count": count, "devices": devices}

# Benchmark Routes
@api_router.post("/benchmark/{benchmark_type}")
async def run_benchmark(benchmark_type: str):
    """Run a specific benchmark"""
    valid_types = ["cuda", "tensorrt", "vulkan", "general"]
    if benchmark_type not in valid_types:
        raise HTTPException(400, f"Invalid benchmark type. Valid: {valid_types}")
    
    runner = get_benchmark_runner()
    result = await runner.run_benchmark(benchmark_type)
    
    # Add temperature from GPU monitor
    gpu_info = get_monitor().get_gpu_info()
    result_dict = result.to_dict()
    result_dict["temperature"] = gpu_info.temperature
    result_dict["id"] = str(uuid.uuid4())
    result_dict["timestamp"] = datetime.now(timezone.utc).isoformat()
    
    return result_dict

@api_router.get("/benchmark/status")
async def get_benchmark_status():
    """Get benchmark capabilities"""
    return {
        "cuda_available": get_benchmark_runner().is_cuda_available(),
        "supported_benchmarks": ["cuda", "tensorrt", "vulkan", "general"]
    }

# Inference Routes
@api_router.post("/inference/run")
async def run_inference(request: InferenceRequest):
    """Run AI model inference"""
    engine = get_inference_engine()
    result = await engine.run_inference(
        model_name=request.model_name,
        batch_size=request.batch_size,
        precision=request.precision,
        framework=request.framework
    )
    
    result_dict = result.to_dict()
    result_dict["id"] = str(uuid.uuid4())
    result_dict["timestamp"] = datetime.now(timezone.utc).isoformat()
    
    return result_dict

@api_router.get("/inference/models")
async def get_available_models():
    """Get available models for inference"""
    engine = get_inference_engine()
    return {
        "loaded_models": engine.list_available_models(),
        "supported_models": engine.get_supported_models()
    }

@api_router.post("/inference/load")
async def load_model(model_path: str):
    """Load an ONNX model"""
    engine = get_inference_engine()
    success = await engine.load_model(model_path)
    if success:
        return {"status": "success", "message": f"Model loaded: {model_path}"}
    else:
        raise HTTPException(400, "Failed to load model")

# Settings Routes
@api_router.get("/settings")
async def get_settings():
    """Get application settings"""
    settings = load_config()
    # Don't expose API key fully
    settings_dict = settings.model_dump()
    if settings_dict.get("api_key"):
        settings_dict["api_key"] = "****" + settings_dict["api_key"][-4:] if len(settings_dict["api_key"]) > 4 else "****"
    return settings_dict

@api_router.put("/settings")
async def update_settings(updates: SettingsUpdate):
    """Update application settings"""
    current = load_config()
    update_data = updates.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        if value is not None:
            setattr(current, key, value)
    
    save_config(current)
    
    # Return without full API key
    result = current.model_dump()
    if result.get("api_key"):
        result["api_key"] = "****" + result["api_key"][-4:] if len(result["api_key"]) > 4 else "****"
    
    return result

# Chat Routes
@api_router.post("/chat")
async def chat_with_ai(request: ChatRequest):
    """Chat with AI assistant"""
    settings = load_config()
    api_key = settings.api_key or os.environ.get('EMERGENT_LLM_KEY', '')
    
    if not api_key:
        raise HTTPException(500, "AI API key not configured. Please set it in Settings.")
    
    session_id = request.session_id or str(uuid.uuid4())
    
    # Get message
    message = request.message
    if request.preset and request.preset in PRESET_PROMPTS:
        message = PRESET_PROMPTS[request.preset]
    
    if not HAS_EMERGENT:
        # Fallback response when emergent not available
        return ChatResponse(
            response="عذراً، خدمة المحادثة غير متاحة حالياً. تأكد من تثبيت مكتبة emergentintegrations.",
            session_id=session_id
        )
    
    try:
        system_msg = "أنت مساعد ذكاء اصطناعي متخصص في بطاقات الرسومات NVIDIA وتحسين أداء GPU. أنت جزء من تطبيق AI Forge Studio. قدم إجابات مفيدة ودقيقة باللغة العربية والإنجليزية حسب لغة المستخدم."
        
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=system_msg
        ).with_model(settings.ai_provider, settings.default_ai_model)
        
        user_msg = UserMessage(text=message)
        response = await chat.send_message(user_msg)
        
        # Store in session
        if session_id not in chat_sessions:
            chat_sessions[session_id] = []
        chat_sessions[session_id].append({"role": "user", "content": message})
        chat_sessions[session_id].append({"role": "assistant", "content": response})
        
        return ChatResponse(response=response, session_id=session_id)
        
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(500, f"Error: {str(e)}")

@api_router.get("/chat/history/{session_id}")
async def get_chat_history(session_id: str):
    """Get chat history"""
    return {"messages": chat_sessions.get(session_id, [])}

@api_router.delete("/chat/history/{session_id}")
async def clear_chat_history(session_id: str):
    """Clear chat history"""
    if session_id in chat_sessions:
        del chat_sessions[session_id]
    return {"message": "History cleared"}

@api_router.get("/chat/presets")
async def get_chat_presets():
    """Get preset prompts"""
    return {
        "presets": [
            {"id": "gpu_problem", "label": "حل مشكلة في أداء GPU", "label_en": "Solve GPU Performance Issue"},
            {"id": "benchmark_analysis", "label": "تحليل نتيجة Benchmark", "label_en": "Analyze Benchmark Results"},
            {"id": "optimal_settings", "label": "اقتراح إعدادات مثالية", "label_en": "Suggest Optimal Settings"},
            {"id": "app_guide", "label": "شرح واجهة التطبيق", "label_en": "App Interface Guide"}
        ]
    }

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8080)
