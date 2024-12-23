import { getAuth, signInWithPopup, FacebookAuthProvider } from "firebase/auth";

const auth = getAuth();

const facebookProvider = new FacebookAuthProvider();

export const signInWithFacebook = async () => {
    try {
        const result = await signInWithPopup(auth, facebookProvider);
        const user = result.user;

        // Access token
        const credential = FacebookAuthProvider.credentialFromResult(result);
        const accessToken = credential.accessToken;

        console.log("User Info:", user);
        console.log("Access Token:", accessToken);

        return user;
    } catch (error) {
        console.error("Facebook Sign-In Error:", error);
    }
};
