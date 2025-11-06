"""
Real-time Updates via Server-Sent Events (SSE)
===============================================

Provides real-time updates to operator dashboard when:
- Recommendations are created, approved, rejected, modified
- Alerts are triggered
- Other operators take actions

SSE is chosen over WebSocket for simplicity:
- One-way communication (server -> client) is sufficient
- Built-in browser support with automatic reconnection
- Simpler implementation than WebSocket

Endpoints:
- GET /realtime/stream - SSE endpoint for receiving updates

Events emitted:
- recommendation_approved
- recommendation_rejected
- recommendation_modified
- recommendation_flagged
- recommendation_created
- alert_triggered
- stats_updated
"""

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
import asyncio
import json
from datetime import datetime
from typing import Dict, Set
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# ============================================================================
# Connection Management
# ============================================================================

# Store active SSE connections (each client gets a queue)
active_connections: Set[asyncio.Queue] = set()

async def add_connection(queue: asyncio.Queue):
    """Add a new client connection"""
    active_connections.add(queue)
    logger.info(f"New SSE connection. Total connections: {len(active_connections)}")

async def remove_connection(queue: asyncio.Queue):
    """Remove a disconnected client"""
    active_connections.discard(queue)
    logger.info(f"SSE connection closed. Total connections: {len(active_connections)}")

# ============================================================================
# Event Broadcasting
# ============================================================================

async def broadcast_event(event_type: str, data: Dict):
    """
    Broadcast an event to all connected clients.
    
    Args:
        event_type: Type of event (e.g., 'recommendation_approved')
        data: Event payload data
    """
    if not active_connections:
        logger.debug(f"No active connections. Skipping broadcast: {event_type}")
        return
    
    event = {
        "type": event_type,
        "data": data,
        "timestamp": datetime.now().isoformat()
    }
    
    logger.info(f"Broadcasting {event_type} to {len(active_connections)} clients")
    
    # Send to all connected clients
    disconnected_queues = []
    for queue in active_connections:
        try:
            await asyncio.wait_for(queue.put(event), timeout=1.0)
        except asyncio.TimeoutError:
            logger.warning("Queue timeout - client may be slow")
        except Exception as e:
            logger.error(f"Error broadcasting to client: {e}")
            disconnected_queues.append(queue)
    
    # Clean up disconnected clients
    for queue in disconnected_queues:
        await remove_connection(queue)

# ============================================================================
# SSE Endpoint
# ============================================================================

@router.get(
    "/realtime/stream",
    summary="Real-time updates stream",
    description="Server-Sent Events (SSE) endpoint for receiving real-time dashboard updates"
)
async def realtime_stream(request: Request):
    """
    SSE endpoint that streams real-time updates to clients.
    
    Clients connect to this endpoint and receive events as they happen.
    Connection automatically retries on disconnect.
    
    Event format:
        data: {"type": "recommendation_approved", "data": {...}, "timestamp": "..."}
    """
    
    async def event_generator():
        # Create queue for this client
        queue: asyncio.Queue = asyncio.Queue(maxsize=100)
        
        try:
            await add_connection(queue)
            
            # Send initial connection event
            initial_event = {
                "type": "connected",
                "data": {"message": "Real-time updates connected"},
                "timestamp": datetime.now().isoformat()
            }
            yield f"data: {json.dumps(initial_event)}\n\n"
            
            # Stream events from queue
            while True:
                # Check if client disconnected
                if await request.is_disconnected():
                    logger.info("Client disconnected")
                    break
                
                try:
                    # Wait for next event (with timeout to check for disconnect)
                    event = await asyncio.wait_for(queue.get(), timeout=30.0)
                    
                    # Format as SSE
                    yield f"data: {json.dumps(event)}\n\n"
                    
                except asyncio.TimeoutError:
                    # Send keepalive ping every 30 seconds
                    ping_event = {
                        "type": "ping",
                        "data": {},
                        "timestamp": datetime.now().isoformat()
                    }
                    yield f"data: {json.dumps(ping_event)}\n\n"
                    
        except asyncio.CancelledError:
            logger.info("SSE stream cancelled")
        except Exception as e:
            logger.error(f"Error in SSE stream: {e}", exc_info=True)
        finally:
            await remove_connection(queue)
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
            "Connection": "keep-alive",
        }
    )

# ============================================================================
# Helper Functions for Other Modules
# ============================================================================

async def broadcast_recommendation_approved(recommendation_id: str, operator_id: str):
    """Broadcast recommendation approved event"""
    await broadcast_event("recommendation_approved", {
        "recommendation_id": recommendation_id,
        "operator_id": operator_id
    })

async def broadcast_recommendation_rejected(recommendation_id: str, operator_id: str, reason: str):
    """Broadcast recommendation rejected event"""
    await broadcast_event("recommendation_rejected", {
        "recommendation_id": recommendation_id,
        "operator_id": operator_id,
        "reason": reason
    })

async def broadcast_recommendation_modified(recommendation_id: str, operator_id: str):
    """Broadcast recommendation modified event"""
    await broadcast_event("recommendation_modified", {
        "recommendation_id": recommendation_id,
        "operator_id": operator_id
    })

async def broadcast_recommendation_flagged(recommendation_id: str, operator_id: str):
    """Broadcast recommendation flagged event"""
    await broadcast_event("recommendation_flagged", {
        "recommendation_id": recommendation_id,
        "operator_id": operator_id
    })

async def broadcast_recommendation_created(recommendation_id: str, user_id: str):
    """Broadcast new recommendation created event"""
    await broadcast_event("recommendation_created", {
        "recommendation_id": recommendation_id,
        "user_id": user_id
    })

async def broadcast_alert_triggered(alert_id: str, alert_type: str):
    """Broadcast alert triggered event"""
    await broadcast_event("alert_triggered", {
        "alert_id": alert_id,
        "alert_type": alert_type
    })

async def broadcast_stats_updated():
    """Broadcast stats updated event"""
    await broadcast_event("stats_updated", {})

# ============================================================================
# Health/Status Endpoint
# ============================================================================

@router.get(
    "/realtime/status",
    summary="Real-time status",
    description="Check real-time system status and active connections"
)
async def realtime_status():
    """
    Get real-time system status.
    
    Returns:
        Active connection count and system health
    """
    return {
        "status": "healthy",
        "active_connections": len(active_connections),
        "timestamp": datetime.now().isoformat()
    }

