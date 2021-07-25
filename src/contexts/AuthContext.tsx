import {
  useState,
  createContext,
  ReactNode,
  useContext,
  useEffect,
} from "react";
import { useHistory } from "react-router-dom";
import { auth, firebase } from "../services/firebase";
type PlayerContextProviderProps = {
  children: ReactNode;
};
type User = {
  id: string;
  name: string;
  avatar: string;
};
type AuthContextData = {
  signInWithGoogle: () => Promise<void>;
  user: User | undefined;
};
export const AuthContext = createContext({} as AuthContextData);

export function AuthContextProvider({ children }: PlayerContextProviderProps) {
  const [user, setUser] = useState<User>();
  const history = useHistory();
  async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);
    if (result.user) {
      const { displayName, photoURL, uid } = result.user;
      if (!displayName || !photoURL) {
        throw new Error("Missing Information from Google Account");
      }
      setUser({
        id: uid,
        name: displayName,
        avatar: photoURL,
      });
      history.push("/rooms/new");
    }
  }
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const { displayName, photoURL, uid } = user;
        if (!displayName || !photoURL) {
          throw new Error("Missing Information from Google Account");
        }
        setUser({
          id: uid,
          name: displayName,
          avatar: photoURL,
        });
      }
    });
    console.log("aqui");

    return () => {
      unsubscribe();
    };
  }, []);
  return (
    <AuthContext.Provider value={{ signInWithGoogle, user }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => {
  return useContext(AuthContext);
};
