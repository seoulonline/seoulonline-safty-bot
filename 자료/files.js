/* ==========================================================
   자료 폴더 설정
   ----------------------------------------------------------
   ▶ SharePoint 모드: 자료 폴더 앱을 누르면 학교 SharePoint
                      공유 폴더가 열립니다. 자료를 SharePoint에
                      추가/삭제하시면 학생들이 바로 볼 수 있어요.

   ▶ SharePoint URL을 바꾸시려면 아래 sharepointUrl 값을
     교체하시면 됩니다. (공유 → "링크 복사"로 받은 URL)
========================================================== */

window.MATERIAL_CONFIG = {
  // ⭐️ 자료 폴더가 가리킬 SharePoint(OneDrive) 공유 폴더 링크
  sharepointUrl: 'https://sen1389-my.sharepoint.com/:f:/g/personal/hyunuk7642_seoulonline_sen_hs_kr/IgCQCy5eOXm0T5WDmg0rx3lGAZcSmVh7yVwoJbAlJfCfr8g?e=JfvLrs',

  // (선택) 게임의 우수 점수 보드를 GitHub 저장소의 top-scores.json에서 읽어오려면
  //         아래 저장소 정보를 함께 채워두세요. 자료 폴더 동작과는 무관합니다.
  owner: 'seoulonline',
  repo: 'seoulonline-safty-bot',
  branch: 'main',
};
