import jwt from "jsonwebtoken";

class AuthService {
  static COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

  constructor() {
    this.jwt_secret = process.env.JWT_SECRET;
    this.cookie_options = {
      httpOnly: true,
      maxAge: AuthService.COOKIE_MAX_AGE,
      sameSite: "lax",
      secure: false,
      path: "/",
    };

  }

  issue_token(user_id) {
    return jwt.sign({ user_id }, this.jwt_secret);
  }

  set_token_cookie(res, user_id) {
    const token = this.issue_token(user_id);
    res.cookie("token", token, this.cookie_options);
    return token;
  }

  clear_token_cookie(res) {
    res.clearCookie("token");
  }

  decode_token(token) {
    return jwt.verify(token, this.jwt_secret);
  }

  format_user_public_data(user) {
    return {
      _id: user._id,
      full_name: user.full_name,
      phone_number: user.phone_number,
      user_type: user.user_type,
      type_conversion_lock: user.type_conversion_lock,
    };
  }
}

export default new AuthService();
