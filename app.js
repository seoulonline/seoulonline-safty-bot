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
    { id: 'chatbot',   title: '챗봇 도우미',     icon: '🤖', tile: { color: 'blue',     large: true  }, desktop: true,  size: { w: 720, h: 620 }, group: 'main' },
    { id: 'quiz',      title: '정보안전 퀴즈',   icon: '🛡️', tile: { color: 'darkblue', large: false }, desktop: true,  size: { w: 560, h: 540 }, group: 'main' },
    { id: 'cards',     title: '학습 카드',       icon: '📚', tile: { color: 'cyan',     large: false }, desktop: true,  size: { w: 720, h: 560 }, group: 'main' },
    { id: 'checklist', title: '안전 체크리스트', icon: '✅', tile: { color: 'green',    large: false }, desktop: true,  size: { w: 520, h: 540 }, group: 'main' },
    { id: 'resources', title: '자료실',          icon: '📁', tile: { color: 'orange',   large: false }, desktop: false, size: { w: 580, h: 520 }, group: 'tool' },
    { id: 'about',     title: '온라인학교 소개', icon: 'ℹ️', tile: { color: 'purple',   large: false }, desktop: false, size: { w: 560, h: 540 }, group: 'tool' },
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
  function openApp(id) {
    if (state.windows[id]) {
      // 이미 열림 → 활성화 + 최소화 해제
      const w = state.windows[id];
      if (w.minimized) restoreFromMinimized(id);
      activateWindow(id);
      return;
    }
    const meta = apps.find(a => a.id === id);
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
    const tpl = $(`#tpl-${id}`);
    if (tpl) body.appendChild(tpl.content.cloneNode(true));

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

    // 앱별 초기화
    initAppInstance(id, body);
  }

  function makeDraggable(winEl, handle) {
    let dragging = false;
    let startX = 0, startY = 0, origX = 0, origY = 0;
    handle.addEventListener('mousedown', (e) => {
      if (e.target.closest('.tb-btn')) return;
      const id = winEl.getAttribute('data-id');
      const w = state.windows[id];
      if (w?.maximized) return;
      dragging = true;
      startX = e.clientX; startY = e.clientY;
      origX = parseInt(winEl.style.left) || 0;
      origY = parseInt(winEl.style.top) || 0;
      document.body.style.cursor = 'move';
    });
    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const newX = origX + dx;
      const newY = Math.max(0, Math.min(window.innerHeight - 80, origY + dy));
      winEl.style.left = newX + 'px';
      winEl.style.top = newY + 'px';
    });
    document.addEventListener('mouseup', () => {
      if (dragging) {
        dragging = false;
        document.body.style.cursor = '';
        const id = winEl.getAttribute('data-id');
        const w = state.windows[id];
        if (w && !w.maximized) {
          w.restore.x = parseInt(winEl.style.left);
          w.restore.y = parseInt(winEl.style.top);
        }
      }
    });
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
    const meta = apps.find(a => a.id === id);
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
    if (id === 'resources') initResources(root);
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
     자료실
  ============================= */
  const RESOURCES = [
    { ic: '🌐', t: '한국인터넷진흥원(KISA) 보호나라', d: '개인정보 침해, 해킹·악성코드 신고와 다양한 사이버 보안 가이드를 받을 수 있는 공식 사이트입니다.' },
    { ic: '📞', t: '학교폭력 신고 117', d: '사이버 괴롭힘을 포함한 학교폭력은 24시간 117로 상담하고 신고할 수 있습니다.' },
    { ic: '🔒', t: '개인정보보호위원회', d: '내 개인정보가 어떻게 쓰이고 있는지, 어떻게 보호받을 수 있는지 알려주는 공식 기관입니다.' },
    { ic: '📚', t: '디지털배움터', d: '학생·시민 누구나 디지털 활용·안전 교육을 받을 수 있는 공공 학습 플랫폼입니다.' },
    { ic: '🛡️', t: '서울온라인학교 정보안전부', d: '교내 정보안전 관련 안내, 활동 자료, 학생 상담 등을 담당하는 우리 학교 부서입니다.' },
    { ic: '💡', t: '교실에서 만난 디지털 도구', d: 'Microsoft 365, Forms, OneNote 등 수업에서 만나는 도구들을 안전하게 활용하는 방법을 익혀봅시다.' },
  ];

  function initResources(root) {
    const list = root.querySelector('.res-list');
    list.innerHTML = '';
    RESOURCES.forEach(r => {
      const item = el('div', { cls: 'res-item' });
      item.innerHTML = `
        <div class="ri-ic">${r.ic}</div>
        <div>
          <div class="ri-title">${r.t}</div>
          <div class="ri-desc">${r.d}</div>
        </div>
      `;
      list.appendChild(item);
    });
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

    // 사용자가 처음 들어왔을 때 안내 창 살짝 안내
    setTimeout(() => {
      // 자동으로 챗봇을 열어 학생들이 바로 활용할 수 있게
      openApp('about');
    }, 2400);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
