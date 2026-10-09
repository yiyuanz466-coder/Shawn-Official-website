/**
 * 受保護案例（meta.json 中 "protected": true）的密碼 SHA-256 雜湊值。目前的密碼是 shawn2026。
 * 更換密碼：node -e "console.log(require('crypto').createHash('sha256').update('新密碼').digest('hex'))"
 * 注意：這只能擋住一般瀏覽，不是真正的安全機制，機密內容不要放上網站。
 */
export const PROTECTED_PASSWORD_SHA256 = '4328710d5708c3045e234f9c23b49517ec0de2eb1a89c9aa112cb0933dcfb599'
