# Vibe Studio

bolt.diy를 참고해 SvelteKit + SQLite(로컬 파일 DB)로 만든 바이브 코딩 페이지입니다. 왼쪽 채팅에 요구사항을 적으면 Claude가 SvelteKit 앱 코드를 생성하고, 브라우저 안의 WebContainer에서 바로 실행해 오른쪽 미리보기에 띄웁니다.

## 실행

```bash
pnpm install
cp .env.example .env          # ANTHROPIC_API_KEY 입력
pnpm dev
```

DB는 SQLite 파일(`data/vibe-studio.db`, git 제외)이며, 서버가 처음 뜰 때 자동으로 만들어지고 `drizzle/`의 마이그레이션이 적용됩니다. 별도 DB 설치나 Docker는 필요 없습니다.

`/`는 **블록 조합형 시작 페이지**입니다. 로고·라우트·버튼·텍스트 블록을 캔버스에 끌어다 놓아 페이지별 화면을 구성하고 **시작하기**를 누르면 `/chat/<id>`로 이동합니다. 이때 바로 생성하지 않고, 사용자가 첫 요청을 입력하면 그 구성이 "요소 간 상대적인 배치"(위아래 순서, 같은 줄, 좌우 순서·정렬, 간격) 설명으로 바뀌어 참고 자료로 함께 전달됩니다. 글로 바로 시작하려면 "빈 채팅으로 시작"을 누르세요. 크롬 계열 브라우저를 권장합니다(WebContainer 요구사항).

| 명령 | 설명 |
|---|---|
| `pnpm dev` | 개발 서버 |
| `pnpm check` | svelte-check 타입 검사 |
| `pnpm test` | vitest (메시지 파서 테스트) |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm db:generate` | 스키마(`src/lib/server/db/schema.ts`) 변경 후 마이그레이션 생성 (적용은 서버 시작 시 자동) |
| `pnpm db:studio` | Drizzle Studio로 DB 내용 보기 |

## 동작 흐름

0. 시작 페이지(`src/lib/builder/`)의 구성은 `chats.layout`에 저장됩니다. `/api/chat`은 매 요청마다 `layoutToReference()`로 만든 `<layout_reference>` 설명을 대화의 첫 사용자 메시지 앞에 붙여 Claude에 보냅니다(DB와 화면에는 사용자가 입력한 문장만 남음).
1. `/chat/[id]` 진입 시 WebContainer를 부팅하고 기본 SvelteKit 템플릿(`src/lib/webcontainer/template.ts`) 또는 DB에 저장된 최신 스냅샷을 마운트한 뒤 `npm install` → `npm run dev`를 실행합니다.
2. 메시지를 보내면 현재 프로젝트 파일과 함께 `POST /api/chat`으로 전송하고, 서버는 Claude 응답을 텍스트 스트림으로 돌려줍니다(`src/lib/server/llm/`).
3. 클라이언트의 `StreamingMessageParser`(bolt.diy에서 이식)가 `<boltArtifact>`/`<boltAction>` 태그를 추출하고, `Workbench`가 파일 쓰기·셸 명령을 순서대로 실행합니다. 미리보기는 Vite HMR로 갱신됩니다.
4. 응답이 끝나면 프로젝트 파일 전체를 `file_snapshots`에 저장합니다. 새로고침하면 대화와 결과물이 복원됩니다.

## 참고

- 생성되는 앱은 SvelteKit 2 + Vite 6으로 고정했습니다. 이 호스트 앱은 SvelteKit 3 / Vite 8이지만, Vite 8의 네이티브 바인딩이 WebContainer에서 동작한다는 보장이 없어서입니다.
- WebContainer 안에서는 외부 DB에 TCP로 붙을 수 없어, 생성되는 앱은 인메모리/JSON 파일 저장소를 쓰도록 프롬프트로 지시합니다.
- 모델 기본값은 `claude-opus-5-5`이며 `ANTHROPIC_MODEL`로 바꿀 수 있습니다.
- MariaDB 전환(예정): Drizzle을 쓰므로 `schema.ts`를 `mysql-core`로, `db/index.ts`를 `mysql2` 드라이버로, `drizzle.config.ts`의 dialect를 `mysql`로 바꾸고 마이그레이션을 다시 생성하면 됩니다. 쿼리 코드는 그대로 쓸 수 있습니다.
- Vercel 배포 시: `@sveltejs/adapter-vercel`로 교체하고, 외부 호스팅 DB를 연결하고(Vercel에서는 로컬 SQLite 파일이 유지되지 않음), 스트리밍 함수의 `maxDuration`을 늘려야 합니다. WebContainer를 상용 서비스에 쓰려면 StackBlitz 라이선스를 확인하세요.
