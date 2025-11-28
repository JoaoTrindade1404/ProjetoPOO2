import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { useLibrary } from "@/contexts/LibraryContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Shield, LogOut, Wallet, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { userAPI } from "@/services/springboot-api";

const Account = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signOut, updateUser } = useAuth();
  const { balance, addBalance, refreshBalance, loading: walletLoading } = useWallet();
  const { libraryGames } = useLibrary();

  useEffect(() => {
    console.log('🏠 Account.useEffect - Component mounted, user:', user?.id);
    
    if (user?.id) {
      console.log('🔄 Account.useEffect - Refreshing balance for user:', user.id);
      refreshBalance();
    } else {
      console.log('❌ Account.useEffect - No user found, cannot refresh balance');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.nome || "Usuário",
    email: user?.email || ""
  });

  useEffect(() => {
    if (user) {
      setPersonalInfo({
        fullName: user.nome || "Usuário",
        email: user.email || ""
      });
    }
  }, [user]);

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });


  const [addBalanceAmount, setAddBalanceAmount] = useState("");

  const handleSavePersonalInfo = async () => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado",
        variant: "destructive",
      });
      return;
    }

    if (!personalInfo.fullName || !personalInfo.email) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedUser = await userAPI.update(user.id, {
        nome: personalInfo.fullName,
        email: personalInfo.email,
      });

      updateUser(updatedUser);
      toast({
        title: "Sucesso!",
        description: "Informações pessoais atualizadas",
      });
    } catch (error: any) {
      console.error("Erro ao atualizar informações:", error);
      toast({
        title: "Erro",
        description: error?.message || "Erro ao atualizar informações pessoais",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePassword = async () => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado",
        variant: "destructive",
      });
      return;
    }

    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos de senha",
        variant: "destructive",
      });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (passwords.new.length < 3) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 3 caracteres",
        variant: "destructive",
      });
      return;
    }

    try {
      await userAPI.changePassword(user.id, passwords.current, passwords.new);
      toast({
        title: "Sucesso!",
        description: "Senha atualizada com sucesso",
      });
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error: any) {
      console.error("Erro ao atualizar senha:", error);
      toast({
        title: "Erro",
        description: error?.message || "Erro ao atualizar senha. Verifique se a senha atual está correta.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
    navigate('/auth');
  };

  const handleAddBalance = async () => {
    const amount = parseFloat(addBalanceAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Valor inválido",
        description: "Digite um valor válido maior que zero",
        variant: "destructive",
      });
      return;
    }

    await addBalance(amount);
    setAddBalanceAmount("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <div className="glass-card rounded-xl p-8">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-4xl font-bold">
                {user?.nome?.substring(0, 2).toUpperCase() || "US"}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{user?.nome || "Usuário"}</h1>
                <p className="text-muted-foreground mb-4">{user?.email}</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <Badge className="gradient-primary">
                    <Wallet className="h-3 w-3 mr-1" />
                    Saldo: R$ {(user?.saldo || balance).toFixed(2)}
                  </Badge>
                  <Badge variant="outline">{libraryGames.length} jogos na biblioteca</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Wallet / Carteira */}
            <Card className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                  <Wallet className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold">Carteira</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg border border-primary/30">
                  <div className="text-sm text-muted-foreground mb-1">Saldo Disponível</div>
                  <div className="text-3xl font-bold text-primary">
                    R$ {(user?.saldo || balance).toFixed(2)}
                  </div>
                </div>
                
                <div>
                  <Label>Adicionar Saldo</Label>
                  <div className="flex gap-2 mt-2">
                    <Input 
                      type="number"
                      placeholder="0.00"
                      value={addBalanceAmount}
                      onChange={(e) => setAddBalanceAmount(e.target.value)}
                      className="bg-secondary/50"
                      min="0"
                      step="0.01"
                    />
                    <Button 
                      onClick={handleAddBalance}
                      disabled={walletLoading}
                      className="gradient-primary"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Use seu saldo para comprar jogos na loja
                  </p>
                </div>
              </div>
            </Card>

            {/* Personal Info */}
            <Card className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold">Informações Pessoais</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Nome Completo</Label>
                  <Input 
                    value={personalInfo.fullName}
                    onChange={(e) => setPersonalInfo({...personalInfo, fullName: e.target.value})}
                    className="bg-secondary/50" 
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                    className="bg-secondary/50" 
                  />
                </div>
              </div>
              
              <Button onClick={handleSavePersonalInfo} className="w-full gradient-primary">
                Salvar Alterações
              </Button>
            </Card>

            {/* Security */}
            <Card className="glass-card p-6 space-y-4 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                  <Shield className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold">Segurança</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Senha Atual</Label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={passwords.current}
                    onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                    className="bg-secondary/50" 
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nova Senha</Label>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                      className="bg-secondary/50" 
                    />
                  </div>
                  <div>
                    <Label>Confirmar Nova Senha</Label>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                      className="bg-secondary/50" 
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={handleUpdatePassword} className="w-full gradient-primary">
                Atualizar Senha
              </Button>
            </Card>

          </div>

          {/* Logout Button */}
          <Card className="glass-card p-6">
            <Button variant="destructive" className="w-full" size="lg" onClick={handleSignOut}>
              <LogOut className="mr-2 h-5 w-5" />
              Sair da Conta
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Account;
