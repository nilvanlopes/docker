#!/usr/bin/env python3
"""Idempotent provisioning using the existing local Swarm/AuthentiK access."""
import json
import os
from pathlib import Path
import subprocess
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
HOST = "meusite.nilvanlopes.com"
TUNNEL = "3647717f-6246-4d24-b5b8-1319be027c80.cfargotunnel.com"


def container(service):
    ids = subprocess.check_output(
        ["docker", "ps", "-q", "--filter", "label=com.docker.swarm.service.name=" + service],
        text=True,
    ).split()
    if len(ids) != 1:
        raise SystemExit(f"Expected one running container for {service}")
    return ids[0]


def cloudflare(token, path, method="GET", payload=None):
    request = urllib.request.Request(
        "https://api.cloudflare.com/client/v4" + path,
        data=json.dumps(payload).encode() if payload else None,
        headers={"Authorization": "Bearer " + token, "Content-Type": "application/json"},
        method=method,
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            result = json.load(response)
    except urllib.error.HTTPError as exc:
        raise SystemExit(f"Cloudflare request failed: HTTP {exc.code}") from None
    if not result.get("success"):
        raise SystemExit("Cloudflare request failed; check token permissions")
    return result["result"]


def main():
    # Read the existing DNS credential through the running service, never log it.
    dns_token = subprocess.check_output([
        "docker", "exec", container("traefik_traefik"), "cat", "/run/secrets/cloudflare_api_token"
    ], text=True).strip()
    zones = cloudflare(dns_token, "/zones?name=nilvanlopes.com")
    if len(zones) != 1:
        raise SystemExit("Cloudflare token cannot access nilvanlopes.com")
    dns_path = f"/zones/{zones[0]['id']}/dns_records"
    records = cloudflare(dns_token, dns_path + "?name=" + HOST)
    if records and (len(records) != 1 or records[0]["type"] != "CNAME" or records[0]["content"] != TUNNEL):
        raise SystemExit(f"Existing DNS record for {HOST} points elsewhere; refusing to overwrite")

    result = subprocess.run([
        "docker", "exec", "-i", "-e", "AUTHENTIK_LOG_LEVEL=error", container("authentik_server"),
        "ak", "shell", "-c", "import sys; exec(sys.stdin.read())",
    ], input=(ROOT / "scripts/meu-site-authentik.py").read_text(), text=True, capture_output=True)
    if result.returncode:
        # Only show the final exception, excluding logs and token-bearing stdout.
        error = result.stderr.strip().splitlines()
        raise SystemExit("Authentik provisioning failed: " + (error[-1] if error else "see server logs"))
    marker = "MEU_SITE_RESULT="
    data = json.loads(next(line[len(marker):] for line in result.stdout.splitlines() if line.startswith(marker)))
    env_file = ROOT / "authentik/outposts/meu-site/.env"
    fd = os.open(env_file, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    os.fchmod(fd, 0o600)
    with os.fdopen(fd, "w") as env:
        env.write("AUTHENTIK_TOKEN=" + data["token"] + "\n")
    print("Authentik: grupo meu-site somente com pyu; políticas verificadas:", data["decisions"])
    if not records:
        cloudflare(dns_token, dns_path, "POST", {"type": "CNAME", "name": HOST,
                   "content": TUNNEL, "proxied": True, "ttl": 1})
    elif not records[0]["proxied"]:
        cloudflare(dns_token, dns_path + "/" + records[0]["id"], "PATCH", {"proxied": True})
    print(f"DNS: {HOST} protegido pelo Cloudflare Tunnel existente")


if __name__ == "__main__":
    main()
