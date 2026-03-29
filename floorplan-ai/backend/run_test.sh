#!/bin/bash
set -x
cd /Users/ashishbhardwaj/prmopthon/floorplan-ai/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 2>&1
echo "Exit code: $?"
