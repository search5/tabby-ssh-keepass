# tabby-keepass-ssh

🌐 [English](README.md) | **한국어**

📖 **[문서](https://search5.github.io/tabby-ssh-keepass/ko/)** (English / 한국어)

[Tabby](https://tabby.sh) 플러그인으로, keyboard-interactive 인증 시 KeePass 데이터베이스에서 SSH 비밀번호와 TOTP 코드를 자동으로 채워줍니다 — 수동 복사-붙여넣기가 필요 없습니다.

## 기능

- **비밀번호 자동 입력** — `ssh://host:port` URL로 KeePass 엔트리를 매칭해서 비밀번호 필드를 자동으로 채웁니다
- **TOTP 자동 입력** — KeePass 엔트리에서 현재 TOTP 코드를 생성해 자동으로 제출합니다
- **완전 자동 제출** — 비밀번호와 TOTP 패널 모두 사용자 조작 없이 제출됩니다
- **안전한 마스터 비밀번호 보관** — OS 키체인(macOS Keychain / libsecret / Windows Credential Manager)에 저장되며, 평문으로 디스크에 기록되지 않습니다
- **KDBX4 지원** — `hash-wasm`을 통한 argon2 키 유도
- **실시간 갱신** — `fs.watch`로 `.kdbx` 파일 변경을 감지해 캐시를 자동으로 지웁니다
- **URL 중복 처리** — 여러 엔트리가 같은 URL을 공유하면 Tabby의 선택 UI로 고를 수 있습니다

## 사전 요구 사항

- `tabby-ssh` 플러그인이 설치된 [Tabby](https://tabby.sh)
- SSH 엔트리가 있는 KeePass 데이터베이스(`.kdbx`)

## KeePass 엔트리 형식

각 SSH 엔트리의 **URL** 필드는 다음과 같이 설정해야 합니다:

```
ssh://hostname
ssh://hostname:port
```

예시:

| Host | Port | URL 필드 |
|------|------|-----------|
| `192.168.1.10` | `22` | `ssh://192.168.1.10` |
| `my-server.example.com` | `2222` | `ssh://my-server.example.com:2222` |

### TOTP 설정

SSH 서버가 TOTP(예: Google Authenticator)를 요구한다면, 같은 엔트리에 다음 필드명 중 하나로 TOTP 시크릿을 저장하세요:

| 필드명 | 형식 | 생성 도구 |
|---|---|---|
| `otp` | `otpauth://totp/...?secret=BASE32SECRET` | KeePassXC |
| `TimeOtp-Secret-Base32` | 원본 base32 시크릿 | KeePass 2.47+ 내장 TOTP |
| `TOTP Seed` | 원본 base32 시크릿 | 레거시 KeePass TOTP 플러그인 |

## 설치

### 방법 A — Tabby 플러그인 매니저 (권장)

**Tabby Settings → Plugins**에서 `keepass-ssh`를 검색해 Install을 클릭하세요. 안내가 뜨면 Tabby를 재시작합니다.

### 방법 B — 소스에서 직접 설치

**요구 사항:** [Node.js](https://nodejs.org/) 18 이상

```bash
git clone https://github.com/search5/tabby-ssh-keepass.git
cd tabby-ssh-keepass
npm install
npm run build
npm run install-plugin
```

`npm run install-plugin`은 빌드된 파일을 올바른 Tabby 플러그인 디렉터리로 복사합니다:

| OS | 플러그인 디렉터리 |
|---|---|
| macOS | `~/Library/Application Support/tabby/plugins/node_modules/tabby-keepass-ssh/` |
| Linux | `~/.config/tabby/plugins/node_modules/tabby-keepass-ssh/` |
| Windows | `%APPDATA%\tabby\plugins\node_modules\tabby-keepass-ssh\` |

설치 후 Tabby를 재시작하세요.

## 설정

1. **Tabby Settings → KeePass SSH** 열기
2. `.kdbx` 파일 경로 설정
3. 마스터 비밀번호 입력 (OS 키체인에 저장됨)
4. SSH 프로필의 **Authentication**을 **Keyboard-interactive**로 설정

이후 연결할 때마다 플러그인이 자격 증명을 자동으로 채워줍니다.

## 보안 참고 사항

- 마스터 비밀번호는 DB를 여는 동안에만 메모리에 유지되며, 평문으로 디스크에 기록되지 않습니다.
- `ProtectedValue.getText()`는 사용 직전에 호출되며 결과값은 보관되지 않습니다.
- TOTP 시크릿과 비밀번호를 같은 KeePass 엔트리에 저장하는 것은 편의성을 위한 의도적인 절충입니다.

## 개발

```bash
npm run watch          # 파일 변경 시 자동 재빌드
npm run install-plugin # Tabby 플러그인 디렉터리로 복사
# 이후 Tabby 재시작
```

## 라이선스

MIT

Copyright (c) 2026 Ji-Ho Lee

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
