import JSEncrypt from "jsencrypt";

const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAiZtqRtAeJE6qzz2jbylF
royRhYLo+CKkEPFZZvN7b9D0bgJvUDxojtXViw6cqPaj+7OdNbHDgJMrGLXF9YlS
peQK5Q3MFXylB/Ri3rjCdWbxB0Sz7IQVMYiIYynbOqc19aJKPDfDGdasWBgK9Pqf
NESTATFyZJVXMUDv7KjC27G25iF5f3KeGahhNK09ly+uXeJohy9/r4SqdNWJzWaR
IQvBWAerC118G/Cz0e0Gja7a20K54oxUZiXv5RcPZuxmm4oASoAyCBQjmK6OHB+M
+uH6O2M8wVu3rLCHt11xbKIM2PWma+tDtuLwiWL0ae/UgRd8qgOnzlJsQZZ+P0Ep
QwIDAQAB
-----END PUBLIC KEY-----`;

export function encodeRSA(word: string) {
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(publicKey);
  const encrypted = encrypt.encrypt(word);
  if (!encrypted) {
    throw new Error("RSA 加密失败");
  }
  return encrypted;
}
