import socket
import os
import re
import subprocess
import sys
import time

def get_ip():
    # 優先したいTailscale環境などのIPアドレス
    target_ip = "100.98.193.61"
    try:
        # ipconfigの結果からターゲットIPが存在するかチェックするで！
        output = subprocess.check_output("ipconfig", shell=True, text=True, encoding='cp932', errors='ignore')
        if target_ip in output:
            print(f"🎯 優先IP ({target_ip}) を見つけたで！これを使うわ！")
            return target_ip
    except Exception as e:
        pass

    # 見つからへん場合は通常のローカルIPアドレスを取得するで！
    print("⚠️ 優先IPが見つからへんから、標準のローカルIPを探すわ...")
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # 実際に接続しなくても、ルートを解決するだけでIPが分かるんや
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

    # ポートが8000でも8080でもマッチするように正規表現を変更
    pattern = re.compile(r'http://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{4}')
    new_url = f'http://{new_ip}:8080'

    for filename in os.listdir(components_dir):
        if filename.endswith('.tsx'):
            file_path = os.path.join(components_dir, filename)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if pattern.search(content):
                new_content = pattern.sub(new_url, content)
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated: {filename} を {new_url} に書き換えたで！✨")

def start_servers(ip):
    # バックエンドとフロントエンドを起動するで！
    print(f"🚀 サーバーを起動するわ！ IP: {ip}")
    
    # バックエンド (FastAPI)
    backend_dir = os.path.join(os.getcwd(), 'kaeshi_app', 'backend')
    # .venv のパスを考慮するで
    venv_python = os.path.join(backend_dir, '.venv', 'Scripts', 'python.exe')
    if not os.path.exists(venv_python):
        venv_python = sys.executable # 見つからへんかったら今のPythonを使うわ

    # ポートを8080に変更！
    backend_cmd = [venv_python, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
    print(f"Starting Backend: {' '.join(backend_cmd)}")
    backend_proc = subprocess.Popen(backend_cmd, cwd=backend_dir)

    # フロントエンド (Vite)
    frontend_dir = os.path.join(os.getcwd(), 'kaeshi_app', 'frontend')
    frontend_cmd = ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
    # Windows の場合は shell=True が必要や
    print(f"Starting Frontend: {' '.join(frontend_cmd)}")
    frontend_proc = subprocess.Popen(frontend_cmd, cwd=frontend_dir, shell=True)

    print("\n" + "="*50)
    print(f"🎉 セットアップ完了やで！モバイルからここへアクセスしてな！")
    print(f"Frontend: http://{ip}:5173")
    print(f"Backend API: http://{ip}:8080/docs")
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
    start_servers(current_ip)
