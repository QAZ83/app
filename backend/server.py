from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import random
import asyncio

# Import emergent integrations for AI chat
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="AI Forge Studio API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# =============================================================================
# Models
# =============================================================================

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Settings Models
class AppSettings(BaseModel):
    id: str = Field(default="default_settings")
    models_directory: str = ""
    display_resolution: str = "1920x1080"
    enable_gpu_animations: bool = True
    default_ai_model: str = "gpt-4o-mini"
    ai_provider: str = "openai"
    theme: str = "dark"
    language: str = "ar"
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SettingsUpdate(BaseModel):
    models_directory: Optional[str] = None
    display_resolution: Optional[str] = None
    enable_gpu_animations: Optional[bool] = None
    default_ai_model: Optional[str] = None
    ai_provider: Optional[str] = None
    theme: Optional[str] = None
    language: Optional[str] = None

# Chat Models
class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    messages: List[ChatMessage] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    preset: Optional[str] = None  # For preset prompts

class ChatResponse(BaseModel):
    response: str
    session_id: str

# Benchmark Models
class BenchmarkResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    benchmark_type: str  # "cuda", "tensorrt", "vulkan", "general"
    score: float
    fps: Optional[float] = None
    memory_usage: Optional[float] = None
    temperature: Optional[float] = None
    details: Dict[str, Any] = {}
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GPUInfo(BaseModel):
    name: str
    driver_version: str
    cuda_version: str
    memory_total: float  # GB
    memory_used: float  # GB
    memory_free: float  # GB
    temperature: float  # Celsius
    power_usage: float  # Watts
    utilization: float  # Percentage
    clock_speed: float  # MHz
    is_rtx: bool = True

class InferenceRequest(BaseModel):
    model_name: str = "ResNet50"
    batch_size: int = 1
    precision: str = "FP16"  # FP32, FP16, INT8
    framework: str = "TensorRT"  # TensorRT, CUDA, ONNX

class InferenceResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    model_name: str
    latency_ms: float
    throughput: float  # images/second
    memory_allocated: float  # MB
    precision: str
    framework: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# =============================================================================
# Helper Functions
# =============================================================================

def simulate_gpu_info() -> GPUInfo:
    """Simulate RTX 5090 GPU information"""
    return GPUInfo(
        name="NVIDIA GeForce RTX 5090",
        driver_version="560.94",
        cuda_version="12.6",
        memory_total=32.0,
        memory_used=round(random.uniform(4.0, 16.0), 2),
        memory_free=round(random.uniform(16.0, 28.0), 2),
        temperature=round(random.uniform(35.0, 75.0), 1),
        power_usage=round(random.uniform(100.0, 450.0), 1),
        utilization=round(random.uniform(10.0, 95.0), 1),
        clock_speed=round(random.uniform(2000.0, 2900.0), 0),
        is_rtx=True
    )

def simulate_benchmark(benchmark_type: str) -> BenchmarkResult:
    """Simulate benchmark results for different types"""
    base_scores = {
        "cuda": {"score": 28500, "fps": 245, "variance": 0.15},
        "tensorrt": {"score": 32000, "fps": 380, "variance": 0.12},
        "vulkan": {"score": 26800, "fps": 210, "variance": 0.18},
        "general": {"score": 29500, "fps": 275, "variance": 0.14}
    }
    
    base = base_scores.get(benchmark_type, base_scores["general"])
    variance = base["variance"]
    
    return BenchmarkResult(
        benchmark_type=benchmark_type,
        score=round(base["score"] * random.uniform(1 - variance, 1 + variance), 0),
        fps=round(base["fps"] * random.uniform(1 - variance, 1 + variance), 1),
        memory_usage=round(random.uniform(6.0, 18.0), 2),
        temperature=round(random.uniform(55.0, 82.0), 1),
        details={
            "compute_units": 21760,
            "tensor_cores": 680,
            "ray_tracing_cores": 170,
            "memory_bandwidth": "1792 GB/s",
            "pcie_bandwidth": "64 GB/s",
            "test_iterations": random.randint(1000, 5000),
            "avg_frame_time": round(1000 / base["fps"], 2)
        }
    )

def simulate_inference(request: InferenceRequest) -> InferenceResult:
    """Simulate inference results"""
    # Base latencies for different models
    model_latencies = {
        "ResNet50": 2.5,
        "ResNet101": 4.2,
        "VGG16": 5.8,
        "YOLO": 8.3,
        "Transformer": 12.5,
        "GPT-2": 18.7,
        "BERT": 6.4,
        "EfficientNet": 3.1
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
    
    base_latency = model_latencies.get(request.model_name, 5.0)
    p_mult = precision_mult.get(request.precision, 1.0)
    f_mult = framework_mult.get(request.framework, 1.0)
    
    latency = base_latency * p_mult * f_mult * random.uniform(0.9, 1.1)
    throughput = (1000 / latency) * request.batch_size
    
    return InferenceResult(
        model_name=request.model_name,
        latency_ms=round(latency, 2),
        throughput=round(throughput, 1),
        memory_allocated=round(random.uniform(500, 4000), 0),
        precision=request.precision,
        framework=request.framework
    )

# Preset prompts for AI assistant
PRESET_PROMPTS = {
    "gpu_problem": "أنا أواجه مشكلة في أداء بطاقة الرسومات GPU. هل يمكنك مساعدتي في تشخيص المشكلة وتقديم حلول؟",
    "benchmark_analysis": "قم بتحليل نتائج اختبار الأداء Benchmark الأخيرة واقترح تحسينات ممكنة.",
    "optimal_settings": "ما هي الإعدادات المثالية لبطاقة RTX 5090 للحصول على أفضل أداء في الألعاب والتطبيقات الاحترافية؟",
    "app_guide": "أنا مستخدم جديد، هل يمكنك شرح واجهة التطبيق AI Forge Studio وكيفية استخدام الميزات المختلفة؟"
}

# =============================================================================
# API Routes
# =============================================================================

@api_router.get("/")
async def root():
    return {"message": "AI Forge Studio API v1.0", "status": "running"}

# Status Check Routes
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

# Settings Routes
@api_router.get("/settings", response_model=AppSettings)
async def get_settings():
    """Get application settings"""
    settings = await db.settings.find_one({"id": "default_settings"}, {"_id": 0})
    if not settings:
        # Return default settings
        default = AppSettings()
        doc = default.model_dump()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.settings.insert_one(doc)
        return default
    if isinstance(settings.get('updated_at'), str):
        settings['updated_at'] = datetime.fromisoformat(settings['updated_at'])
    return AppSettings(**settings)

@api_router.put("/settings", response_model=AppSettings)
async def update_settings(updates: SettingsUpdate):
    """Update application settings"""
    current = await db.settings.find_one({"id": "default_settings"})
    if not current:
        current = AppSettings().model_dump()
    
    # Update only provided fields
    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            current[key] = value
    
    current['updated_at'] = datetime.now(timezone.utc).isoformat()
    current['id'] = "default_settings"
    
    await db.settings.replace_one(
        {"id": "default_settings"}, 
        current, 
        upsert=True
    )
    
    if isinstance(current.get('updated_at'), str):
        current['updated_at'] = datetime.fromisoformat(current['updated_at'])
    
    return AppSettings(**current)

# GPU Info Route
@api_router.get("/gpu/info", response_model=GPUInfo)
async def get_gpu_info():
    """Get GPU information (simulated RTX 5090)"""
    # Simulate a small delay like real hardware query
    await asyncio.sleep(0.2)
    return simulate_gpu_info()

# Benchmark Routes
@api_router.post("/benchmark/{benchmark_type}", response_model=BenchmarkResult)
async def run_benchmark(benchmark_type: str):
    """Run a specific benchmark type"""
    if benchmark_type not in ["cuda", "tensorrt", "vulkan", "general"]:
        raise HTTPException(status_code=400, detail=f"Unknown benchmark type: {benchmark_type}")
    
    # Simulate benchmark running time
    await asyncio.sleep(random.uniform(1.5, 3.0))
    
    result = simulate_benchmark(benchmark_type)
    
    # Save to database
    doc = result.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.benchmarks.insert_one(doc)
    
    return result

@api_router.get("/benchmark/history", response_model=List[BenchmarkResult])
async def get_benchmark_history(limit: int = 20):
    """Get benchmark history"""
    results = await db.benchmarks.find({}, {"_id": 0}).sort("timestamp", -1).to_list(limit)
    for r in results:
        if isinstance(r.get('timestamp'), str):
            r['timestamp'] = datetime.fromisoformat(r['timestamp'])
    return results

# Inference Routes
@api_router.post("/inference/run", response_model=InferenceResult)
async def run_inference(request: InferenceRequest):
    """Run inference simulation"""
    # Simulate inference time
    await asyncio.sleep(random.uniform(0.5, 1.5))
    
    result = simulate_inference(request)
    
    # Save to database
    doc = result.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.inference_results.insert_one(doc)
    
    return result

@api_router.get("/inference/history", response_model=List[InferenceResult])
async def get_inference_history(limit: int = 20):
    """Get inference history"""
    results = await db.inference_results.find({}, {"_id": 0}).sort("timestamp", -1).to_list(limit)
    for r in results:
        if isinstance(r.get('timestamp'), str):
            r['timestamp'] = datetime.fromisoformat(r['timestamp'])
    return results

# AI Chat Routes
@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """Chat with AI assistant"""
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="AI API key not configured")
        
        # Get or create session
        session_id = request.session_id or str(uuid.uuid4())
        
        # Get message - use preset if provided
        message = request.message
        if request.preset and request.preset in PRESET_PROMPTS:
            message = PRESET_PROMPTS[request.preset]
        
        # Initialize chat
        system_msg = "أنت مساعد ذكاء اصطناعي متخصص في بطاقات الرسومات NVIDIA وتحسين أداء GPU. أنت جزء من تطبيق AI Forge Studio. قدم إجابات مفيدة ودقيقة باللغة العربية والإنجليزية حسب لغة المستخدم. ساعد المستخدمين في: حل مشاكل GPU والأداء، تحليل نتائج Benchmarks، اقتراح إعدادات مثالية، شرح مميزات التطبيق، الإجابة على أي أسئلة تقنية."
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=system_msg
        ).with_model("openai", "gpt-4o-mini")
        
        # Get chat history from database
        session_data = await db.chat_sessions.find_one({"id": session_id}, {"_id": 0})
        
        # Send message
        user_msg = UserMessage(text=message)
        response = await chat.send_message(user_msg)
        
        # Save to database
        user_message = ChatMessage(role="user", content=message)
        assistant_message = ChatMessage(role="assistant", content=response)
        
        if session_data:
            await db.chat_sessions.update_one(
                {"id": session_id},
                {"$push": {"messages": {
                    "$each": [
                        {**user_message.model_dump(), "timestamp": user_message.timestamp.isoformat()},
                        {**assistant_message.model_dump(), "timestamp": assistant_message.timestamp.isoformat()}
                    ]
                }}}
            )
        else:
            new_session = ChatSession(id=session_id)
            doc = new_session.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            doc['messages'] = [
                {**user_message.model_dump(), "timestamp": user_message.timestamp.isoformat()},
                {**assistant_message.model_dump(), "timestamp": assistant_message.timestamp.isoformat()}
            ]
            await db.chat_sessions.insert_one(doc)
        
        return ChatResponse(response=response, session_id=session_id)
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error communicating with AI: {str(e)}")

@api_router.get("/chat/history/{session_id}")
async def get_chat_history(session_id: str):
    """Get chat history for a session"""
    session = await db.chat_sessions.find_one({"id": session_id}, {"_id": 0})
    if not session:
        return {"messages": []}
    return {"messages": session.get("messages", [])}

@api_router.delete("/chat/history/{session_id}")
async def clear_chat_history(session_id: str):
    """Clear chat history for a session"""
    await db.chat_sessions.delete_one({"id": session_id})
    return {"message": "Chat history cleared"}

@api_router.get("/chat/presets")
async def get_chat_presets():
    """Get available preset prompts"""
    return {
        "presets": [
            {"id": "gpu_problem", "label": "حل مشكلة في أداء GPU", "label_en": "Solve GPU Performance Issue"},
            {"id": "benchmark_analysis", "label": "تحليل نتيجة Benchmark", "label_en": "Analyze Benchmark Results"},
            {"id": "optimal_settings", "label": "اقتراح إعدادات مثالية", "label_en": "Suggest Optimal Settings"},
            {"id": "app_guide", "label": "شرح واجهة التطبيق", "label_en": "App Interface Guide"}
        ]
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
