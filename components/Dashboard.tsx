import React, { useState, useMemo, useRef } from 'react';
import { Search, X, Package, Tag, Calculator, MapPin, AlertCircle, Info, ChevronDown, UserPlus, ShieldCheck, Edit, Trash2, PlusCircle, Save, FileUp, Download, KeyRound, User as UserIcon, CheckCircle } from 'lucide-react';
import { TAX_RATES_BY_STATE } from '../constants';
import { Motor } from '../types';
import { useAuth } from '../context/AuthContext';
import { useMotors } from '../context/MotorContext';

export const Dashboard = () => {
  const { user, register, allUsers, removeUser, updateUserPassword } = useAuth();
  const { motors, addMotor, updateMotor, deleteMotor, importarMotoresCSV } = useMotors();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMotor, setSelectedMotor] = useState<Motor | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedUF, setSelectedUF] = useState('SP');

  // Estados do Admin Panel
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'products'>('products');
  
  // Estado cadastro usuario
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Estado gestão usuario (edição de senha)
  const [editingUserPass, setEditingUserPass] = useState<string | null>(null);
  const [newPassInput, setNewPassInput] = useState('');

  const [adminMsg, setAdminMsg] = useState<{type: 'success'|'error', text: string} | null>(null);

  // Estados cadastro/edição motor
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Motor>({
    codigo: '', modelo: '', descricao: '', estoque: 0, precoBase: 0
  });

  // Estado Importação CSV
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtro de busca
  const filteredMotors = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toUpperCase();
    return motors.filter(m => 
      m.codigo.includes(term) || m.modelo.toUpperCase().includes(term)
    );
  }, [searchTerm, motors]);

  // Cálculos financeiros
  const financialData = useMemo(() => {
    if (!selectedMotor) return null;
    
    const taxRate = TAX_RATES_BY_STATE[selectedUF] || 0;
    const taxValue = selectedMotor.precoBase * taxRate;
    const finalPrice = selectedMotor.precoBase + taxValue;

    return {
      base: selectedMotor.precoBase,
      taxRate: taxRate,
      taxValue: taxValue,
      total: finalPrice
    };
  }, [selectedMotor, selectedUF]);

  const handleSelect = (motor: Motor) => {
    setSelectedMotor(motor);
    setSearchTerm(`${motor.modelo} (${motor.codigo})`);
    setIsFocused(false);
    setIsEditing(false); // Fecha modo edição se selecionar outro
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSelectedMotor(null);
    setIsEditing(false);
  };

  // --- FUNÇÕES DE USUÁRIO ---

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;

    const success = register(newUsername, newPassword, false);
    
    if (success) {
        setAdminMsg({ type: 'success', text: `Usuário "${newUsername}" criado com sucesso!` });
        setNewUsername('');
        setNewPassword('');
        setTimeout(() => setAdminMsg(null), 3000);
    } else {
        setAdminMsg({ type: 'error', text: 'Erro: Usuário já existe.' });
        setTimeout(() => setAdminMsg(null), 3000);
    }
  };

  const handleDeleteUser = (usernameToDelete: string) => {
      if (usernameToDelete === 'admin') {
          alert("O administrador principal não pode ser excluído.");
          return;
      }
      if (confirm(`Tem certeza que deseja excluir o acesso de "${usernameToDelete}"?`)) {
          removeUser(usernameToDelete);
          setAdminMsg({ type: 'success', text: `Usuário "${usernameToDelete}" removido.` });
          setTimeout(() => setAdminMsg(null), 3000);
      }
  };

  const handleStartPassEdit = (username: string) => {
      setEditingUserPass(username);
      setNewPassInput('');
  };

  const handleSavePass = (username: string) => {
      if (!newPassInput) return;
      updateUserPassword(username, newPassInput);
      setAdminMsg({ type: 'success', text: `Senha de "${username}" alterada com sucesso.` });
      setEditingUserPass(null);
      setNewPassInput('');
      setTimeout(() => setAdminMsg(null), 3000);
  };

  // --- FUNÇÕES DE MOTOR ---

  const startEditing = () => {
    if (selectedMotor) {
        setEditForm(selectedMotor);
        setIsEditing(true);
        setShowAdminPanel(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const startCreating = () => {
      setSelectedMotor(null);
      setSearchTerm('');
      setEditForm({ codigo: '', modelo: '', descricao: '', estoque: 0, precoBase: 0 });
      setIsEditing(true);
      setShowAdminPanel(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveMotor = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Validação básica
      if (!editForm.codigo || !editForm.modelo) {
          alert("Código e Modelo são obrigatórios");
          return;
      }

      // Se existir o motor selecionado e o código for igual, é edição
      const isUpdate = motors.some(m => m.codigo === editForm.codigo);
      
      if (selectedMotor && selectedMotor.codigo === editForm.codigo) {
           updateMotor(editForm);
           setAdminMsg({ type: 'success', text: 'Motor atualizado com sucesso!' });
      } else if (isUpdate && (!selectedMotor || selectedMotor.codigo !== editForm.codigo)) {
           // Tentando criar ou editar para um código que já existe (mas não é o atual selecionado)
           if (!confirm("Já existe um motor com este código. Deseja sobrescrevê-lo?")) return;
           updateMotor(editForm);
           setAdminMsg({ type: 'success', text: 'Motor atualizado com sucesso!' });
      } else {
           addMotor(editForm);
           setAdminMsg({ type: 'success', text: 'Novo motor cadastrado!' });
      }

      setIsEditing(false);
      setSelectedMotor(editForm);
      setSearchTerm(`${editForm.modelo} (${editForm.codigo})`);
      setTimeout(() => setAdminMsg(null), 3000);
  };

  const handleDeleteMotor = () => {
      if (!selectedMotor) return;
      if (confirm(`Tem certeza que deseja excluir o motor ${selectedMotor.codigo}?`)) {
          deleteMotor(selectedMotor.codigo);
          clearSearch();
          setAdminMsg({ type: 'success', text: 'Motor excluído.' });
          setTimeout(() => setAdminMsg(null), 3000);
      }
  };

  // Funções CSV
  const handleDownloadTemplate = () => {
    const header = "codigo,modelo,descricao,estoque,precoBase\n";
    const example = "MTR-EX01,Exemplo Motor V8,Motor potente para testes,10,1500.00";
    const blob = new Blob([header + example], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo_importacao.csv';
    a.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const result = importarMotoresCSV(text);
      if (result.success) {
        setAdminMsg({ type: 'success', text: `${result.message} (${result.count} registros)` });
        clearSearch(); // Limpa seleção antiga pois os dados mudaram
      } else {
        setAdminMsg({ type: 'error', text: result.message });
      }
      setTimeout(() => setAdminMsg(null), 5000);
    };
    reader.readAsText(file);
    // Limpar input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatCurrency = (val: number) => 
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatPercent = (val: number) => 
    (val * 100).toFixed(1) + '%';

  return (
    <div className="w-full max-w-5xl flex flex-col items-center gap-8 animate-slide-up pb-10">
      
      {/* Cabeçalho */}
      <div className="text-center space-y-3 mb-2 animate-fade-in">
        <h2 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-500 to-teal-400 dark:from-white dark:via-blue-200 dark:to-teal-300 drop-shadow-sm">
          Consulta Técnica
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Sistema integrado de precificação e estoque. Selecione o estado de destino para cálculo automático de tributos.
        </p>
      </div>

      {/* --- ADMIN PANEL (Somente visível para Admin) --- */}
      {user?.role === 'admin' && (
        <div className="w-full max-w-3xl mb-4">
            <button 
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline mx-auto mb-4 bg-blue-50 dark:bg-gray-800 px-4 py-2 rounded-full border border-blue-200 dark:border-gray-700 transition-all hover:scale-105"
            >
                <ShieldCheck size={16} />
                {showAdminPanel ? 'Ocultar Painel Admin' : 'Painel do Administrador'}
            </button>

            {showAdminPanel && (
                <div className="bg-white dark:bg-gray-800 border-2 border-blue-500/30 rounded-xl shadow-xl animate-slide-up overflow-hidden">
                    
                    {/* Abas do Admin */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button 
                            onClick={() => setActiveTab('products')}
                            className={`flex-1 py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'products' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            <Package size={18} /> Gestão de Produtos
                        </button>
                        <button 
                            onClick={() => setActiveTab('users')}
                            className={`flex-1 py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'users' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            <UserPlus size={18} /> Gestão de Usuários
                        </button>
                    </div>

                    <div className="p-6">
                        {/* MENSAGEM DO SISTEMA */}
                        {adminMsg && (
                            <div className={`mb-4 p-3 rounded-lg text-sm text-center font-medium animate-pulse ${adminMsg.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                                {adminMsg.text}
                            </div>
                        )}

                        {/* TAB PRODUTOS */}
                        {activeTab === 'products' && (
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <button 
                                        onClick={startCreating}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-md transition-transform active:scale-95"
                                    >
                                        <PlusCircle size={16} /> Cadastrar Novo Motor
                                    </button>
                                </div>

                                {/* Seção Importação CSV */}
                                <div className="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                    <FileUp size={16} /> Importação em Massa (CSV)
                                  </h4>
                                  <p className="text-xs text-gray-500 mb-4">
                                    Substitua todo o banco de dados enviando um arquivo CSV atualizado.
                                  </p>
                                  <div className="flex flex-wrap gap-3 items-center">
                                    <input 
                                      type="file" 
                                      accept=".csv"
                                      ref={fileInputRef}
                                      onChange={handleFileUpload}
                                      className="block w-full text-sm text-slate-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100
                                        cursor-pointer
                                      "
                                    />
                                    <button 
                                      onClick={handleDownloadTemplate}
                                      className="text-xs flex items-center gap-1 text-blue-500 hover:underline"
                                    >
                                      <Download size={12} /> Baixar Modelo Exemplo
                                    </button>
                                  </div>
                                </div>

                                {isEditing && (
                                    <form onSubmit={handleSaveMotor} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-blue-200 dark:border-blue-900 animate-fade-in">
                                        <h4 className="font-bold text-gray-800 dark:text-white mb-3">
                                            {selectedMotor && selectedMotor.codigo === editForm.codigo ? 'Editar Motor' : 'Novo Motor'}
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-gray-500">Código *</label>
                                                <input required type="text" value={editForm.codigo} onChange={e => setEditForm({...editForm, codigo: e.target.value})} className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-700" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">Modelo *</label>
                                                <input required type="text" value={editForm.modelo} onChange={e => setEditForm({...editForm, modelo: e.target.value})} className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-700" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-xs text-gray-500">Descrição</label>
                                                <textarea value={editForm.descricao} onChange={e => setEditForm({...editForm, descricao: e.target.value})} className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-700" rows={2} />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">Estoque</label>
                                                <input type="number" value={editForm.estoque} onChange={e => setEditForm({...editForm, estoque: Number(e.target.value)})} className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-700" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">Preço Base (R$)</label>
                                                <input type="number" step="0.01" value={editForm.precoBase} onChange={e => setEditForm({...editForm, precoBase: Number(e.target.value)})} className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-700" />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-4 justify-end">
                                            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-500 text-sm hover:underline">Cancelar</button>
                                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 flex items-center gap-2">
                                                <Save size={16} /> Salvar
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* TAB USUÁRIOS */}
                        {activeTab === 'users' && (
                            <div className="space-y-8">
                                {/* Formulário de Cadastro */}
                                <form onSubmit={handleCreateUser} className="flex flex-col gap-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                    <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                                        <PlusCircle size={16} /> Criar Novo Acesso
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 ml-1 mb-1 block">Nome de Usuário</label>
                                            <input 
                                                type="text" 
                                                value={newUsername}
                                                onChange={(e) => setNewUsername(e.target.value)}
                                                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                                required
                                                placeholder="Ex: fernanda"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 ml-1 mb-1 block">Senha Inicial</label>
                                            <input 
                                                type="password" 
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        type="submit"
                                        className="w-full sm:w-auto self-end px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-500/30 text-sm"
                                    >
                                        Cadastrar
                                    </button>
                                </form>

                                {/* Lista de Usuários */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 pl-1">
                                        Usuários Ativos ({allUsers.length})
                                    </h4>
                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500 uppercase font-semibold text-xs">
                                                <tr>
                                                    <th className="px-4 py-3">Usuário</th>
                                                    <th className="px-4 py-3">Cargo</th>
                                                    <th className="px-4 py-3 text-right">Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {allUsers.map((u) => (
                                                    <tr key={u.username} className="hover:bg-white dark:hover:bg-gray-800 transition-colors">
                                                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                                            <div className={`p-1.5 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                                <UserIcon size={14} />
                                                            </div>
                                                            {u.username}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                                                {u.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            {u.role !== 'admin' && (
                                                                <div className="flex justify-end gap-2">
                                                                    {editingUserPass === u.username ? (
                                                                        <div className="flex items-center gap-2 animate-fade-in">
                                                                            <input 
                                                                                type="text" 
                                                                                placeholder="Nova senha..."
                                                                                value={newPassInput}
                                                                                onChange={(e) => setNewPassInput(e.target.value)}
                                                                                className="w-32 p-1.5 text-xs border rounded dark:bg-gray-800 dark:border-gray-600"
                                                                                autoFocus
                                                                            />
                                                                            <button onClick={() => handleSavePass(u.username)} className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600" title="Salvar">
                                                                                <CheckCircle size={14} />
                                                                            </button>
                                                                            <button onClick={() => setEditingUserPass(null)} className="p-1.5 bg-gray-300 text-gray-600 rounded hover:bg-gray-400" title="Cancelar">
                                                                                <X size={14} />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            <button 
                                                                                onClick={() => handleStartPassEdit(u.username)}
                                                                                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                                                                title="Alterar Senha"
                                                                            >
                                                                                <KeyRound size={16} />
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => handleDeleteUser(u.username)}
                                                                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                                                title="Excluir Usuário"
                                                                            >
                                                                                <Trash2 size={16} />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {u.role === 'admin' && <span className="text-xs text-gray-400 italic">Protegido</span>}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      )}

      {/* Área de Controles: Busca e UF */}
      <div className="flex flex-col md:flex-row gap-4 w-full max-w-3xl z-20">
        
        {/* Barra de Busca */}
        <div className="relative flex-grow">
          <div className={`
            relative flex items-center bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-all duration-300 border
            ${isFocused ? 'ring-4 ring-blue-500/20 border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}
          `}>
            <div className="pl-4 text-gray-400">
              <Search size={22} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                // Se eu editar o texto e já tinha algo selecionado, limpa a seleção para permitir nova busca
                if (selectedMotor) setSelectedMotor(null);
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder="Buscar por código ou modelo..."
              className="w-full py-3.5 px-3 bg-transparent outline-none text-lg text-gray-800 dark:text-white placeholder:text-gray-400 rounded-xl"
            />
            {searchTerm && (
              <button 
                onClick={clearSearch}
                className="p-2 mr-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Dropdown de Sugestões */}
          {isFocused && searchTerm && !selectedMotor && (
            <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden max-h-80 overflow-y-auto z-50 animate-fade-in">
              {filteredMotors.length > 0 ? (
                filteredMotors.map((motor) => (
                  <div
                    key={motor.codigo}
                    onClick={() => handleSelect(motor)}
                    className="p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {motor.modelo}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {motor.codigo}
                      </div>
                    </div>
                    <Tag size={16} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0" />
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center gap-2">
                  <AlertCircle size={28} className="opacity-50" />
                  <p>Nenhum resultado encontrado.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Seletor de UF */}
        <div className="relative min-w-[140px]">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10">
            <MapPin size={18} />
          </div>
          <select
            value={selectedUF}
            onChange={(e) => setSelectedUF(e.target.value)}
            className="w-full h-full appearance-none pl-10 pr-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-white font-medium focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer hover:border-blue-300 transition-all shadow-lg"
          >
            {Object.keys(TAX_RATES_BY_STATE).sort().map(uf => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Card de Detalhes do Produto */}
      {selectedMotor && financialData && (
        <div className="w-full max-w-4xl animate-slide-up mt-2 perspective-1000">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/50 dark:border-gray-700 rounded-3xl overflow-hidden shadow-2xl transform transition-transform duration-500">
            
            {/* Header do Produto */}
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-8 relative">
              
              {/* Controles de Admin no Card */}
              {user?.role === 'admin' && (
                  <div className="absolute top-4 right-4 flex gap-2 z-20">
                      <button onClick={startEditing} className="p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur text-blue-600 dark:text-blue-300 transition-all" title="Editar">
                          <Edit size={18} />
                      </button>
                      <button onClick={handleDeleteMotor} className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full backdrop-blur text-red-600 dark:text-red-300 transition-all" title="Excluir">
                          <Trash2 size={18} />
                      </button>
                  </div>
              )}

              <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-blue-500/30 tracking-wider">
                      {selectedMotor.codigo}
                    </span>
                    {selectedMotor.estoque < 5 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-red-500/30 animate-pulse">
                        ÚLTIMAS UNIDADES
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2 leading-tight">
                      {selectedMotor.modelo}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base border-l-4 border-blue-500 pl-4 mt-3">
                      {selectedMotor.descricao}
                    </p>
                  </div>
                </div>

                {/* Box de Estoque */}
                <div className="bg-white dark:bg-gray-700/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-600 flex flex-col items-center justify-center min-w-[120px] shadow-inner">
                  <Package className="text-blue-500 mb-1" size={24} />
                  <span className="text-sm text-gray-500 dark:text-gray-400 uppercase font-semibold text-xs tracking-widest">Estoque</span>
                  <span className="text-2xl font-bold text-gray-800 dark:text-white">{selectedMotor.estoque}</span>
                </div>
              </div>
            </div>

            {/* Painel Financeiro / Recibo */}
            <div className="p-8 bg-white dark:bg-gray-800">
              <div className="flex items-center gap-2 mb-6">
                <Calculator className="text-blue-500" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Composição do Preço</h3>
                <span className="ml-auto text-sm text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">
                  Estado Referência: <strong>{selectedUF}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Coluna 1: Preço Líquido */}
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 hover:border-blue-200 transition-colors">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Preço Líquido (Base)</div>
                  <div className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
                    {formatCurrency(financialData.base)}
                  </div>
                  <div className="mt-2 text-xs text-gray-400">Valor sem encargos</div>
                </div>

                {/* Coluna 2: Impostos */}
                <div className="p-5 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 hover:border-orange-200 transition-colors relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-orange-100 dark:bg-orange-500/10 rounded-full blur-xl"></div>
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">Imposto ({selectedUF})</div>
                    <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs px-2 py-0.5 rounded font-bold">
                      {formatPercent(financialData.taxRate)}
                    </span>
                  </div>
                  <div className="text-2xl font-semibold text-orange-700 dark:text-orange-300">
                    + {formatCurrency(financialData.taxValue)}
                  </div>
                  <div className="mt-2 text-xs text-orange-500/80 dark:text-orange-400/60">ICMS/Encargos Estaduais</div>
                </div>

                {/* Coluna 3: Preço Final */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 transform scale-105 md:scale-100 lg:scale-105 transition-transform ring-4 ring-white dark:ring-gray-800">
                  <div className="text-sm text-blue-100 mb-1 font-medium">Preço Final de Venda</div>
                  <div className="text-3xl font-bold tracking-tight">
                    {formatCurrency(financialData.total)}
                  </div>
                  <div className="mt-2 text-xs text-blue-200 flex items-center gap-1">
                    <Info size={12} />
                    Valor Bruto com Imposto
                  </div>
                </div>

              </div>

              {/* Barra de Progresso Visual do Imposto */}
              <div className="mt-8">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>Composição Visual</span>
                  <span>Total: 100%</span>
                </div>
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-slate-400 dark:bg-slate-500" 
                    style={{ width: `${(1 - financialData.taxRate) * 100}%` }}
                    title="Preço Base"
                  ></div>
                  <div 
                    className="h-full bg-orange-400 dark:bg-orange-500" 
                    style={{ width: `${financialData.taxRate * 100}%` }}
                    title="Imposto"
                  ></div>
                </div>
                <div className="flex gap-4 mt-2 justify-center">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500"></div>
                    Produto
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <div className="w-2 h-2 rounded-full bg-orange-400 dark:bg-orange-500"></div>
                    Imposto ({formatPercent(financialData.taxRate)})
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};