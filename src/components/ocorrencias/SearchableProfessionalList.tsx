'use client';

import { useState, useEffect } from 'react';
import { Search, User, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase/client';
import { TipoPerfil } from '@/types';

interface Profissional {
  id: number;
  nome_completo: string;
  tipo_perfil: TipoPerfil;
  email: string;
}

interface SearchableProfessionalListProps {
  onSelect: (profissional: Profissional) => void;
  selectedId?: number;
}

export function SearchableProfessionalList({
  onSelect,
  selectedId,
}: SearchableProfessionalListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfissionais();
  }, []);

  const loadProfissionais = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome_completo, tipo_perfil, email')
        .in('tipo_perfil', [TipoPerfil.MEDICO, TipoPerfil.ENFERMEIRO])
        .eq('ativo', true)
        .order('nome_completo', { ascending: true });

      if (error) throw error;

      setProfissionais(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar profissionais:', err);
      setError('Erro ao carregar profissionais');
    } finally {
      setLoading(false);
    }
  };

  const filteredProfissionais = profissionais.filter((prof) =>
    prof.nome_completo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProfissionalLabel = (perfil: TipoPerfil): string => {
    switch (perfil) {
      case TipoPerfil.MEDICO:
        return 'Médico';
      case TipoPerfil.ENFERMEIRO:
        return 'Enfermeiro';
      default:
        return perfil;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Buscar profissional por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
        {filteredProfissionais.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {searchTerm
                ? 'Nenhum profissional encontrado'
                : 'Nenhum profissional disponível'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredProfissionais.map((prof) => (
              <button
                key={prof.id}
                type="button"
                onClick={() => onSelect(prof)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between ${
                  selectedId === prof.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      prof.tipo_perfil === TipoPerfil.MEDICO
                        ? 'bg-blue-100'
                        : 'bg-green-100'
                    }`}
                  >
                    <User
                      className={`w-5 h-5 ${
                        prof.tipo_perfil === TipoPerfil.MEDICO
                          ? 'text-blue-600'
                          : 'text-green-600'
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {prof.nome_completo}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getProfissionalLabel(prof.tipo_perfil)} • {prof.email}
                    </p>
                  </div>
                </div>
                {selectedId === prof.id && (
                  <Check className="w-5 h-5 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredProfissionais.length > 0 && (
        <p className="text-xs text-gray-500 text-center">
          {filteredProfissionais.length} profissional(is) encontrado(s)
        </p>
      )}
    </div>
  );
}
