# 👤 Como Criar e Configurar o Usuário appuser na VPS

Este guia explica como criar o usuário `appuser` e definir sua senha na VPS.

---

## 🔑 Resposta Rápida: Qual é a Senha do appuser?

**O usuário `appuser` não existe por padrão!** Você precisa criá-lo primeiro e definir uma senha durante a criação ou depois.

---

## 📝 Passo a Passo: Criar Usuário appuser

### Opção 1: Criar com Senha Durante a Criação (Mais Simples)

```bash
# Conectar na VPS como root
ssh root@SEU_IP_VPS

# Criar usuário (você será solicitado a definir senha)
sudo adduser appuser

# Durante a criação, você será perguntado:
# - Senha: digite a senha desejada
# - Confirmar senha: digite novamente
# - Nome completo, etc.: pode deixar em branco pressionando Enter
```

### Opção 2: Criar sem Senha e Definir Depois

```bash
# Conectar na VPS como root
ssh root@SEU_IP_VPS

# Criar usuário sem senha
sudo adduser --disabled-password --gecos "" appuser

# Definir senha depois
sudo passwd appuser
# Você será solicitado a digitar a senha duas vezes
```

---

## 🔐 Como Definir/Alterar Senha do appuser

Se o usuário já existe mas você não sabe a senha ou quer alterá-la:

```bash
# Como root ou com sudo
sudo passwd appuser
```

Você será solicitado a:
1. Digitar a nova senha
2. Confirmar a nova senha

**⚠️ IMPORTANTE:** A senha não será exibida na tela por segurança.

---

## ✅ Verificar se o Usuário Existe

```bash
# Verificar se o usuário existe
id appuser

# Se o usuário existir, mostrará algo como:
# uid=1001(appuser) gid=1001(appuser) groups=1001(appuser)

# Se não existir, mostrará:
# id: 'appuser': no such user
```

---

## 🛠️ Configuração Completa do appuser

Após criar o usuário, configure as permissões:

```bash
# Criar diretório da aplicação
sudo mkdir -p /var/www

# Dar propriedade ao appuser
sudo chown -R appuser:appuser /var/www

# Verificar permissões
ls -la /var/www
```

---

## 🔒 Adicionar appuser ao Grupo sudo (Opcional)

Se você quiser que o appuser possa executar comandos com sudo:

```bash
sudo usermod -aG sudo appuser

# Testar (como appuser)
su - appuser
sudo whoami  # Deve mostrar "root"
```

**⚠️ CUIDADO:** Dar acesso sudo ao appuser pode ser um risco de segurança. Use apenas se necessário.

---

## 🧪 Testar Conexão com appuser

```bash
# Do seu computador Windows
ssh appuser@SEU_IP_VPS

# Você será solicitado a digitar a senha que definiu
```

---

## 🆘 Problemas Comuns

### Problema: "Permission denied" ao conectar

**Causas possíveis:**
1. Senha incorreta
2. Usuário não existe
3. SSH não permite login por senha

**Soluções:**

```bash
# Verificar se usuário existe
id appuser

# Verificar configuração SSH (como root)
sudo nano /etc/ssh/sshd_config

# Certifique-se de que estas linhas estão assim:
# PasswordAuthentication yes
# PermitRootLogin yes  (ou no, dependendo da sua preferência)

# Reiniciar SSH
sudo systemctl restart sshd
```

### Problema: "This account is currently not available"

**Causa:** Usuário foi criado com `--disabled-password` e não tem shell válido.

**Solução:**

```bash
# Definir shell para o usuário
sudo usermod -s /bin/bash appuser

# Definir senha
sudo passwd appuser
```

---

## 📋 Checklist

- [ ] Usuário `appuser` criado
- [ ] Senha definida para `appuser`
- [ ] Diretório `/var/www` criado
- [ ] Permissões configuradas (`chown appuser:appuser /var/www`)
- [ ] Conexão SSH testada com `ssh appuser@SEU_IP_VPS`
- [ ] Script de transferência funciona

---

## 💡 Dica de Segurança

**Recomendação:** Após configurar tudo, configure autenticação por chave SSH e desabilite login por senha:

```bash
# Desabilitar login por senha (após configurar chave SSH)
sudo nano /etc/ssh/sshd_config

# Alterar:
PasswordAuthentication no

# Reiniciar SSH
sudo systemctl restart sshd
```

Isso aumenta a segurança da sua VPS.

---

## 🎯 Resumo

1. **Criar usuário:** `sudo adduser appuser` (ou `sudo adduser --disabled-password appuser`)
2. **Definir senha:** `sudo passwd appuser`
3. **Configurar permissões:** `sudo chown -R appuser:appuser /var/www`
4. **Testar:** `ssh appuser@SEU_IP_VPS`

**✅ Pronto!** Agora você pode usar o usuário `appuser` para transferir arquivos e executar a aplicação.
