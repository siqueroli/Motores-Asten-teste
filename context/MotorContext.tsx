import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Motor } from '../types';
import { INITIAL_MOTORS } from '../constants';

interface MotorContextType {
  motors: Motor[];
  addMotor: (motor: Motor) => void;
  updateMotor: (motor: Motor) => void;
  deleteMotor: (codigo: string) => void;
  importarMotoresCSV: (csvContent: string) => { success: boolean; message: string; count?: number };
}

const MotorContext = createContext<MotorContextType | undefined>(undefined);

export const MotorProvider = ({ children }: { children: ReactNode }) => {
  const [motors, setMotors] = useState<Motor[]>([]);

  // Carregar motores do localStorage ou usar os iniciais
  useEffect(() => {
    const storedMotors = localStorage.getItem('app_motors');
    if (storedMotors) {
      setMotors(JSON.parse(storedMotors));
    } else {
      setMotors(INITIAL_MOTORS);
      localStorage.setItem('app_motors', JSON.stringify(INITIAL_MOTORS));
    }
  }, []);

  const saveToStorage = (newMotors: Motor[]) => {
    setMotors(newMotors);
    localStorage.setItem('app_motors', JSON.stringify(newMotors));
  };

  const addMotor = (motor: Motor) => {
    // Verifica se já existe
    if (motors.some(m => m.codigo === motor.codigo)) {
      alert('Já existe um motor com este código!');
      return;
    }
    const newList = [...motors, motor];
    saveToStorage(newList);
  };

  const updateMotor = (updatedMotor: Motor) => {
    const newList = motors.map(m => m.codigo === updatedMotor.codigo ? updatedMotor : m);
    saveToStorage(newList);
  };

  const deleteMotor = (codigo: string) => {
    const newList = motors.filter(m => m.codigo !== codigo);
    saveToStorage(newList);
  };

  // Função robusta para ler CSV (aceita ; ou , como separador)
  const importarMotoresCSV = (csvContent: string) => {
    try {
      const lines = csvContent.split(/\r?\n/);
      // Remove linhas vazias
      const validLines = lines.filter(line => line.trim() !== '');
      
      if (validLines.length < 2) {
        return { success: false, message: 'O arquivo está vazio ou sem cabeçalho.' };
      }

      // Detecta separador na primeira linha (cabeçalho)
      const headerLine = validLines[0];
      const separator = headerLine.includes(';') ? ';' : ',';
      
      const newMotors: Motor[] = [];
      let errors = 0;

      // Começa do índice 1 para pular o cabeçalho
      for (let i = 1; i < validLines.length; i++) {
        const line = validLines[i];
        // Regex complexo para lidar com CSV, mas vamos usar split simples assumindo que não há separadores no texto
        // Para descrições com vírgula, o ideal seria usar aspas, mas vamos simplificar:
        const columns = line.split(separator);

        // Esperamos 5 colunas: codigo, modelo, descricao, estoque, precoBase
        if (columns.length < 5) {
          errors++;
          continue;
        }

        const codigo = columns[0].trim();
        const modelo = columns[1].trim();
        const descricao = columns[2].trim();
        // Remove R$, pontos de milhar e troca vírgula por ponto para converter numero
        const estoque = parseInt(columns[3].replace(/[^0-9]/g, '')) || 0;
        
        let precoString = columns[4].trim();
        // Lógica simples para limpar formatação monetária brasileira (1.000,00 -> 1000.00)
        precoString = precoString.replace('R$', '').trim();
        if (precoString.includes(',') && precoString.includes('.')) {
             // Caso: 1.200,50 -> Remove ponto, troca virgula por ponto
             precoString = precoString.replace(/\./g, '').replace(',', '.');
        } else if (precoString.includes(',')) {
             // Caso: 1200,50 -> Troca virgula por ponto
             precoString = precoString.replace(',', '.');
        }
        
        const precoBase = parseFloat(precoString) || 0;

        if (codigo && modelo) {
          newMotors.push({ codigo, modelo, descricao, estoque, precoBase });
        }
      }

      if (newMotors.length === 0) {
        return { success: false, message: 'Nenhum motor válido encontrado no arquivo.' };
      }

      // Substitui TUDO
      saveToStorage(newMotors);
      return { 
        success: true, 
        message: 'Importação concluída com sucesso!', 
        count: newMotors.length 
      };

    } catch (e) {
      console.error(e);
      return { success: false, message: 'Erro ao processar o arquivo CSV.' };
    }
  };

  return (
    <MotorContext.Provider value={{ motors, addMotor, updateMotor, deleteMotor, importarMotoresCSV }}>
      {children}
    </MotorContext.Provider>
  );
};

export const useMotors = () => {
  const context = useContext(MotorContext);
  if (context === undefined) {
    throw new Error('useMotors must be used within a MotorProvider');
  }
  return context;
};