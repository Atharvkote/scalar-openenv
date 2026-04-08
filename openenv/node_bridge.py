"""
Bridge to the Node.js FoodDash backend.

All methods fail silently and return ``None`` (or empty lists) so the
OpenEnv simulator can always fall back to its built-in deterministic data.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)

# HTTP timeout for all bridge requests (seconds)
_TIMEOUT = 3.0


def _get_requests():
    """Lazy-import requests so the module can be loaded even without it."""
    try:
        import requests  # type: ignore[import-untyped]
        return requests
    except ImportError:
        logger.warning("'requests' package not installed — Node bridge disabled")
        return None


class NodeBridge:
    """
    Thin HTTP client for the Node.js ``/api/openenv/*`` endpoints.

    Usage::

        bridge = NodeBridge("http://localhost:5000")
        orders = bridge.fetch_orders()
        bridge.update_order_status(order_id, "Delivered")
    """

    def __init__(self, base_url: str = "http://localhost:5000") -> None:
        self.base_url = base_url.rstrip("/")
        self._available: Optional[bool] = None

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def health_check(self) -> bool:
        """Return ``True`` if the Node backend is reachable."""
        requests = _get_requests()
        if requests is None:
            return False
        try:
            resp = requests.get(
                f"{self.base_url}/api/openenv/health",
                timeout=_TIMEOUT,
            )
            self._available = resp.status_code == 200
            return self._available
        except Exception as exc:
            logger.debug("Node health check failed: %s", exc)
            self._available = False
            return False

    def fetch_orders(self, limit: int = 50) -> list[dict[str, Any]]:
        """
        Fetch orders from the Node backend.

        Returns an empty list on any failure so the caller can fall back
        to simulator-generated data.
        """
        requests = _get_requests()
        if requests is None:
            return []
        try:
            resp = requests.get(
                f"{self.base_url}/api/openenv/orders",
                params={"limit": limit},
                timeout=_TIMEOUT,
            )
            if resp.status_code != 200:
                logger.warning("Node /orders returned %d", resp.status_code)
                return []
            data = resp.json()
            orders = data.get("orders", [])
            logger.info("Fetched %d orders from Node backend", len(orders))
            return orders
        except Exception as exc:
            logger.debug("Node fetch_orders failed: %s", exc)
            return []

    def update_order_status(self, order_id: str, status: str) -> bool:
        """
        Push a status update back to the Node backend.

        ``status`` must be one of: Not Process, Processing, Delivered, Cancelled.
        Returns ``True`` on success, ``False`` on any failure (silently).
        """
        requests = _get_requests()
        if requests is None:
            return False
        try:
            resp = requests.patch(
                f"{self.base_url}/api/openenv/orders/{order_id}/status",
                json={"status": status},
                timeout=_TIMEOUT,
            )
            if resp.status_code == 200:
                logger.debug("Updated order %s → %s on Node", order_id, status)
                return True
            logger.warning(
                "Node status update for %s returned %d",
                order_id,
                resp.status_code,
            )
            return False
        except Exception as exc:
            logger.debug("Node update_order_status failed: %s", exc)
            return False

    @property
    def is_available(self) -> bool:
        """Cached availability flag (updated by ``health_check``)."""
        if self._available is None:
            self.health_check()
        return bool(self._available)
