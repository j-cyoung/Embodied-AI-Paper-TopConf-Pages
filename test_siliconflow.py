#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import json
import argparse
from typing import Optional

import requests
from openai import OpenAI

BASE_URL = "https://api.siliconflow.cn/v1"


def require_api_key() -> str:
    api_key = os.getenv("SILICONFLOW_API_KEY") or os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("ERROR: missing API key. Please set SILICONFLOW_API_KEY (recommended).", file=sys.stderr)
        print("Example: export SILICONFLOW_API_KEY='sk-...'", file=sys.stderr)
        sys.exit(1)
    return api_key


def get_client(api_key: str) -> OpenAI:
    # SiliconFlow OpenAI-compatible base_url
    return OpenAI(api_key=api_key, base_url=BASE_URL)


def list_models(api_key: str, model_type: Optional[str] = "text", sub_type: Optional[str] = "chat") -> None:
    """
    SiliconFlow model list endpoint:
      GET https://api.siliconflow.cn/v1/models
    Supports query params like type/sub_type. (See docs)
    """
    url = f"{BASE_URL}/models"
    params = {}
    if model_type:
        params["type"] = model_type
    if sub_type:
        params["sub_type"] = sub_type

    r = requests.get(url, headers={"Authorization": f"Bearer {api_key}"}, params=params, timeout=30)
    r.raise_for_status()
    data = r.json()

    # Print as pretty JSON
    print(json.dumps(data, ensure_ascii=False, indent=2))


def chat_once(
    client: OpenAI,
    model: str,
    prompt: str,
    stream: bool = True,
    json_mode: bool = False,
    temperature: float = 0.7,
    max_tokens: int = 1024,
) -> None:
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": prompt},
    ]

    kwargs = dict(
        model=model,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
        stream=stream,
    )

    # JSON mode: enforce JSON object output format
    # (SiliconFlow chat-completions supports response_format in the OpenAI-style schema.)
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    resp = client.chat.completions.create(**kwargs)

    if not stream:
        msg = resp.choices[0].message
        # content + reasoning_content are both possible in SiliconFlow response schema
        out = {}
        if getattr(msg, "content", None):
            out["content"] = msg.content
        if getattr(msg, "reasoning_content", None):
            out["reasoning_content"] = msg.reasoning_content
        print(json.dumps(out, ensure_ascii=False, indent=2) if json_mode else (out.get("content") or ""))
        return

    # Stream mode: print delta.content + delta.reasoning_content if present
    for chunk in resp:
        if not chunk.choices:
            continue
        delta = chunk.choices[0].delta
        if getattr(delta, "content", None):
            print(delta.content, end="", flush=True)
        if getattr(delta, "reasoning_content", None):
            print(delta.reasoning_content, end="", flush=True)
    print()  # newline


def main():
    parser = argparse.ArgumentParser(description="SiliconFlow API demo (OpenAI-compatible).")
    parser.add_argument("--model", default="Qwen/Qwen2.5-72B-Instruct", help="Model id on SiliconFlow.")
    parser.add_argument("--prompt", default="用三点概括推理模型会给应用带来的机会。", help="User prompt.")
    parser.add_argument("--no-stream", action="store_true", help="Disable streaming.")
    parser.add_argument("--json", action="store_true", help="Enable JSON mode (response_format=json_object).")
    parser.add_argument("--temperature", type=float, default=0.7)
    parser.add_argument("--max-tokens", type=int, default=1024)
    parser.add_argument("--list-models", action="store_true", help="List available models for this account.")
    parser.add_argument("--type", default="text", help="For --list-models: model type filter (text/image/audio/video).")
    parser.add_argument("--sub-type", default="chat", help="For --list-models: sub_type filter (chat/embedding/...).")
    args = parser.parse_args()

    api_key = require_api_key()

    if args.list_models:
        list_models(api_key, model_type=args.type, sub_type=args.sub_type)
        return

    client = get_client(api_key)
    chat_once(
        client=client,
        model=args.model,
        prompt=args.prompt,
        stream=not args.no_stream,
        json_mode=args.json,
        temperature=args.temperature,
        max_tokens=args.max_tokens,
    )


if __name__ == "__main__":
    main()