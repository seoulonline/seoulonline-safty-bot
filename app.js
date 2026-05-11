/* ==========================================================
   서울온라인학교 정보안전 학습관 - app.js
   Windows 10 풍 데스크톱 인터페이스
========================================================== */

(() => {
  'use strict';

  /* ==========================================================
     앱 메타데이터
     - id: 식별자
     - title: 창 제목
     - icon: 이모지 아이콘 (바탕화면, 시작메뉴, 작업표시줄 공용)
     - tile: { color: 'blue' | 'cyan' | ... , large: bool }
     - desktop: 바탕화면에 둘지 여부
     - size: 기본 창 크기
  ========================================================== */
  const apps = [
    { id: 'chatbot',   title: '챗봇 도우미',       icon: '🤖', tile: { color: 'blue',     large: true  }, desktop: true,  size: { w: 720, h: 620 }, group: 'main' },
    { id: 'resources', title: '자료 폴더',         icon: '📁', tile: { color: 'orange',   large: false }, desktop: true,  size: { w: 760, h: 560 }, group: 'main' },
    { id: 'game',      title: '정보안전 챌린지',   icon: '🎮', tile: { color: 'red',      large: false }, desktop: true,  size: { w: 760, h: 580 }, group: 'main' },
    { id: 'quiz',      title: '정보안전 퀴즈',     icon: '🛡️', tile: { color: 'darkblue', large: false }, desktop: true,  size: { w: 560, h: 540 }, group: 'main' },
    { id: 'cards',     title: '학습 카드',         icon: '📚', tile: { color: 'cyan',     large: false }, desktop: true,  size: { w: 720, h: 560 }, group: 'main' },
    { id: 'checklist', title: '안전 체크리스트',   icon: '✅', tile: { color: 'green',    large: false }, desktop: true,  size: { w: 520, h: 540 }, group: 'main' },
    { id: 'about',     title: '온라인학교 소개',   icon: 'ℹ️', tile: { color: 'purple',   large: false }, desktop: false, size: { w: 560, h: 540 }, group: 'tool' },
  ];

  /* ==========================================================
     상태
  ========================================================== */
  const state = {
    zCounter: 100,
    windows: {},        // id -> {el, title, icon, restore: {x,y,w,h}, maximized, minimized}
    activeId: null,
    startOpen: false,
  };

  /* ==========================================================
     DOM 헬퍼
  ========================================================== */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const el = (tag, opts = {}) => {
    const e = document.createElement(tag);
    if (opts.cls) e.className = opts.cls;
    if (opts.html != null) e.innerHTML = opts.html;
    if (opts.text != null) e.textContent = opts.text;
    if (opts.attrs) for (const [k, v] of Object.entries(opts.attrs)) e.setAttribute(k, v);
    return e;
  };

  /* ==========================================================
     모바일 감지
  ========================================================== */
  const isMobile = () => window.matchMedia('(max-width: 720px)').matches;
  const taskbarHeight = () => isMobile() ? 48 : 40;

  /* ==========================================================
     부팅
  ========================================================== */
  function boot() {
    const boot = $('#boot-screen');
    const desktop = $('#desktop');
    setTimeout(() => {
      boot.classList.add('fade-out');
      desktop.classList.remove('hidden');
      setTimeout(() => boot.remove(), 700);
    }, 1800);
  }

  /* ==========================================================
     시계
  ========================================================== */
  function tickClock() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    $('#time').textContent = `${hh}:${mm}`;
    const y = now.getFullYear();
    const mo = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    $('#date').textContent = `${y}-${mo}-${d}`;
    const wDay = ['일','월','화','수','목','금','토'][now.getDay()];
    const widget = $('#widget-date');
    if (widget) widget.textContent = `${y}년 ${parseInt(mo)}월 ${parseInt(d)}일 (${wDay})`;
  }

  /* ==========================================================
     바탕화면 / 시작 메뉴 구성
  ========================================================== */
  function buildDesktopIcons() {
    const host = $('#desktop-icons');
    host.innerHTML = '';
    apps.filter(a => a.desktop).forEach(a => {
      const icon = el('div', { cls: 'desktop-icon', attrs: { 'data-app': a.id, tabindex: '0' } });
      icon.innerHTML = `<div class="ico">${a.icon}</div><div class="lbl">${a.title}</div>`;
      let lastClick = 0;
      icon.addEventListener('click', () => {
        const now = Date.now();
        // 단일 선택 표시
        $$('.desktop-icon').forEach(n => n.classList.remove('selected'));
        icon.classList.add('selected');
        if (now - lastClick < 380) {
          openApp(a.id);
        }
        lastClick = now;
      });
      icon.addEventListener('dblclick', () => openApp(a.id));
      icon.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') openApp(a.id);
      });
      host.appendChild(icon);
    });
  }

  function buildStartMenu() {
    // 왼쪽 작은 앱 목록
    const list = $('#start-app-list');
    list.innerHTML = '';
    apps.forEach(a => {
      const item = el('div', { cls: 'start-app-item', attrs: { 'data-app': a.id } });
      item.innerHTML = `${a.icon}<span class="tooltip">${a.title}</span>`;
      item.addEventListener('click', () => {
        closeStartMenu();
        openApp(a.id);
      });
      list.appendChild(item);
    });

    // 타일 영역
    const buildTiles = (host, group) => {
      host.innerHTML = '';
      apps.filter(a => a.group === group).forEach(a => {
        const t = el('div', {
          cls: `tile t-${a.tile.color}${a.tile.large ? ' large' : ''}`,
          attrs: { 'data-app': a.id }
        });
        t.innerHTML = `
          <div class="tile-icon">${a.icon}</div>
          <div class="tile-name">${a.title}</div>
        `;
        t.addEventListener('click', () => {
          closeStartMenu();
          openApp(a.id);
        });
        host.appendChild(t);
      });
    };
    buildTiles($('#tiles'), 'main');
    buildTiles($('#tiles2'), 'tool');
  }

  function toggleStartMenu() {
    state.startOpen ? closeStartMenu() : openStartMenu();
  }
  function openStartMenu() {
    $('#start-menu').classList.add('open');
    $('#start-btn').classList.add('active');
    state.startOpen = true;
  }
  function closeStartMenu() {
    $('#start-menu').classList.remove('open');
    $('#start-btn').classList.remove('active');
    state.startOpen = false;
  }

  /* ==========================================================
     창 관리
  ========================================================== */
  function openApp(id, options) {
    if (state.windows[id]) {
      // 이미 열림 → 활성화 + 최소화 해제
      const w = state.windows[id];
      if (w.minimized) restoreFromMinimized(id);
      activateWindow(id);
      return;
    }
    const meta = (options && options.meta) ? options.meta : apps.find(a => a.id === id);
    if (!meta) return;

    const winEl = el('div', { cls: 'window', attrs: { 'data-id': id } });
    const w = meta.size.w;
    const h = meta.size.h;
    // 약간씩 어긋나게 배치
    const offset = Object.keys(state.windows).length * 26;
    const left = Math.max(20, Math.round((window.innerWidth - w) / 2) + offset - 60);
    const top = Math.max(20, Math.round((window.innerHeight - 40 - h) / 2) + offset - 40);

    winEl.style.width = w + 'px';
    winEl.style.height = h + 'px';
    winEl.style.left = left + 'px';
    winEl.style.top = top + 'px';

    winEl.innerHTML = `
      <div class="title-bar">
        <span class="tb-icon">${meta.icon}</span>
        <span class="tb-title">${meta.title}</span>
        <div class="title-bar-controls">
          <button class="tb-btn min" title="최소화" aria-label="최소화">
            <svg viewBox="0 0 12 12"><rect x="2" y="6" width="8" height="1" fill="currentColor"/></svg>
          </button>
          <button class="tb-btn max" title="최대화" aria-label="최대화">
            <svg viewBox="0 0 12 12"><rect x="2" y="2" width="8" height="8" fill="none" stroke="currentColor"/></svg>
          </button>
          <button class="tb-btn close" title="닫기" aria-label="닫기">
            <svg viewBox="0 0 12 12">
              <line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" stroke-width="1.2"/>
              <line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" stroke-width="1.2"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="window-body"></div>
    `;
    $('#windows-container').appendChild(winEl);

    // 콘텐츠 로딩
    const body = winEl.querySelector('.window-body');
    if (options && typeof options.populate === 'function') {
      options.populate(body);
    } else {
      const tplId = (options && options.template) ? options.template : id;
      const tpl = $(`#tpl-${tplId}`);
      if (tpl) body.appendChild(tpl.content.cloneNode(true));
    }

    // 컨트롤 이벤트
    winEl.querySelector('.tb-btn.close').addEventListener('click', (e) => {
      e.stopPropagation();
      closeWindow(id);
    });
    winEl.querySelector('.tb-btn.min').addEventListener('click', (e) => {
      e.stopPropagation();
      minimizeWindow(id);
    });
    winEl.querySelector('.tb-btn.max').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMaximize(id);
    });
    winEl.querySelector('.title-bar').addEventListener('dblclick', () => toggleMaximize(id));

    // 클릭 시 활성화
    winEl.addEventListener('mousedown', () => activateWindow(id));

    // 드래그
    makeDraggable(winEl, winEl.querySelector('.title-bar'));

    // 상태 저장
    state.windows[id] = {
      el: winEl,
      meta,
      restore: { x: left, y: top, w, h },
      maximized: false,
      minimized: false,
    };
    addTaskbarApp(id);
    activateWindow(id);

    // 앱별 초기화 (동적 윈도우는 스킵 — populate에서 직접 처리)
    if (!options || !options.populate) {
      initAppInstance(id, body);
    }

    // 모바일에서는 자동 최대화 (드래그·리사이즈 대신 풀스크린이 더 적합)
    if (isMobile()) {
      toggleMaximize(id);
    }
  }

  function makeDraggable(winEl, handle) {
    let dragging = false;
    let startX = 0, startY = 0, origX = 0, origY = 0;

    const getPoint = (e) => {
      if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      return { x: e.clientX, y: e.clientY };
    };

    const onDown = (e) => {
      if (e.target.closest('.tb-btn')) return;
      const id = winEl.getAttribute('data-id');
      const w = state.windows[id];
      if (w?.maximized) return;
      // 모바일에선 드래그 자체를 비활성 (창은 풀스크린)
      if (isMobile()) return;
      dragging = true;
      const p = getPoint(e);
      startX = p.x; startY = p.y;
      origX = parseInt(winEl.style.left) || 0;
      origY = parseInt(winEl.style.top) || 0;
      document.body.style.cursor = 'move';
    };
    const onMove = (e) => {
      if (!dragging) return;
      const p = getPoint(e);
      const dx = p.x - startX;
      const dy = p.y - startY;
      const newX = origX + dx;
      const newY = Math.max(0, Math.min(window.innerHeight - 80, origY + dy));
      winEl.style.left = newX + 'px';
      winEl.style.top = newY + 'px';
      if (e.touches) e.preventDefault();
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      document.body.style.cursor = '';
      const id = winEl.getAttribute('data-id');
      const w = state.windows[id];
      if (w && !w.maximized) {
        w.restore.x = parseInt(winEl.style.left);
        w.restore.y = parseInt(winEl.style.top);
      }
    };

    handle.addEventListener('mousedown', onDown);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    handle.addEventListener('touchstart', onDown, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
  }

  function activateWindow(id) {
    const w = state.windows[id];
    if (!w) return;
    state.zCounter += 1;
    w.el.style.zIndex = state.zCounter;
    state.activeId = id;
    Object.values(state.windows).forEach(o => o.el.classList.remove('active'));
    w.el.classList.add('active');
    // 작업 표시줄 active 표시
    $$('.tb-app').forEach(b => b.classList.remove('active'));
    const tb = $(`.tb-app[data-id="${id}"]`);
    if (tb) tb.classList.add('active');
  }

  function closeWindow(id) {
    const w = state.windows[id];
    if (!w) return;
    w.el.remove();
    delete state.windows[id];
    const tb = $(`.tb-app[data-id="${id}"]`);
    if (tb) tb.remove();
    if (state.activeId === id) state.activeId = null;
  }

  function minimizeWindow(id) {
    const w = state.windows[id];
    if (!w) return;
    w.el.classList.add('minimized');
    w.minimized = true;
    const tb = $(`.tb-app[data-id="${id}"]`);
    if (tb) tb.classList.remove('active');
  }
  function restoreFromMinimized(id) {
    const w = state.windows[id];
    if (!w) return;
    w.el.classList.remove('minimized');
    w.minimized = false;
  }

  function toggleMaximize(id) {
    const w = state.windows[id];
    if (!w) return;
    if (w.maximized) {
      w.el.classList.remove('maximized');
      w.el.style.left = w.restore.x + 'px';
      w.el.style.top = w.restore.y + 'px';
      w.el.style.width = w.restore.w + 'px';
      w.el.style.height = w.restore.h + 'px';
      w.maximized = false;
    } else {
      w.restore.x = parseInt(w.el.style.left) || 0;
      w.restore.y = parseInt(w.el.style.top) || 0;
      w.restore.w = parseInt(w.el.style.width) || w.meta.size.w;
      w.restore.h = parseInt(w.el.style.height) || w.meta.size.h;
      w.el.classList.add('maximized');
      w.maximized = true;
    }
    activateWindow(id);
  }

  /* ==========================================================
     작업 표시줄
  ========================================================== */
  function addTaskbarApp(id) {
    if ($(`.tb-app[data-id="${id}"]`)) return;
    // 동적 윈도우(파일 뷰어 등)는 state.windows에서, 일반 앱은 apps 배열에서 메타를 가져옴
    const meta = (state.windows[id] && state.windows[id].meta) || apps.find(a => a.id === id);
    if (!meta) return;
    const btn = el('div', {
      cls: 'tb-app',
      attrs: { 'data-id': id, title: meta.title }
    });
    btn.textContent = meta.icon;
    btn.addEventListener('click', () => {
      const w = state.windows[id];
      if (!w) return;
      if (w.minimized) {
        restoreFromMinimized(id);
        activateWindow(id);
      } else if (state.activeId === id) {
        minimizeWindow(id);
      } else {
        activateWindow(id);
      }
    });
    $('#taskbar-apps').appendChild(btn);
  }

  /* ==========================================================
     앱별 초기화
  ========================================================== */
  function initAppInstance(id, root) {
    if (id === 'quiz') initQuiz(root);
    if (id === 'cards') initCards(root);
    if (id === 'checklist') initChecklist(root);
    if (id === 'resources') initExplorer(root);
    if (id === 'game') initGame(root);
  }

  /* ============================
     퀴즈
  ============================= */
  const QUIZ = [
    {
      q: '비밀번호는 어떻게 만드는 것이 안전할까요?',
      opts: [
        '생일과 이름의 조합으로 만든다',
        '영문, 숫자, 특수문자를 섞어 8자 이상으로 만든다',
        '같은 문자를 반복해서 외우기 쉽게 만든다',
        '여러 사이트에서 동일한 비밀번호를 쓴다',
      ],
      a: 1,
      ex: '쉽게 추측되는 비밀번호는 위험합니다. 영문 대소문자·숫자·특수문자를 섞은 8자 이상이 안전하며, 사이트마다 다르게 사용하는 것이 좋습니다.',
    },
    {
      q: '모르는 사람이 보낸 이메일의 첨부파일을 어떻게 처리해야 할까요?',
      opts: [
        '바로 열어 내용을 확인한다',
        '친구에게도 전달해 함께 본다',
        '열지 않고 삭제하거나 선생님께 알린다',
        '일단 다운로드만 받아둔다',
      ],
      a: 2,
      ex: '모르는 사람의 첨부파일은 악성코드일 수 있어요. 열거나 다운로드하지 말고, 의심스러우면 어른에게 알리는 것이 가장 안전합니다.',
    },
    {
      q: 'SNS에 사진과 글을 올릴 때 가장 주의해야 할 점은?',
      opts: [
        '가능한 많은 정보를 노출해 인기를 얻는다',
        '집 주소·학교·전화번호 등 개인정보가 드러나지 않도록 신중히 올린다',
        '친구가 태그된 사진은 무조건 올린다',
        'SNS 자체를 절대 사용하지 않는다',
      ],
      a: 1,
      ex: '한 번 올라간 게시물은 디지털 발자국으로 남습니다. 위치 정보·교복·집 주변 풍경 등 신원이 드러날 수 있는 정보는 신중하게 다뤄야 해요.',
    },
    {
      q: '온라인에서 사이버 괴롭힘을 당했을 때 가장 적절한 행동은?',
      opts: [
        '혼자 참고 아무에게도 말하지 않는다',
        '똑같은 방식으로 되갚아준다',
        '증거를 남기고 부모님·선생님 등 신뢰할 수 있는 어른에게 알린다',
        '모든 SNS 계정을 즉시 삭제한다',
      ],
      a: 2,
      ex: '사이버 괴롭힘은 혼자 해결하지 않아도 됩니다. 화면 캡처 등 증거를 남기고, 어른의 도움을 받는 것이 가장 안전한 방법이에요.',
    },
    {
      q: '카페나 학교의 공공 와이파이를 사용할 때 주의할 점은?',
      opts: [
        '은행 앱과 결제 정보를 자유롭게 사용한다',
        '비밀번호와 개인정보 입력은 가급적 피한다',
        '와이파이는 절대 사용하지 않는다',
        '다른 사람의 계정으로 로그인해본다',
      ],
      a: 1,
      ex: '공공 와이파이는 보안이 취약할 수 있어요. 금융 거래나 비밀번호 입력은 모바일 데이터나 안전한 네트워크에서 하는 것이 좋습니다.',
    },
    {
      q: '인터넷에서 찾은 글, 사진, 영상을 사용할 때 올바른 자세는?',
      opts: [
        '인터넷에 올라온 자료는 마음대로 가져다 써도 된다',
        '저작권을 확인하고 출처를 밝히거나 허락을 받는다',
        '내 SNS에는 무엇이든 올려도 된다',
        '이름만 바꿔서 내가 만든 것처럼 사용한다',
      ],
      a: 1,
      ex: '디지털 자료에도 저작권이 있어요. 사용 전 허락을 받거나 출처를 밝히는 것이 디지털 시민의 기본 예절입니다.',
    },
    {
      q: '메시지로 받은 의심스러운 링크를 어떻게 해야 할까요?',
      opts: [
        '일단 클릭해서 어떤 사이트인지 확인한다',
        '친구들에게 단체로 전달한다',
        '클릭하지 않고 보낸 사람에게 직접 확인하거나 무시한다',
        '바로 회원가입을 진행한다',
      ],
      a: 2,
      ex: '피싱 링크는 한 번 클릭만으로도 개인정보가 새어나갈 수 있어요. 의심스러운 링크는 클릭하지 말고 발신자에게 직접 확인하세요.',
    },
    {
      q: '"디지털 발자국"이란 무엇일까요?',
      opts: [
        '컴퓨터 화면에 남는 발자국 모양',
        '인터넷 활동에서 남기는 모든 흔적과 기록',
        '디지털 시계의 한 종류',
        'AI가 그린 그림 양식',
      ],
      a: 1,
      ex: '검색 기록, 댓글, 좋아요, 게시물 모두 디지털 발자국이에요. 한 번 남긴 흔적은 쉽게 지워지지 않으니, 신중한 활동이 중요합니다.',
    },
  ];

  function initQuiz(root) {
    const state = { idx: 0, answers: Array(QUIZ.length).fill(null), submitted: Array(QUIZ.length).fill(false) };

    const body = root.querySelector('.quiz-body');
    const fill = root.querySelector('.quiz-progress-fill');
    const ptext = root.querySelector('.quiz-progress-text');
    const prevBtn = root.querySelector('[data-q-action="prev"]');
    const nextBtn = root.querySelector('[data-q-action="next"]');

    function renderQuestion() {
      const i = state.idx;
      if (i >= QUIZ.length) return renderResult();

      const item = QUIZ[i];
      body.innerHTML = '';
      const qBox = el('div');
      qBox.innerHTML = `<div class="quiz-question">Q${i + 1}. ${item.q}</div>`;
      const optsBox = el('div', { cls: 'quiz-options' });

      item.opts.forEach((opt, idx) => {
        const o = el('button', { cls: 'quiz-option', text: `${'①②③④'[idx]} ${opt}` });
        if (state.submitted[i]) {
          if (idx === item.a) o.classList.add('correct');
          if (state.answers[i] === idx && idx !== item.a) o.classList.add('wrong');
          o.disabled = true;
        } else if (state.answers[i] === idx) {
          o.classList.add('selected');
        }
        o.addEventListener('click', () => {
          if (state.submitted[i]) return;
          state.answers[i] = idx;
          state.submitted[i] = true;
          renderQuestion();
        });
        optsBox.appendChild(o);
      });
      qBox.appendChild(optsBox);

      if (state.submitted[i]) {
        const correct = state.answers[i] === item.a;
        const fb = el('div', {
          cls: `quiz-feedback ${correct ? 'correct' : 'wrong'}`,
          html: `<strong>${correct ? '정답이에요! 👍' : '아쉬워요. 다시 한 번 살펴볼까요?'}</strong><br/>${item.ex}`
        });
        qBox.appendChild(fb);
      }

      body.appendChild(qBox);
      fill.style.width = `${((i) / QUIZ.length) * 100}%`;
      ptext.textContent = `${i + 1} / ${QUIZ.length}`;
      prevBtn.disabled = i === 0;
      nextBtn.textContent = i === QUIZ.length - 1 ? '결과 보기 ▶' : '다음 ▶';
    }

    function renderResult() {
      const correctCnt = state.answers.reduce((acc, ans, i) => acc + (ans === QUIZ[i].a ? 1 : 0), 0);
      const pct = Math.round((correctCnt / QUIZ.length) * 100);
      let msg;
      if (pct >= 90) msg = '완벽해요! 정보안전 마스터 🏆';
      else if (pct >= 70) msg = '잘했어요! 조금만 더 살펴보면 완벽할 거예요.';
      else if (pct >= 50) msg = '괜찮아요. 카드와 체크리스트를 한 번 더 살펴볼까요?';
      else msg = '천천히 다시 도전해봐요. 학습 카드부터 보면 도움이 될 거예요.';

      body.innerHTML = `
        <div class="quiz-result">
          <div class="quiz-result-score">${pct}점</div>
          <div class="quiz-result-msg">${correctCnt} / ${QUIZ.length} 문항 정답 — ${msg}</div>
          <div class="quiz-result-detail">
            <strong>다음 활동도 추천해요</strong><br/>
            · 학습 카드를 열어 헷갈렸던 주제를 복습해보기<br/>
            · 안전 체크리스트로 평소 습관을 점검해보기<br/>
            · 챗봇 도우미에게 궁금했던 점 다시 물어보기
          </div>
        </div>
      `;
      fill.style.width = '100%';
      ptext.textContent = `${QUIZ.length} / ${QUIZ.length}`;
      prevBtn.disabled = false;
      nextBtn.textContent = '🔁 다시 풀기';
    }

    prevBtn.addEventListener('click', () => {
      if (state.idx >= QUIZ.length) {
        state.idx = QUIZ.length - 1;
      } else if (state.idx > 0) {
        state.idx -= 1;
      }
      renderQuestion();
    });
    nextBtn.addEventListener('click', () => {
      if (state.idx >= QUIZ.length) {
        // 다시 풀기
        state.idx = 0;
        state.answers = Array(QUIZ.length).fill(null);
        state.submitted = Array(QUIZ.length).fill(false);
        renderQuestion();
        return;
      }
      if (!state.submitted[state.idx]) {
        // 답을 고르지 않았다면 그냥 다음으로
      }
      state.idx += 1;
      renderQuestion();
    });

    renderQuestion();
  }

  /* ============================
     학습 카드
  ============================= */
  const CARDS = [
    {
      icon: '🔐', title: '강한 비밀번호', color: '#0078D7',
      back: '비밀번호는 영문 대소문자·숫자·특수문자를 섞어 8자 이상으로 만들고, 사이트마다 다르게 사용해요. 정기적으로 바꾸는 것도 좋은 습관입니다.'
    },
    {
      icon: '🎣', title: '피싱 알아채기', color: '#E81123',
      back: '"긴급", "당첨", "본인 확인" 같은 메시지로 링크 클릭을 유도한다면 의심하세요. 보낸 사람과 URL을 꼼꼼히 살펴보고, 의심스러우면 클릭하지 않는 것이 안전합니다.'
    },
    {
      icon: '👣', title: '디지털 발자국', color: '#5C2D91',
      back: '내가 인터넷에 남긴 검색·댓글·게시물은 모두 발자국이 됩니다. 시간이 지나도 남아 있을 수 있다는 점을 기억하고, 신중하게 활동하세요.'
    },
    {
      icon: '🤝', title: '디지털 시민의식', color: '#107C10',
      back: '온라인에서도 서로를 존중해야 해요. 공감하는 댓글, 정중한 표현, 출처를 밝히는 인용. 작은 행동들이 건강한 디지털 사회를 만듭니다.'
    },
    {
      icon: '💬', title: '사이버 괴롭힘 대처', color: '#D83B01',
      back: '괴롭힘을 당하면 혼자 해결하려 하지 말고 화면을 캡처해 증거를 남기고 부모님·선생님께 도움을 요청하세요. 117 학교폭력 신고센터도 이용할 수 있어요.'
    },
    {
      icon: '🛡️', title: '개인정보 지키기', color: '#00B294',
      back: '이름·생일·전화번호·집 주소·학교 정보는 함부로 공개하지 않아요. SNS 공개 범위 설정을 꼭 확인하고, 모르는 사람의 친구 요청은 신중히 판단하세요.'
    },
    {
      icon: '📷', title: '저작권 존중', color: '#1B6FB7',
      back: '인터넷의 글·사진·음악·영상도 저작물입니다. 사용 전 허락을 받거나 출처를 밝히고, 학습용으로만 사용한다면 공정 이용 범위를 확인해 보세요.'
    },
    {
      icon: '🤖', title: 'AI를 똑똑하게', color: '#0A5AA0',
      back: 'AI가 알려준 정보가 항상 옳은 것은 아니에요. 출처를 확인하고, 비판적으로 생각하며, 개인정보를 입력하지 않는 것이 안전한 사용법입니다.'
    },
  ];

  function initCards(root) {
    const grid = root.querySelector('.cards-grid');
    grid.innerHTML = '';
    CARDS.forEach(c => {
      const item = el('div', { cls: 'card-item' });
      item.style.background = c.color;
      item.innerHTML = `
        <div class="ci-front">
          <div class="ci-icon">${c.icon}</div>
          <div>
            <div class="ci-title">${c.title}</div>
            <div class="ci-hint">클릭해서 자세히 보기</div>
          </div>
        </div>
        <div class="card-back">${c.back}<br/><br/><span style="opacity:.7">↩ 다시 클릭하면 닫혀요</span></div>
      `;
      item.addEventListener('click', () => item.classList.toggle('flipped'));
      grid.appendChild(item);
    });
  }

  /* ============================
     체크리스트
  ============================= */
  const CHECKS = [
    '오늘 사용한 비밀번호는 다른 사이트와 다르게 설정되어 있다',
    '의심스러운 링크나 첨부파일을 클릭하지 않았다',
    'SNS의 공개 범위(전체공개/친구공개)를 확인했다',
    '게시물에 집·학교·전화번호 등 개인정보를 노출하지 않았다',
    '저작권이 있는 자료를 쓸 때 출처를 밝히거나 허락을 받았다',
    '온라인에서 친구에게 예의 있는 말투로 대화했다',
    '오늘 사용한 기기의 화면 잠금이 설정되어 있다',
    '의심스러운 일이 생겼을 때 어른에게 알릴 준비가 되어 있다',
    '필요 이상의 시간을 화면 앞에서 보내지 않으려 노력했다',
  ];

  function initChecklist(root) {
    const ul = root.querySelector('.check-list');
    const fill = root.querySelector('.check-score-fill');
    const text = root.querySelector('.check-score-text');
    const reset = root.querySelector('[data-c-action="reset"]');

    const checked = new Set();

    function update() {
      const pct = Math.round((checked.size / CHECKS.length) * 100);
      fill.style.width = pct + '%';
      let label;
      if (pct === 100) label = '완벽해요! 디지털 안전 100% 🏅';
      else if (pct >= 70) label = '잘하고 있어요. 조금만 더!';
      else if (pct >= 40) label = '하나씩 점검해 봐요.';
      else label = '체크할 항목이 아직 많이 남았어요.';
      text.textContent = `${pct}% 완료 — ${label}`;
    }

    ul.innerHTML = '';
    CHECKS.forEach((c, i) => {
      const li = el('li', { cls: 'check-item' });
      li.innerHTML = `<div class="check-box">✓</div><div>${c}</div>`;
      li.addEventListener('click', () => {
        if (checked.has(i)) {
          checked.delete(i);
          li.classList.remove('done');
        } else {
          checked.add(i);
          li.classList.add('done');
        }
        update();
      });
      ul.appendChild(li);
    });
    reset.addEventListener('click', () => {
      checked.clear();
      $$('.check-item', ul).forEach(n => n.classList.remove('done'));
      update();
    });
    update();
  }

  /* ============================
     자료 폴더 (파일 탐색기)
  ============================= */
  const FOLDER_NAME = '자료';

  function fileGlyph(type) {
    if (type === 'pdf') return '📕';
    if (type === 'pptx' || type === 'ppt') return '📊';
    return '📄';
  }
  function fileBadgeClass(type) {
    if (type === 'pdf') return 't-pdf';
    if (type === 'pptx' || type === 'ppt') return 't-pptx';
    return 't-other';
  }
  function fileBadgeLabel(type) {
    if (type === 'pdf') return 'PDF';
    if (type === 'pptx' || type === 'ppt') return 'PPT';
    return (type || 'FILE').toString().toUpperCase().slice(0, 4);
  }
  function fileTypeFromName(name) {
    const m = (name || '').toLowerCase().match(/\.([a-z0-9]+)$/);
    return m ? m[1] : '';
  }

  /* ============================
     자료 폴더 (SharePoint 폴더 임베드)
  ============================= */
  function initExplorer(root) {
    const cfg = window.MATERIAL_CONFIG || {};
    const url = cfg.sharepointUrl;

    const iframe = root.querySelector('.sp-frame');
    const loadingEl = root.querySelector('.sp-loading');
    const fallbackEl = root.querySelector('.sp-fallback');
    const openLinks = root.querySelectorAll('.sp-open-link, .sp-fb-btn');

    if (!url) {
      // URL 미설정 시 폴백 노출 + 안내
      iframe.style.display = 'none';
      if (loadingEl) loadingEl.classList.add('hidden');
      const fbTitle = root.querySelector('.sp-fb-title');
      const fbMsg = root.querySelector('.sp-fb-msg');
      if (fbTitle) fbTitle.textContent = 'SharePoint 링크가 설정되지 않았어요';
      if (fbMsg) fbMsg.innerHTML = '<code>자료/files.js</code>의 <code>sharepointUrl</code> 값을 확인해주세요.';
      const fbBtn = root.querySelector('.sp-fb-btn');
      if (fbBtn) fbBtn.style.display = 'none';
      if (fallbackEl) fallbackEl.classList.add('show');
      return;
    }

    // 새 창 열기 버튼들에 URL 연결
    openLinks.forEach(a => { a.href = url; });

    // iframe 로드 시도
    iframe.src = url;

    // 로드 완료 → 로딩 숨김
    let loaded = false;
    iframe.addEventListener('load', () => {
      loaded = true;
      if (loadingEl) loadingEl.classList.add('hidden');
    }, { once: true });

    // 너무 오래 로딩 → 폴백 노출 (iframe도 그대로 두되, 폴백 카드도 함께 보여줌)
    // SharePoint가 X-Frame-Options로 차단하는 경우엔 load 이벤트가 즉시 발생하지만
    // 화면이 비어 보일 수 있으므로 6초 후에 폴백 안내도 함께 표시
    setTimeout(() => {
      if (loadingEl) loadingEl.classList.add('hidden');
      if (!loaded && fallbackEl) {
        fallbackEl.classList.add('show');
      }
    }, 6000);

    // 사용자가 명시적으로 "새 창에서 열기"를 누른 경우 폴백은 굳이 띄울 필요 없음
  }

  // (사용하지 않음 - 이전 GitHub API 기반 자료 탐색기. 참고용으로 유지)
  async function fetchGithubTree() {
    const cfg = window.MATERIAL_CONFIG || {};
    if (!cfg.autoList || !cfg.owner || !cfg.repo) return null;

    const branch = cfg.branch || 'main';
    const folder = cfg.folder || FOLDER_NAME;
    const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`;

    const res = await fetch(url, { headers: { 'Accept': 'application/vnd.github.v3+json' } });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const data = await res.json();
    if (!data || !Array.isArray(data.tree)) return null;

    const prefix = folder + '/';
    return data.tree
      .filter(it => it.path && it.path.startsWith(prefix))
      .filter(it => {
        const name = it.path.split('/').pop();
        return name && !name.startsWith('.') && name !== 'files.js' && name !== 'README.md';
      })
      .map(it => ({
        path: it.path,                 // 저장소 루트 기준 전체 경로 (예: "자료/학생 안내용 자료/...")
        name: it.path.split('/').pop(),
        type: it.type,                 // 'tree' (폴더) | 'blob' (파일)
        size: it.size,
        isFolder: it.type === 'tree',
        fileType: it.type === 'blob' ? fileTypeFromName(it.path.split('/').pop()) : null,
      }));
  }

  // (사용하지 않음 - 이전 GitHub API 기반 파일 탐색기. SharePoint 모드로 대체됨.)
  // 함수 이름을 바꿔 호이스팅 충돌만 회피한 채 참고용으로 보존합니다.
  function _initGithubExplorer_unused(root) {
    const filesHost = root.querySelector('.exp-files');
    const countEl = root.querySelector('.exp-count');
    const hintEl = root.querySelector('.exp-hint');
    const addressPath = root.querySelector('.exp-address-path');
    const refreshBtn = root.querySelector('[data-x-action="refresh"]');
    const backBtn = root.querySelector('[data-x-action="back"]');
    const fwdBtn = root.querySelector('[data-x-action="fwd"]');
    const upBtn = root.querySelector('[data-x-action="up"]');

    const baseFolder = (window.MATERIAL_CONFIG && window.MATERIAL_CONFIG.folder) || FOLDER_NAME;

    let tree = [];                  // GitHub에서 받은 전체 트리
    let currentPath = [];           // 자료 폴더 기준 현재 경로 (예: ['학생 안내용 자료', '성교육 관련(15)'])
    let history = [[]];             // 방문 이력
    let historyIndex = 0;
    let descMap = {};               // files.js 설명 매핑

    function getFullPath() {
      return [baseFolder, ...currentPath].join('/');
    }

    function getCurrentItems() {
      const prefix = getFullPath() + '/';
      return tree.filter(item => {
        if (!item.path.startsWith(prefix)) return false;
        const rest = item.path.slice(prefix.length);
        return rest && !rest.includes('/');   // 한 단계 더 깊은 항목만
      });
    }

    function updateNavButtons() {
      backBtn.disabled = historyIndex <= 0;
      fwdBtn.disabled = historyIndex >= history.length - 1;
      upBtn.disabled = currentPath.length === 0;
    }

    function updateAddress() {
      const parts = ['자료 폴더', ...currentPath];
      addressPath.innerHTML = parts.map((p, i) => {
        if (i === parts.length - 1) {
          return `<span class="addr-current">${p}</span>`;
        }
        return `<span class="addr-crumb" data-idx="${i}">${p}</span>`;
      }).join('<span class="addr-sep">›</span>');
      addressPath.querySelectorAll('.addr-crumb').forEach(c => {
        c.addEventListener('click', () => {
          const idx = parseInt(c.dataset.idx, 10);
          // idx 0은 '자료 폴더' (=루트), idx N은 currentPath[N-1] 단계
          navigate(currentPath.slice(0, idx));
        });
      });
    }

    function navigate(newPath, pushHistory = true) {
      currentPath = newPath.slice();
      if (pushHistory) {
        history = history.slice(0, historyIndex + 1);
        history.push(newPath.slice());
        historyIndex = history.length - 1;
      }
      updateAddress();
      updateNavButtons();
      renderCurrent();
    }

    function renderLoading() {
      filesHost.innerHTML = `
        <div class="exp-empty">
          <div class="ee-ic">⏳</div>
          <div class="ee-msg">자료 폴더를 불러오는 중...</div>
        </div>
      `;
      countEl.textContent = '...';
    }

    function renderEmpty() {
      filesHost.innerHTML = '';
      const empty = el('div', { cls: 'exp-empty' });
      empty.innerHTML = `
        <div class="ee-ic">📂</div>
        <div class="ee-msg">${currentPath.length > 0 ? '이 폴더는 비어 있어요.' : '자료 폴더에 아직 자료가 없어요.'}</div>
        ${currentPath.length === 0 ? '<div class="ee-hint">GitHub 저장소의 <code>자료</code> 폴더에 PDF · PPT 파일을 업로드하면 자동으로 표시됩니다.</div>' : ''}
      `;
      filesHost.appendChild(empty);
      countEl.textContent = '0개 항목';
    }

    function renderError(msg) {
      filesHost.innerHTML = '';
      const empty = el('div', { cls: 'exp-empty' });
      empty.innerHTML = `
        <div class="ee-ic">⚠️</div>
        <div class="ee-msg">${msg}</div>
        <div class="ee-hint">사이트가 GitHub Pages로 배포되어 있는지, 저장소가 공개(public)인지 확인해주세요.<br/><code>자료/files.js</code>의 <code>MATERIAL_CONFIG</code>도 확인해보세요.</div>
      `;
      filesHost.appendChild(empty);
      countEl.textContent = '오류';
    }

    function renderCurrent() {
      const items = getCurrentItems();
      // 폴더 먼저, 파일 나중에. 같은 종류는 가나다순.
      items.sort((a, b) => {
        if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
        return a.name.localeCompare(b.name, 'ko');
      });

      if (items.length === 0) {
        renderEmpty();
        return;
      }

      filesHost.innerHTML = '';
      items.forEach(item => {
        if (item.isFolder) renderFolder(item);
        else renderFile(item);
      });

      const folderCount = items.filter(i => i.isFolder).length;
      const fileCount = items.length - folderCount;
      countEl.textContent = (folderCount > 0 && fileCount > 0)
        ? `${items.length}개 항목 (폴더 ${folderCount}, 파일 ${fileCount})`
        : `${items.length}개 항목`;
    }

    function renderFolder(item) {
      const node = el('div', { cls: 'exp-file exp-folder', attrs: { tabindex: '0' } });
      node.innerHTML = `
        <div class="exp-folder-thumb">
          <div class="exp-folder-glyph">📁</div>
        </div>
        <div class="exp-file-name">${item.name}</div>
      `;
      let lastClick = 0;
      const enter = () => navigate([...currentPath, item.name]);
      node.addEventListener('click', () => {
        $$('.exp-file', filesHost).forEach(n => n.classList.remove('selected'));
        node.classList.add('selected');
        const now = Date.now();
        if (now - lastClick < 380) enter();
        lastClick = now;
      });
      node.addEventListener('dblclick', enter);
      node.addEventListener('keydown', (e) => { if (e.key === 'Enter') enter(); });
      filesHost.appendChild(node);
    }

    function renderFile(item) {
      const type = (item.fileType || fileTypeFromName(item.name)).toLowerCase();
      // 설명 매핑: 전체 경로 또는 파일명으로 찾기
      const extra = descMap[item.path] || descMap[item.name] || {};
      const display = extra.displayName || item.name;
      const fileObj = {
        name: item.name,
        path: item.path,
        type,
        displayName: extra.displayName,
        description: extra.description,
      };

      const node = el('div', { cls: 'exp-file', attrs: { tabindex: '0' } });
      node.innerHTML = `
        <div class="exp-file-thumb ${fileBadgeClass(type)}">
          <div class="exp-file-thumb-glyph">${fileGlyph(type)}</div>
          <div class="exp-file-thumb-badge">${fileBadgeLabel(type)}</div>
        </div>
        <div class="exp-file-name">${display}</div>
        ${extra.description ? `<div class="exp-file-desc">${extra.description}</div>` : ''}
      `;
      let lastClick = 0;
      const open = () => openFileViewer(fileObj);
      node.addEventListener('click', () => {
        $$('.exp-file', filesHost).forEach(n => n.classList.remove('selected'));
        node.classList.add('selected');
        const now = Date.now();
        if (now - lastClick < 380) open();
        lastClick = now;
      });
      node.addEventListener('dblclick', open);
      node.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); });
      filesHost.appendChild(node);
    }

    async function load() {
      renderLoading();
      try {
        tree = await fetchGithubTree();
        if (!tree) {
          renderError('자료 폴더를 가져올 수 없어요');
          return;
        }
      } catch (e) {
        renderError(`자료 폴더를 불러오지 못했어요 (${e.message})`);
        return;
      }
      // 설명 매핑 갱신
      descMap = {};
      (window.MATERIAL_FILES || []).forEach(f => {
        if (!f || !f.name) return;
        descMap[f.name] = f;
        if (f.path) descMap[f.path] = f;
      });
      if (hintEl) {
        hintEl.textContent = '폴더를 더블클릭해 안으로 들어가고, ▲ 버튼이나 경로를 눌러 위로 갈 수 있어요.';
      }
      // 처음 위치로
      currentPath = [];
      history = [[]];
      historyIndex = 0;
      updateAddress();
      updateNavButtons();
      renderCurrent();
    }

    backBtn.addEventListener('click', () => {
      if (historyIndex > 0) {
        historyIndex--;
        navigate(history[historyIndex], false);
      }
    });
    fwdBtn.addEventListener('click', () => {
      if (historyIndex < history.length - 1) {
        historyIndex++;
        navigate(history[historyIndex], false);
      }
    });
    upBtn.addEventListener('click', () => {
      if (currentPath.length > 0) navigate(currentPath.slice(0, -1));
    });
    refreshBtn.addEventListener('click', () => { load(); });

    load();
  }

  /* ============================
     파일 뷰어 (PDF / PPTX)
  ============================= */
  function slugify(s) {
    return (s || '').replace(/[^\w가-힣.\-]/g, '_').slice(0, 100);
  }

  // 경로의 각 세그먼트만 인코딩 (슬래시는 유지)
  function encodePath(path) {
    return (path || '').split('/').map(encodeURIComponent).join('/');
  }

  // file 객체에서 저장소 루트 기준 경로를 얻음
  // file.path가 있으면 그걸 사용, 없으면 "자료/파일명"으로 가정
  function fileRepoPath(file) {
    if (file.path) return file.path;
    return `${FOLDER_NAME}/${file.name}`;
  }

  function fileRelPath(file) {
    return encodePath(fileRepoPath(file));
  }

  function fileURL(file) {
    const pathBase = window.location.pathname.replace(/\/[^/]*$/, '/');
    return `${window.location.origin}${pathBase}${fileRelPath(file)}`;
  }

  function isHttp() {
    return window.location.protocol === 'http:' || window.location.protocol === 'https:';
  }

  function openFileViewer(file) {
    const id = `viewer-${slugify(file.path || file.name)}`;
    const display = file.displayName || file.name;
    const type = (file.type || fileTypeFromName(file.name)).toLowerCase();
    const icon = fileGlyph(type);
    const rel = fileRelPath(file);

    openApp(id, {
      meta: {
        id,
        title: display,
        icon,
        size: { w: 960, h: 660 },
      },
      template: 'viewer',
      populate: (body) => {
        const tpl = $('#tpl-viewer');
        body.appendChild(tpl.content.cloneNode(true));
        const iconEl = body.querySelector('.viewer-icon');
        const nameEl = body.querySelector('.viewer-name');
        const dlEl   = body.querySelector('.viewer-dl');
        const host   = body.querySelector('.viewer-host');

        iconEl.textContent = icon;
        nameEl.textContent = display;
        dlEl.href = rel;
        dlEl.setAttribute('download', file.name);

        if (type === 'pdf') {
          const iframe = el('iframe', {
            attrs: {
              src: rel + '#toolbar=1&navpanes=0',
              title: display,
            }
          });
          host.appendChild(iframe);
        } else if (type === 'pptx' || type === 'ppt') {
          if (isHttp()) {
            const url = encodeURIComponent(fileURL(file));
            const iframe = el('iframe', {
              attrs: {
                src: `https://view.officeapps.live.com/op/embed.aspx?src=${url}`,
                title: display,
              }
            });
            host.appendChild(iframe);
          } else {
            const fb = el('div', { cls: 'viewer-fallback' });
            fb.innerHTML = `
              <div class="vf-ic">📊</div>
              <div class="vf-title">PPT 미리보기는 GitHub Pages 배포 후에 사용할 수 있어요</div>
              <div class="vf-msg">
                Microsoft Office Online 뷰어를 사용하려면 사이트가<br/>
                <code>https://</code> 환경에 배포되어 있어야 합니다.<br/>
                지금은 파일을 다운로드해서 열어보세요.
              </div>
              <a href="${rel}" download="${file.name}">파일 다운로드</a>
            `;
            host.appendChild(fb);
          }
        } else if (type === 'doc' || type === 'docx' || type === 'xls' || type === 'xlsx') {
          // Office 문서도 Office Online viewer로 열기
          if (isHttp()) {
            const url = encodeURIComponent(fileURL(file));
            const iframe = el('iframe', {
              attrs: {
                src: `https://view.officeapps.live.com/op/embed.aspx?src=${url}`,
                title: display,
              }
            });
            host.appendChild(iframe);
          } else {
            const fb = el('div', { cls: 'viewer-fallback' });
            fb.innerHTML = `
              <div class="vf-ic">📄</div>
              <div class="vf-title">Office 문서 미리보기는 GitHub Pages 배포 후에 사용할 수 있어요</div>
              <div class="vf-msg">지금은 파일을 다운로드해서 열어보세요.</div>
              <a href="${rel}" download="${file.name}">파일 다운로드</a>
            `;
            host.appendChild(fb);
          }
        } else if (['jpg','jpeg','png','gif','webp','bmp'].includes(type)) {
          const img = el('img', {
            attrs: { src: rel, alt: display, style: 'max-width:100%; max-height:100%; margin:auto; display:block;' }
          });
          host.style.display = 'flex';
          host.style.alignItems = 'center';
          host.style.justifyContent = 'center';
          host.appendChild(img);
        } else {
          const fb = el('div', { cls: 'viewer-fallback' });
          fb.innerHTML = `
            <div class="vf-ic">📄</div>
            <div class="vf-title">이 형식은 미리보기를 지원하지 않아요</div>
            <div class="vf-msg">파일을 다운로드해서 열어보세요.</div>
            <a href="${rel}" download="${file.name}">파일 다운로드</a>
          `;
          host.appendChild(fb);
        }
      }
    });
  }

  /* ============================
     정보안전 챌린지 (마리오 풍 게임)
  ============================= */
  // 게임 안에서 사용할 문제 풀. QUIZ 배열을 그대로 재사용.
  const GAME_QUESTIONS = QUIZ;
  const BEST_KEY = 'safetyGameBest_v1';

  function initGame(root) {
    const canvas = root.querySelector('.game-canvas');
    const ctx = canvas.getContext('2d');
    const livesEl = root.querySelector('.hud-lives');
    const scoreEl = root.querySelector('.hud-score');
    const coinsEl = root.querySelector('.hud-coins');
    const bestEl  = root.querySelector('.hud-best');
    const restartBtn = root.querySelector('.hud-restart');
    const overlay = root.querySelector('.game-overlay');

    const TILE = 32;
    const GRAVITY = 0.55;
    const JUMP_V = -10.5;
    const MOVE_SPEED = 3.4;
    const FRICTION = 0.82;
    const MAX_FALL = 12;

    // 레벨 정의: tile 좌표 기준
    // 바닥(11), 점프 발판 몇 개, ?블록 3개, 코인, 적, 깃발
    const baseLevel = {
      width: 80,
      height: 12,
      playerStart: { x: 2, y: 9 },
      platforms: [
        { x: 0,  y: 11, w: 18, h: 1 },
        { x: 20, y: 11, w: 12, h: 1 },  // (사이에 구덩이)
        { x: 34, y: 11, w: 16, h: 1 },
        { x: 52, y: 11, w: 26, h: 1 },  // 마지막 구간
        { x: 6,  y: 8,  w: 3,  h: 1 },
        { x: 13, y: 6,  w: 3,  h: 1 },
        { x: 22, y: 8,  w: 3,  h: 1 },
        { x: 28, y: 6,  w: 3,  h: 1 },
        { x: 38, y: 8,  w: 2,  h: 1 },
        { x: 44, y: 6,  w: 3,  h: 1 },
        { x: 56, y: 8,  w: 3,  h: 1 },
        { x: 62, y: 6,  w: 4,  h: 1 },
        { x: 70, y: 8,  w: 3,  h: 1 },
      ],
      blocks: [
        { x: 7,  y: 6 },
        { x: 23, y: 6 },
        { x: 45, y: 4 },
        { x: 63, y: 4 },
      ],
      coins: [
        { x: 4, y: 10 }, { x: 5, y: 10 },
        { x: 7, y: 7 }, { x: 14, y: 5 }, { x: 15, y: 5 },
        { x: 22, y: 7 }, { x: 24, y: 7 },
        { x: 29, y: 5 }, { x: 30, y: 5 },
        { x: 38, y: 7 }, { x: 39, y: 7 },
        { x: 45, y: 5 }, { x: 56, y: 7 }, { x: 57, y: 7 }, { x: 58, y: 7 },
        { x: 63, y: 5 }, { x: 64, y: 5 }, { x: 65, y: 5 },
        { x: 70, y: 7 }, { x: 71, y: 7 },
      ],
      enemies: [
        { range: [10, 17], y: 10, vx: -0.8 },
        { range: [25, 31], y: 10, vx: -0.9 },
        { range: [40, 49], y: 10, vx: -1.0 },
        { range: [58, 65], y: 10, vx: -0.9 },
        { range: [70, 76], y: 10, vx: -1.1 },
      ],
      goal: { x: 77, y: 10 },
    };

    // 동적 게임 상태
    let level = JSON.parse(JSON.stringify(baseLevel));
    const player = {
      x: 0, y: 0, vx: 0, vy: 0,
      w: 22, h: 28,
      onGround: false, facing: 1,
      lives: 3, invuln: 0,
    };
    const camera = { x: 0 };
    const keys = { left: false, right: false, jump: false };
    let phase = 'playing';   // 'playing' | 'question' | 'won' | 'lost'
    let score = 0;
    let coinCount = 0;
    let bestScore = parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0;
    let tickCount = 0;
    let askedBlocks = new Set();

    function resetLevel() {
      level = JSON.parse(JSON.stringify(baseLevel));
      // 적 초기 위치
      level.enemies.forEach(e => {
        e.x = e.range[0] * TILE;
      });
      // 코인/블록 상태
      level.coins.forEach(c => c.taken = false);
      level.blocks.forEach(b => b.broken = false);

      player.x = level.playerStart.x * TILE;
      player.y = level.playerStart.y * TILE;
      player.vx = 0; player.vy = 0;
      player.lives = 3;
      player.invuln = 60;
      player.facing = 1;
      camera.x = 0;
      score = 0;
      coinCount = 0;
      phase = 'playing';
      askedBlocks = new Set();
      overlay.classList.remove('show');
      overlay.innerHTML = '';
      updateHUD();
    }

    function updateHUD() {
      livesEl.textContent = '❤️'.repeat(Math.max(0, player.lives)) || '💀';
      scoreEl.textContent = `점수: ${score}`;
      coinsEl.textContent = `🪙 ${coinCount}`;
      bestEl.textContent = `최고: ${bestScore}`;
    }

    function rectOverlap(a, b) {
      return a.x < b.x + b.w && a.x + a.w > b.x &&
             a.y < b.y + b.h && a.y + a.h > b.y;
    }

    function tileRect(t) {
      return { x: t.x * TILE, y: t.y * TILE, w: (t.w || 1) * TILE, h: (t.h || 1) * TILE };
    }

    function getSolidRects() {
      const rects = level.platforms.map(tileRect);
      level.blocks.forEach(b => {
        if (!b.broken) rects.push({ x: b.x * TILE, y: b.y * TILE, w: TILE, h: TILE, _block: b });
      });
      return rects;
    }

    function update() {
      if (phase !== 'playing') return;
      tickCount++;

      // 입력 → 속도
      if (keys.left)       { player.vx = -MOVE_SPEED; player.facing = -1; }
      else if (keys.right) { player.vx =  MOVE_SPEED; player.facing =  1; }
      else { player.vx *= FRICTION; if (Math.abs(player.vx) < 0.05) player.vx = 0; }

      if (keys.jump && player.onGround) {
        player.vy = JUMP_V;
        player.onGround = false;
      }

      player.vy += GRAVITY;
      if (player.vy > MAX_FALL) player.vy = MAX_FALL;

      const solids = getSolidRects();

      // X축 이동 + 충돌
      player.x += player.vx;
      for (const t of solids) {
        if (rectOverlap(player, t)) {
          if (player.vx > 0) player.x = t.x - player.w;
          else if (player.vx < 0) player.x = t.x + t.w;
          player.vx = 0;
        }
      }
      if (player.x < 0) player.x = 0;

      // Y축 이동 + 충돌
      player.y += player.vy;
      player.onGround = false;
      for (const t of solids) {
        if (rectOverlap(player, t)) {
          if (player.vy > 0) {
            player.y = t.y - player.h;
            player.vy = 0;
            player.onGround = true;
          } else if (player.vy < 0) {
            player.y = t.y + t.h;
            player.vy = 0;
            // 머리로 ?블록 치면 문제 발생
            if (t._block && !askedBlocks.has(t._block)) {
              askedBlocks.add(t._block);
              triggerQuestion(t._block);
            }
          }
        }
      }

      // 낙사
      if (player.y > level.height * TILE + 120) {
        damagePlayer(true);
      }

      // 코인 충돌
      for (const c of level.coins) {
        if (c.taken) continue;
        const cr = { x: c.x * TILE + 8, y: c.y * TILE + 8, w: 16, h: 16 };
        if (rectOverlap(player, cr)) {
          c.taken = true;
          coinCount++;
          score += 30;
        }
      }

      // 적 이동 + 충돌
      for (const e of level.enemies) {
        if (e.dead) continue;
        e.x += e.vx;
        const minX = e.range[0] * TILE;
        const maxX = e.range[1] * TILE;
        if (e.x < minX) { e.x = minX; e.vx = Math.abs(e.vx); }
        if (e.x > maxX) { e.x = maxX; e.vx = -Math.abs(e.vx); }

        const er = { x: e.x + 4, y: e.y * TILE + 4, w: TILE - 8, h: TILE - 8 };
        if (rectOverlap(player, er)) {
          // 위에서 밟았는가?
          if (player.vy > 1 && (player.y + player.h - 12) < er.y) {
            e.dead = true;
            player.vy = JUMP_V * 0.6;
            score += 80;
          } else {
            damagePlayer(false);
          }
        }
      }

      if (player.invuln > 0) player.invuln--;

      // 깃발 도달
      const goalRect = { x: level.goal.x * TILE, y: (level.goal.y - 3) * TILE, w: TILE, h: TILE * 4 };
      if (rectOverlap(player, goalRect)) {
        gameWon();
      }

      // 카메라
      const target = player.x - canvas.width / 2 + player.w / 2;
      camera.x = Math.max(0, Math.min(level.width * TILE - canvas.width, target));

      updateHUD();
    }

    function damagePlayer(falling) {
      if (player.invuln > 0 && !falling) return;
      player.lives--;
      score = Math.max(0, score - 50);
      if (player.lives <= 0) { gameLost(); return; }
      player.x = level.playerStart.x * TILE;
      player.y = level.playerStart.y * TILE;
      player.vx = 0; player.vy = 0;
      player.invuln = 90;
      camera.x = 0;
    }

    function triggerQuestion(block) {
      phase = 'question';
      const q = GAME_QUESTIONS[Math.floor(Math.random() * GAME_QUESTIONS.length)];
      overlay.classList.add('show');
      const card = el('div', { cls: 'q-card' });
      card.innerHTML = `
        <div class="q-tag">? 블록 문제</div>
        <div class="q-text">${q.q}</div>
        <div class="q-opts">
          ${q.opts.map((opt, i) =>
            `<button class="q-opt" data-i="${i}">${'①②③④'[i]} ${opt}</button>`
          ).join('')}
        </div>
      `;
      overlay.innerHTML = '';
      overlay.appendChild(card);
      card.querySelectorAll('.q-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.i, 10);
          const correct = idx === q.a;
          block.broken = true;
          if (correct) {
            score += 200;
            // 보너스 코인 발사 효과 (간단히 점수만)
          } else {
            score = Math.max(0, score - 30);
          }
          // 결과 카드
          const res = el('div', { cls: `q-result ${correct ? 'q-correct' : 'q-wrong'}` });
          res.innerHTML = `
            <div class="q-result-head">${correct ? '✅ 정답! +200점' : '❌ 아쉬워요 (-30점)'}</div>
            <div class="q-ex">${q.ex}</div>
          `;
          overlay.innerHTML = '';
          overlay.appendChild(res);
          setTimeout(() => {
            overlay.classList.remove('show');
            overlay.innerHTML = '';
            phase = 'playing';
          }, 2400);
        });
      });
    }

    function commitBest() {
      if (score > bestScore) {
        bestScore = score;
        try { localStorage.setItem(BEST_KEY, String(bestScore)); } catch (e) {}
        return true;
      }
      return false;
    }

    function gameWon() {
      phase = 'won';
      const newBest = commitBest();
      showEndScreen({
        emoji: '🏆',
        title: '정보안전 챌린지 클리어!',
        score, bestScore, newBest,
      });
    }

    function gameLost() {
      phase = 'lost';
      const newBest = commitBest();
      showEndScreen({
        emoji: '💔',
        title: '게임 오버',
        score, bestScore, newBest,
      });
    }

    function showEndScreen({ emoji, title, score, bestScore, newBest }) {
      overlay.classList.add('show');
      const card = el('div', { cls: 'end-card' });
      card.innerHTML = `
        <div class="end-emoji">${emoji}</div>
        <div class="end-title">${title}</div>
        ${newBest ? '<div class="end-newbest">🌟 새 최고 점수!</div>' : ''}
        <div class="end-score">${score}점</div>
        <div class="end-best">개인 최고 점수: ${bestScore}점</div>
        <button class="end-btn">다시 도전하기</button>
      `;
      overlay.innerHTML = '';
      overlay.appendChild(card);
      card.querySelector('.end-btn').addEventListener('click', () => resetLevel());

      // 옵션: 저장소의 top-scores.json이 있으면 상위 점수 표시
      tryShowTopScores(card);
    }

    async function tryShowTopScores(host) {
      const cfg = window.MATERIAL_CONFIG || {};
      if (!cfg.owner || !cfg.repo) return;
      try {
        const url = `https://raw.githubusercontent.com/${cfg.owner}/${cfg.repo}/${cfg.branch || 'main'}/top-scores.json?ts=${Date.now()}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.scores || []);
        if (list.length === 0) return;
        const top = list.slice(0, 5);
        const div = el('div', { cls: 'end-top' });
        div.innerHTML = `
          <div class="top-title">🥇 우리 학교 최고 점수</div>
          <ol>${top.map(s => `<li>${s.name || '익명'} — ${s.score}점</li>`).join('')}</ol>
        `;
        host.appendChild(div);
      } catch (_) {}
    }

    /* ----- 렌더링 ----- */
    function drawCloud(x, y) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.arc(x + 16, y - 6, 18, 0, Math.PI * 2);
      ctx.arc(x + 34, y, 14, 0, Math.PI * 2);
      ctx.fill();
    }

    function render() {
      // 하늘 그라데이션
      const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
      sky.addColorStop(0, '#5BAEF0');
      sky.addColorStop(1, '#9CD0F0');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 구름 (간단한 패럴랙스)
      for (let i = 0; i < 6; i++) {
        const cx = ((i * 220) - camera.x * 0.25) % (canvas.width + 240) - 60;
        const cy = 40 + (i % 3) * 22;
        drawCloud(cx, cy);
      }

      ctx.save();
      ctx.translate(-camera.x, 0);

      // 배경 언덕
      ctx.fillStyle = '#86C76E';
      for (let i = 0; i < level.width / 4; i++) {
        ctx.beginPath();
        ctx.arc(i * 160 + 80, level.height * TILE, 80, Math.PI, 0);
        ctx.fill();
      }

      // 플랫폼
      for (const t of level.platforms) {
        const r = tileRect(t);
        ctx.fillStyle = '#71C266';
        ctx.fillRect(r.x, r.y, r.w, 8);
        ctx.fillStyle = '#9C6B2F';
        ctx.fillRect(r.x, r.y + 8, r.w, r.h - 8);
        // 격자
        ctx.strokeStyle = 'rgba(0,0,0,.1)';
        ctx.lineWidth = 1;
        for (let x = r.x; x < r.x + r.w; x += TILE) {
          ctx.beginPath(); ctx.moveTo(x, r.y); ctx.lineTo(x, r.y + r.h); ctx.stroke();
        }
      }

      // ? 블록
      for (const b of level.blocks) {
        const bx = b.x * TILE, by = b.y * TILE;
        if (b.broken) {
          ctx.fillStyle = '#8B6427';
          ctx.fillRect(bx, by, TILE, TILE);
        } else {
          // 깜빡이는 골드 블록
          const pulse = 0.85 + 0.15 * Math.sin(tickCount * 0.1);
          ctx.fillStyle = `rgba(244, 194, 76, ${pulse})`;
          ctx.fillRect(bx, by, TILE, TILE);
          ctx.fillStyle = '#B58020';
          ctx.fillRect(bx, by, TILE, 3);
          ctx.fillRect(bx, by + TILE - 3, TILE, 3);
          ctx.fillRect(bx, by, 3, TILE);
          ctx.fillRect(bx + TILE - 3, by, 3, TILE);
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 20px Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('?', bx + TILE / 2, by + TILE / 2 + 1);
        }
      }

      // 코인
      for (const c of level.coins) {
        if (c.taken) continue;
        const cx = c.x * TILE + TILE / 2;
        const cy = c.y * TILE + TILE / 2 + Math.sin((tickCount + c.x * 5) * 0.08) * 2;
        ctx.fillStyle = '#F4C24C';
        ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#B58020'; ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('₩', cx, cy + 1);
      }

      // 적
      for (const e of level.enemies) {
        if (e.dead) continue;
        const ex = e.x, ey = e.y * TILE;
        // 몸통
        ctx.fillStyle = '#A33545';
        ctx.fillRect(ex + 4, ey + 8, TILE - 8, TILE - 12);
        // 머리 (둥글게)
        ctx.beginPath();
        ctx.arc(ex + TILE / 2, ey + 12, TILE / 2 - 4, 0, Math.PI * 2);
        ctx.fill();
        // 발
        ctx.fillStyle = '#5a1622';
        ctx.fillRect(ex + 4, ey + TILE - 6, 8, 4);
        ctx.fillRect(ex + TILE - 12, ey + TILE - 6, 8, 4);
        // 눈
        ctx.fillStyle = '#fff';
        ctx.fillRect(ex + 9, ey + 8, 5, 5);
        ctx.fillRect(ex + 18, ey + 8, 5, 5);
        ctx.fillStyle = '#000';
        ctx.fillRect(ex + 11, ey + 10, 2, 2);
        ctx.fillRect(ex + 20, ey + 10, 2, 2);
      }

      // 깃발
      const gx = level.goal.x * TILE;
      const gy = level.goal.y * TILE;
      ctx.fillStyle = '#5a4632';
      ctx.fillRect(gx + TILE / 2 - 2, gy - TILE * 3, 4, TILE * 3);
      ctx.fillStyle = '#E81123';
      ctx.beginPath();
      ctx.moveTo(gx + TILE / 2 + 2, gy - TILE * 3);
      ctx.lineTo(gx + TILE * 1.2, gy - TILE * 3 + 12);
      ctx.lineTo(gx + TILE / 2 + 2, gy - TILE * 3 + 24);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#FFD400';
      ctx.beginPath();
      ctx.arc(gx + TILE / 2, gy - TILE * 3, 4, 0, Math.PI * 2);
      ctx.fill();

      // 플레이어 (마리오 풍 픽셀 캐릭터)
      if (player.invuln <= 0 || Math.floor(tickCount / 4) % 2 === 0) {
        const px = Math.round(player.x), py = Math.round(player.y);
        // 모자
        ctx.fillStyle = '#E81123';
        ctx.fillRect(px + 2, py - 2, player.w - 4, 6);
        ctx.fillRect(px, py + 2, player.w, 4);
        // 얼굴
        ctx.fillStyle = '#FFCFA8';
        ctx.fillRect(px + 4, py + 4, player.w - 8, 9);
        // 눈
        ctx.fillStyle = '#000';
        if (player.facing === 1) {
          ctx.fillRect(px + player.w - 9, py + 7, 2, 3);
        } else {
          ctx.fillRect(px + 7, py + 7, 2, 3);
        }
        // 콧수염
        ctx.fillStyle = '#3b1e10';
        ctx.fillRect(px + 5, py + 10, player.w - 10, 2);
        // 셔츠
        ctx.fillStyle = '#E81123';
        ctx.fillRect(px + 2, py + 13, player.w - 4, 5);
        // 멜빵바지
        ctx.fillStyle = '#2A5BC8';
        ctx.fillRect(px + 2, py + 18, player.w - 4, player.h - 22);
        ctx.fillStyle = '#FFD400';
        ctx.fillRect(px + 6, py + 19, 2, 2);
        ctx.fillRect(px + player.w - 8, py + 19, 2, 2);
        // 신발
        ctx.fillStyle = '#3b1e10';
        ctx.fillRect(px + 1, py + player.h - 4, 8, 4);
        ctx.fillRect(px + player.w - 9, py + player.h - 4, 8, 4);
      }

      ctx.restore();
    }

    /* ----- 게임 루프 ----- */
    let running = true;
    function loop() {
      if (!document.contains(canvas)) {
        running = false;
        cleanup();
        return;
      }
      update();
      render();
      if (running) requestAnimationFrame(loop);
    }

    /* ----- 입력 ----- */
    const handler = (down) => (e) => {
      // 이 게임 창이 활성화돼 있을 때만 키 입력 처리
      const win = canvas.closest('.window');
      if (!win || !win.classList.contains('active')) return;
      if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') { keys.left  = down; e.preventDefault(); }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { keys.right = down; e.preventDefault(); }
      if (e.key === 'ArrowUp'    || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        keys.jump = down; e.preventDefault();
      }
    };
    const onKeyDown = handler(true);
    const onKeyUp = handler(false);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup',   onKeyUp);

    // 터치 컨트롤
    function bindTouchBtn(selector, prop) {
      const btn = root.querySelector(selector);
      if (!btn) return;
      const on = (e) => { e.preventDefault(); keys[prop] = true; };
      const off = (e) => { if (e) e.preventDefault(); keys[prop] = false; };
      btn.addEventListener('touchstart', on, { passive: false });
      btn.addEventListener('touchend',   off);
      btn.addEventListener('touchcancel', off);
      btn.addEventListener('mousedown',  on);
      btn.addEventListener('mouseup',    off);
      btn.addEventListener('mouseleave', off);
    }
    bindTouchBtn('.tc-left',  'left');
    bindTouchBtn('.tc-right', 'right');
    bindTouchBtn('.tc-jump',  'jump');

    restartBtn.addEventListener('click', () => resetLevel());

    function cleanup() {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    }

    /* ----- 시작 ----- */
    resetLevel();
    loop();
  }

  /* ==========================================================
     이벤트 바인딩
  ========================================================== */
  function bindGlobalEvents() {
    // 시작 버튼
    $('#start-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleStartMenu();
    });

    // 시작 메뉴 외부 클릭 → 닫기
    document.addEventListener('mousedown', (e) => {
      if (state.startOpen) {
        if (!e.target.closest('#start-menu') && !e.target.closest('#start-btn')) {
          closeStartMenu();
        }
      }
      // 데스크톱 빈 영역 클릭 → 아이콘 선택 해제
      if (e.target.id === 'desktop' || e.target.classList.contains('windows-container')) {
        $$('.desktop-icon').forEach(n => n.classList.remove('selected'));
      }
    });

    // 검색박스 클릭 → 시작 메뉴 열기 (동일 동작으로 단순화)
    $('#search-box').addEventListener('click', () => openStartMenu());

    // 시작 메뉴의 전원/설정 버튼
    $$('#start-menu .start-bottom-item').forEach(b => {
      b.addEventListener('click', () => {
        const action = b.getAttribute('data-action');
        if (action === 'shutdown') {
          if (confirm('정말 학습관에서 나가시겠습니까?')) {
            location.reload();
          }
        } else if (action === 'info') {
          closeStartMenu();
          openApp('about');
        }
      });
    });

    // ESC로 시작 메뉴 닫기 / 활성 창 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (state.startOpen) closeStartMenu();
      }
    });

    // 우클릭 메뉴 끄기 (윈도우 느낌은 유지)
    document.addEventListener('contextmenu', (e) => {
      if (e.target.closest('.window-body')) return; // 창 안쪽은 허용
      e.preventDefault();
    });
  }

  /* ==========================================================
     초기화
  ========================================================== */
  function init() {
    boot();
    buildDesktopIcons();
    buildStartMenu();
    bindGlobalEvents();
    tickClock();
    setInterval(tickClock, 30 * 1000);

    // 데스크톱에서는 안내 창을 자동 노출, 모바일은 런치패드가 이미 보이므로 생략
    if (!isMobile()) {
      setTimeout(() => openApp('about'), 2400);
    }

    // 화면 회전·리사이즈 시 열려있는 창들의 모바일/데스크톱 모드 동기화
    window.addEventListener('resize', () => {
      const mobile = isMobile();
      Object.values(state.windows).forEach(w => {
        if (mobile && !w.maximized) {
          // 모바일이 됐는데 일반 크기 창 → 강제 최대화
          w.el.classList.add('maximized');
          w.maximized = true;
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
