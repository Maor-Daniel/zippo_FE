import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  name?: string;
  location?: string;
  maxDistance?: number;
}

interface LoginData {
  username: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFnWithoutError,
    enabled: isAuthenticated,
  });

  // Initial auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await getQueryFnWithoutError({ queryKey: ["/api/auth/user"] });
        if (result) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  async function getQueryFnWithoutError({ queryKey }: { queryKey: string[] }) {
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });
      
      if (res.status === 401) {
        return null;
      }
      
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      
      return await res.json();
    } catch (error) {
      return null;
    }
  }

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      return res.json();
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      refetch();
      toast({
        title: "Registration successful",
        description: "Your account has been created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: `${error}`,
        variant: "destructive",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const res = await apiRequest("POST", "/api/auth/login", data);
      return res.json();
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      refetch();
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: `${error}`,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/logout", {});
      return res.json();
    },
    onSuccess: () => {
      setIsAuthenticated(false);
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Logout failed",
        description: `${error}`,
        variant: "destructive",
      });
    },
  });

  const register = async (data: RegisterData) => {
    await registerMutation.mutateAsync(data);
  };

  const login = async (data: LoginData) => {
    await loginMutation.mutateAsync(data);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isLoading || registerMutation.isPending || loginMutation.isPending,
        register,
        login,
        logout,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
