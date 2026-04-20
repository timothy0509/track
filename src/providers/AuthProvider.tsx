import * as React from "react";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem("timotrack_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("timotrack_user");
      }
    }
  }, []);

  const login = React.useCallback(async (email: string, _password: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name: email.split("@")[0],
    };
    setUser(newUser);
    localStorage.setItem("timotrack_user", JSON.stringify(newUser));
    setLoading(false);
  }, []);

  const signup = React.useCallback(
    async (email: string, _password: string, name: string) => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 500));
      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        name,
      };
      setUser(newUser);
      localStorage.setItem("timotrack_user", JSON.stringify(newUser));
      setLoading(false);
    },
    []
  );

  const logout = React.useCallback(() => {
    setUser(null);
    localStorage.removeItem("timotrack_user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
