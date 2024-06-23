const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
} = require("firebase/auth");
const admin = require("firebase-admin");
const auth = getAuth();

class FirebaseAuthController {
  async registerUser(req, res) {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(422).json({
        email: !email ? "Email is required" : undefined,
        password: !password ? "Password is required" : undefined,
        name: !name ? "Name is required" : undefined,
      });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(422).json({
        password:
          "Password must be at least 8 characters long and include at least one number and one uppercase letter",
      });
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await sendEmailVerification(user);

      res.status(201).json({
        message: "Verification email sent! User created successfully!",
        data: {
          name: user.displayName,
          email: user.email,
        },
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({
          error: error.message || "An error occurred while registering user",
        });
    }
  }

  async loginUser(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(422).json({
        email: "Email is required",
        password: "Password is required",
      });
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (!user.emailVerified) {
        return res.status(403).json({
          message:
            "Email not verified. Please verify your email before logging in.",
        });
      }

      const idToken = await user.getIdToken();

      if (idToken) {
        res.cookie("access_token", idToken, {
          httpOnly: true,
        });
        if (!user.displayName) {
          return res
            .status(200)
            .json({
              message:
                "User logged in successfully, please complete your profile",
              profileIncomplete: true,
              userCredential,
            });
        } else {
          return res
            .status(200)
            .json({
              message: "User logged in successfully",
              profileIncomplete: false,
              userCredential,
            });
        }
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.message || "An error occurred while logging in";
      res.status(500).json({ error: errorMessage });
    }
  }

  async completeUserProfile(req, res) {
    const { name, gender, city, age, bio } = req.body;
    if (!name) {
      return res.status(422).json({ name: "Name is required" });
    }

    const user = auth.currentUser;
    if (!user) {
      return res.status(401).json({ error: "User is not authenticated" });
    }

    const updateProfileData = { displayName: name };
    const customClaims = { gender, city, age, bio };

    try {
      await updateProfile(user, updateProfileData);
      await admin.auth().setCustomUserClaims(user.uid, customClaims);
      res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error updating profile" });
    }
  }

  async logoutUser(req, res) {
    try {
      await signOut(auth);
      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      const errorMessage =
        error.message || "An error occurred while logging out";
      res.status(500).json({ error: errorMessage });
    }
  }

  async resetPassword(req, res) {
    const { email } = req.body;
    if (!email) {
      return res.status(422).json({ email: "Email is required" });
    }

    try {
      await sendPasswordResetEmail(auth, email);
      res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
      const errorMessage =
        error.message || "An error occurred while sending password reset email";
      res.status(500).json({ error: errorMessage });
    }
  }

  async getUserProfile(req, res) {
    const user = auth.currentUser;
    if (!user) {
      return res.status(401).json({ error: "User is not authenticated" });
    }

    try {
      const customClaims = await admin.auth().getUser(user.uid).then((userRecord) => userRecord.customClaims);
      const userProfile = {
        displayName: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        customClaims,
      };
      res.status(200).json(userProfile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error fetching user profile" });
    }
  }
}

module.exports = new FirebaseAuthController();
