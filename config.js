// ここだけ書き換えればOKです（手順書の STEP 3・4 を参照）
window.CONFIG = {
  // GASを「ウェブアプリ」としてデプロイしたときのURL（https://script.google.com/macros/s/.../exec）
  GAS_URL: 'https://script.google.com/macros/s/AKfycbwDIeNXJvNRof4MQXL65Vwj1e3aXAP7ufshgdLbW2lGHn2KIBXdlwmL_HTXkXHvtlYYLw/exec',
  // LINE Developers で作った LIFF ID（例：2001234567-AbCdEfGh）。空のあいだはテストモード
  LIFF_ID: '',
  STORE_NAME: 'café THE PERCH',
};
// GAS_URL が空のときは、画面の確認用にサンプルデータで動きます（保存はされません）
