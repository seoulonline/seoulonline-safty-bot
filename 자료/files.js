/* ==========================================================
   자료 폴더 설정
   ----------------------------------------------------------
   학교 SharePoint는 보안 정책상 익명 API 목록 조회를 차단합니다.
   그래서 자료 폴더 앱은 "SharePoint 자료실 입구" 형태로 동작해요.

   ▶ 필수: sharepointFolderUrl
     자료 폴더 앱의 '전체 보기' 버튼이 가리킬 SharePoint 공유 폴더 URL.

   ▶ 선택: categories
     자료 분류를 카드 형태로 보여줍니다. 학생들이 어떤 자료가 있는지
     한눈에 파악하게 해줘요. shareUrl을 함께 넣으면 클릭 시 곧장
     해당 하위 폴더로 이동합니다(없으면 메인 폴더로 이동).

     하위 폴더별 공유 링크 받는 법:
       SharePoint에서 폴더 우클릭 → "공유" → "링크가 있는 모든
       사용자" 선택 → "복사"한 뒤 shareUrl에 붙여넣기

   ▶ 선택: MATERIAL_FILES (이 파일 아래쪽)
     학습관 안에서 직접 미리보기로 열고 싶은 추천 자료가 있을 때만
     등록합니다. 비워두셔도 괜찮아요.
========================================================== */

window.MATERIAL_CONFIG = {
  // 자료 폴더 전체 보기 (메인 SharePoint 공유 폴더)
  sharepointFolderUrl: 'https://sen1389-my.sharepoint.com/:f:/g/personal/hyunuk7642_seoulonline_sen_hs_kr/IgCQCy5eOXm0T5WDmg0rx3lGAZcSmVh7yVwoJbAlJfCfr8g?e=S6i0hv',

  // 주제별 자료 분류 (카테고리 카드로 표시)
  // shareUrl이 없으면 메인 폴더로 이동, 있으면 해당 하위 폴더로 직접 이동
  categories: [
    { name: '성교육',          icon: '🌱', description: '성 인식·이성 교제·감염병 예방 등' },
    { name: '사이버 폭력 예방', icon: '💬', description: '사이버 폭력 인식과 대응' },
    { name: '학교 폭력 예방',   icon: '🚸', description: '학교 폭력 예방 교육 자료' },
    { name: '학교 안전 교육',   icon: '🛡️', description: '생활·교통·재난·응급·약물 등 51개 자료' },
    { name: '사이버 어울림',    icon: '🤝', description: '디지털 시민의식 프로그램' },
    { name: '아동학대 예방',    icon: '💛', description: '아동학대 인식과 신고' },
    { name: '학생 도박 예방',   icon: '🎲', description: '도박·승부조작 예방' },
  ],

  // (선택) 게임의 우수 점수 보드용 GitHub 저장소 정보
  owner: 'seoulonline',
  repo: 'seoulonline-safty-bot',
  branch: 'main',
};

// (선택) 학습관 안에서 곧바로 미리보기로 열 추천 자료 목록
window.MATERIAL_FILES = [
  // 예시:
  // {
  //   name: "정보안전 가이드.pdf",
  //   displayName: "정보안전 기본 가이드",
  //   description: "디지털 시민으로서 알아야 할 핵심 내용",
  //   shareUrl: "https://sen1389-my.sharepoint.com/:b:/g/personal/.../xxx?e=xxx"
  // },
];
