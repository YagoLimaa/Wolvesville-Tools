import { useState } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { GradientButton } from "@/components/ui/gradient-button";
import { Search } from "lucide-react";

interface SearchFormProps {
  onSearch: (username: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  label?: string;
  buttonText?: string;
}

export const SearchForm = ({ 
  onSearch, 
  isLoading = false,
  placeholder = "Digite o nome...",
  label = "Nome:",
  buttonText = "Buscar"
}: SearchFormProps) => {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSearch(username.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="username" className="text-lg font-medium text-foreground">
          {label}
        </label>
        <SearchInput
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={placeholder}
          required
          disabled={isLoading}
        />
      </div>
      <GradientButton
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={isLoading || !username.trim()}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Buscando...
          </>
        ) : (
          <>
            <Search className="w-4 h-4 mr-2" />
            {buttonText}
          </>
        )}
      </GradientButton>
    </form>
  );
};