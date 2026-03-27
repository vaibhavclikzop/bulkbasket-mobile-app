KEYSTORE_PATH="android/app/bulkbasket-release-key.keystore"
ALIAS="bulkbasket_key"
VALIDITY=10000
keytool -genkeypair \
  -v \
  -keystore "$KEYSTORE_PATH" \
  -alias "$ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity $VALIDITY
