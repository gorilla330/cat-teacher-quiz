/**
 * アプリケーションの全体設定
 * 環境に応じた設定値を提供します
 */

// 本番環境かどうかの判定
const isProd = process.env.NODE_ENV === 'production';

// ベースURL（スラッシュで終わる形式で指定）
export const baseUrl = isProd ? '/cat-teacher-quiz/' : '/';

// アセット（画像など）のベースURL
export const assetBaseUrl = isProd ? '/cat-teacher-quiz/' : '/';

// デバッグモード
export const debug = !isProd;

export default {
  baseUrl,
  assetBaseUrl,
  debug
};
