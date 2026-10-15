/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : Middlewares Barrel Export
👑: @created : 14/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/

import passportAuth from "./passportAuth";
import authorization from "./authorization";
import uploadMiddleware from "./upload.middleware";

export { passportAuth, authorization, uploadMiddleware };

export default {
  passportAuth,
  authorization,
  uploadMiddleware,
};
