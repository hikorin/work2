import socket
import os
import re
import subprocess
import sys
import time

def get_ip():
    # Tailscale の IP アドレスを優先的に探すで！
    try:
        ts_ip = subprocess.check_output(["tailscale", "ip", "-4"]).decode("utf-8").strip()
        if ts_ip:
            print(f"✨ Tailscale IP を見つけたわ！: {ts_ip}")
            return ts_ip
    except Exception:
        pass

    # Tailscale がなかったらローカルIPアドレスを取得するで！
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

def update_api_urls(new_ip):
    # frontend/src/components 以下の全ファイルを更新するで！
    components_dir = os.path.join(os.getcwd(), 'kaeshi_app', 'frontend', 'src', 'components')
    if not os.path.exists(components_dir):
        print(f"Error: {components_dir} が見つからへんわ！")
        return

    pattern = re.compile(r'http://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:8000/api')
    new_url = f'http://{new_ip}:8000/api'

    for filename in os.listdir(components_dir):
        if filename.endswith('.tsx'):
            file_path = os.path.join(components_dir, filename)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if pattern.search(content):
                new_content = pattern.sub(new_url, content)
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated: {filename} を {new_ip} に書き換えたで！✨")

def setup_firewall():
    # Windows の場合、ファイアウォールの受信許可ルールを追加するで！
    if os.name == 'nt':
        print("🛡️ Windows ファイアウォールの設定を確認中...")
        ports = [8000, 5173]
        names = ["Allow Kaeshi Backend", "Allow Kaeshi Frontend"]
        
        for port, name in zip(ports, names):
            cmd = f'New-NetFirewallRule -DisplayName "{name}" -Direction Inbound -LocalPort {port} -Protocol TCP -Action Allow -ErrorAction SilentlyContinue'
            subprocess.run(["powershell", "-Command", cmd], capture_output=True)
        print("✅ ファイアウォールの門番に許可を出したわ！😎✌️")

def start_servers(ip):
    # バックエンドとフロントエンドを起動するで！
    print(f"🚀 サーバーを起動するわ！ IP: {ip}")
    
    # バックエンド (FastAPI)
    backend_dir = os.path.join(os.getcwd(), 'kaeshi_app', 'backend')
    venv_python = os.path.join(backend_dir, '.venv', 'Scripts', 'python.exe')
    if not os.path.exists(venv_python):
        venv_python = sys.executable

    backend_cmd = [venv_python, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
    print(f"Starting Backend: {' '.join(backend_cmd)}")
    backend_proc = subprocess.Popen(backend_cmd, cwd=backend_dir)

    # フロントエンド (Vite)
    frontend_dir = os.path.join(os.getcwd(), 'kaeshi_app', 'frontend')
    npm_cmd = "npm.cmd" if os.name == 'nt' else "npm"
    frontend_cmd = [npm_cmd, "run", "dev", "--", "--host", "0.0.0.0"]
    
    print(f"Starting Frontend: {' '.join(frontend_cmd)}")
    # PowerShell の実行ポリシーをプロセス内だけでバイパスして起動するで！
    if os.name == 'nt':
        ps_cmd = f'Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; {frontend_cmd[0]} {" ".join(frontend_cmd[1:])}'
        frontend_proc = subprocess.Popen(["powershell", "-Command", ps_cmd], cwd=frontend_dir)
    else:
        frontend_proc = subprocess.Popen(frontend_cmd, cwd=frontend_dir)

    print("\n" + "="*50)
    print(f"🎉 セットアップ完了やで！モバイルからここへアクセスしてな！")
    print(f"Frontend: http://{ip}:5173")
    print(f"Backend API: http://{ip}:8000/api")
    print("="*50 + "\n")
    print("Ctrl+C で終了するわ。")

    try:
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None:
                print("⚠️ バックエンドが止まったみたいや...")
                break
            if frontend_proc.poll() is not None:
                print("⚠️ フロントエンドが止まったみたいや...")
                break
    except KeyboardInterrupt:
        print("\n👋 終了するわ！お疲れさん！")
        backend_proc.terminate()
        frontend_proc.terminate()

if __name__ == "__main__":
    current_ip = get_ip()
    print(f"🔍 今のIPアドレスは {current_ip} やな！")
    update_api_urls(current_ip)
    setup_firewall()
    start_servers(current_ip)
