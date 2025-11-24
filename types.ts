export interface Motor {
  codigo: string;
  modelo: string;
  descricao: string;
  estoque: number;
  precoBase: number; // Preço Líquido antes dos impostos
  imagem?: string; // Opcional para futuro
}

export interface User {
  username: string;
  password?: string;
  role: 'admin' | 'user';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface TaxState {
  uf: string;
  rate: number;
}

export interface AuthContextType extends AuthState {
  login: (username: string, pass: string) => boolean;
  register: (username: string, pass: string, autoLogin?: boolean) => boolean;
  logout: () => void;
  // Novas funcionalidades de gestão
  allUsers: User[];
  removeUser: (username: string) => void;
  updateUserPassword: (username: string, newPass: string) => void;
}