// 仅在客户端导入 jsencrypt
let JSEncrypt: any = null;

// 动态导入 jsencrypt
export async function loadJSEncrypt() {
  if (process.client && !JSEncrypt) {
    // 使用动态导入避免服务端加载
    const module = await import('jsencrypt');
    JSEncrypt = module.default;
  }
  return JSEncrypt;
}

// RSA公钥
const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAiZtqRtAeJE6qzz2jbylF
royRhYLo+CKkEPFZZvN7b9D0bgJvUDxojtXViw6cqPaj+7OdNbHDgJMrGLXF9YlS
peQK5Q3MFXylB/Ri3rjCdWbxB0Sz7IQVMYiIYynbOqc19aJKPDfDGdasWBgK9Pqf
NESTATFyZJVXMUDv7KjC27G25iF5f3KeGahhNK09ly+uXeJohy9/r4SqdNWJzWaR
IQvBWAerC118G/Cz0e0Gja7a20K54oxUZiXv5RcPZuxmm4oASoAyCBQjmK6OHB+M
+uH6O2M8wVu3rLCHt11xbKIM2PWma+tDtuLwiWL0ae/UgRd8qgOnzlJsQZZ+P0Ep
QwIDAQAB
-----END PUBLIC KEY-----`;

/**
 * RSA加密
 * @param data 待加密数据
 * @returns 加密后的数据
 */
export async function encodeRSA(data: string): Promise<string | boolean> {
  // 仅在客户端执行
  if (process.client) {
    const JSEncryptClass = await loadJSEncrypt();
    if (JSEncryptClass) {
      // 创建JSEncrypt对象
      const encryptor = new JSEncryptClass();
      // 设置公钥
      encryptor.setPublicKey(publicKey);
      // 加密数据
      return encryptor.encrypt(data);
    }
  }
  return false;
}

/**
 * 密码加密
 * @param password 原始密码
 * @returns 加密后的密码
 */
export async function encryptPassword(password: string): Promise<string> {
  if (process.client) {
    const encrypted = await encodeRSA(password);
    return typeof encrypted === 'string' ? encrypted : '';
  }
  return '';
} 