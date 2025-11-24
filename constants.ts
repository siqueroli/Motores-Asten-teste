import { Motor, User } from './types';

// Tabela de Impostos por Estado (Simulação de ICMS/Impostos Internos)
export const TAX_RATES_BY_STATE: Record<string, number> = {
  'AC': 0.17, 'AL': 0.18, 'AP': 0.18, 'AM': 0.18, 'BA': 0.18,
  'CE': 0.18, 'DF': 0.18, 'ES': 0.17, 'GO': 0.17, 'MA': 0.18,
  'MT': 0.17, 'MS': 0.17, 'MG': 0.18, 'PA': 0.17, 'PB': 0.18,
  'PR': 0.19, 'PE': 0.18, 'PI': 0.18, 'RJ': 0.20, 'RN': 0.18,
  'RS': 0.17, 'RO': 0.175, 'RR': 0.17, 'SC': 0.12, 'SP': 0.18,
  'SE': 0.18, 'TO': 0.18
};

// Simulando o banco de dados
export const INITIAL_MOTORS: Motor[] = [
  {
    codigo: 'MTR-001',
    modelo: 'Motor Padrão V8',
    descricao: 'Motor de combustão interna V8, ideal para veículos de passeio de médio porte. Alta durabilidade e manutenção simplificada.',
    estoque: 15,
    precoBase: 1200.00,
  },
  {
    codigo: 'MTR-05910-A',
    modelo: 'Motor Especial 059 (Tipo A)',
    descricao: 'Unidade de alta performance para maquinário industrial leve. Possui sistema de arrefecimento reforçado.',
    estoque: 8,
    precoBase: 3100.00,
  },
  {
    codigo: 'MTR-05923-B',
    modelo: 'Motor Especial 059 (Tipo B)',
    descricao: 'Variação do Tipo A com torque ampliado para operações de carga. Revestimento anticorrosivo incluído.',
    estoque: 12,
    precoBase: 3350.00,
  },
  {
    codigo: 'MTR-05980-C',
    modelo: 'Motor Turbo 059 (Tipo C)',
    descricao: 'Versão turboalimentada da série 059. Entrega potência máxima instantânea. Requer lubrificantes sintéticos.',
    estoque: 3,
    precoBase: 3900.00,
  },
  {
    codigo: 'MTR-003',
    modelo: 'Motor Elétrico 100kW',
    descricao: 'Propulsor 100% elétrico de alta eficiência energética (98%). Silencioso e zero emissões.',
    estoque: 22,
    precoBase: 4950.00,
  }
];

export const ADMIN_USER: User = {
  username: 'admin',
  role: 'admin'
};