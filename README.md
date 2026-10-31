# MHSE

Next.js 16.2.9, React 19, TypeScript, Tailwind CSS, Supabase 기반 메모 보드입니다. npm을 사용하며 기존 디자인과 작성·조회·검색·공유·삭제·관리자 삭제 기능을 유지합니다. 수정 및 첨부파일 기능은 기존 코드에 없습니다.

## 로컬 설정

프로젝트 루트는 `C:\padlet\padlet`입니다. Node.js 20.9 이상을 설치하고 이 폴더에서 명령을 실행하세요.

1. Supabase 프로젝트를 만듭니다.
2. 새 DB에서는 SQL Editor에서 `schema.sql`을 확인하고 Run을 직접 누릅니다. 기존에 이 앱의 스키마를 적용했다면 전체 스키마를 무조건 다시 실행하지 말고 `sql/existing-memos-permissions.sql`로 공개 컬럼 권한만 보완하세요. 사용자 정의 스키마·정책이 있으면 먼저 비교하세요. 두 파일 모두 테이블과 데이터를 삭제하지 않습니다.
3. Supabase 프로젝트 설정에서 Project URL과 Legacy API Keys의 `anon`, `service_role` 키를 확인합니다.
4. 이미 준비된 `.env.local`의 아래 다섯 값을 입력합니다. 기존 `.env.local.example`은 원본 참고용으로 유지했으며 예시 비밀번호를 운영에 사용하지 마세요.

| 변수 | 입력할 값 | 공개 여부 |
| --- | --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | Supabase Project URL | 브라우저 공개 |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Legacy anon 키 | 브라우저 공개 |
| SUPABASE_SERVICE_ROLE_KEY | Legacy service_role 키 | 서버 전용 |
| ADMIN_PASSWORD | 직접 정한 긴 관리자 비밀번호, 평문 입력 | 서버 전용 |
| ADMIN_SESSION_SECRET | 직접 생성한 별도의 무작위 비밀 문자열 | 서버 전용 |

세션 비밀값은 로컬 터미널에서 다음 명령으로 생성한 뒤 직접 입력할 수 있습니다. 결과를 공유하거나 Git에 올리지 마세요.

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

```bash
npm ci
npm run dev
```

환경변수를 변경하면 개발 서버를 완전히 종료하고 다시 실행하세요. `http://localhost:3000`에서 메모 작성·조회·비밀번호 삭제와 관리자 로그인·강제 삭제·로그아웃을 직접 확인하세요. 전체 삭제는 테스트용 DB에서만 확인하세요.

## 검사 및 배포

```bash
npm run lint
npx tsc --noEmit
npm run build
```

GitHub에 소스를 업로드한 뒤 Vercel에서 연결하세요. 상위 폴더를 저장소 루트로 사용했다면 Vercel Root Directory를 `padlet`으로, 이 앱 폴더 자체를 올렸다면 기본 루트로 설정합니다. Framework는 Next.js, Install Command는 `npm ci`, Build Command는 `npm run build`, Output Directory는 기본값입니다. 별도 `vercel.json`은 필요하지 않습니다.

Vercel Settings → Environment Variables에서 위 다섯 변수를 로컬 파일과 별도로 입력하고 적용할 Production/Preview/Development 환경을 선택하세요. Preview가 운영 DB를 공유하면 테스트 삭제가 운영 데이터에 영향을 줄 수 있으므로 별도 테스트 DB를 권장합니다. 서버 전용 변수에는 `NEXT_PUBLIC_` 접두사를 붙이지 마세요. 공개 변수는 빌드에 포함되므로 값을 바꾸면 재배포해야 합니다.

`.env.local`, `node_modules`, `.next`, `.vercel`은 Git에서 제외됩니다. GitHub 업로드, Supabase SQL 실행, Vercel 프로젝트 생성·배포는 사용자가 직접 진행합니다.

## 보안 구조와 검증 범위

- 브라우저는 기존 Legacy anon 키와 RLS로 공개 메모 컬럼만 조회합니다. 삭제 비밀번호 해시는 컬럼 권한으로 숨깁니다. 참고: [Supabase 컬럼 권한 문서](https://supabase.com/docs/guides/database/postgres/column-level-security).
- 서버가 메모의 4자리 삭제 비밀번호를 bcrypt로 해시하고, 삭제 시 비교합니다. service_role은 서버에서만 사용합니다.
- 관리자 비밀번호는 서버에서 평문 비교하며 HMAC 세션을 사용합니다. 쿠키는 HttpOnly, SameSite=Strict, 운영 환경에서 Secure이고 서버에서도 8시간 만료를 확인합니다. 이 보완으로 이전 형식의 관리자 쿠키는 재로그인이 필요합니다.
- 기존 코드에는 로그인 및 삭제 비밀번호 시도 횟수 제한이 없습니다. 공개 운영 시 Vercel 등 서비스 경계에서 요청 제한을 별도로 설정하세요. 4자리 메모 비밀번호는 민감한 정보 보호 수단으로 사용하지 마세요.
- 실제 연결값 없이 ESLint, TypeScript, 프로덕션 빌드와 로컬 HTTP 응답을 검사했습니다. 메모 쓰기·삭제, 실제 관리자 로그인, SQL 실행 및 외부 배포는 미검증입니다. 자세한 결과는 `VERIFICATION.md`를 참고하세요.