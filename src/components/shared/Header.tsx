/**
 * Componente de cabeçalho compartilhado
 *
 * Este componente será usado em todo o aplicativo para
 * fornecer navegação e informações do usuário.
 */

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Sistema de Gestão de Ambulâncias</h1>
        <nav>
          {/* Navegação será implementada aqui */}
        </nav>
      </div>
    </header>
  );
}
